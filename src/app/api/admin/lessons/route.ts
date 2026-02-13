import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { validateCsrfOrigin } from "@/lib/csrf";
import { adminLessonSchema } from "@/lib/validation";

export async function GET() {
  const session = await getAuthSession();

  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const lessons = await prisma.lesson.findMany({
    include: {
      module: { select: { title: true, slug: true } },
      _count: { select: { exercises: true, quizQuestions: true } },
    },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
  });

  return NextResponse.json({ lessons }, { status: 200 });
}

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const session = await getAuthSession();

  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = adminLessonSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const { lessonId, tags, ...rest } = parsed.data;
  const data = { ...rest, tags: JSON.stringify(tags) };

  if (lessonId) {
    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    await prisma.adminAuditLog.create({
      data: {
        actorId: session!.user.id,
        action: "UPDATE_LESSON",
        entityType: "Lesson",
        entityId: updated.id,
        payload: JSON.stringify({ title: data.title, slug: data.slug, published: data.published }),
      },
    });

    return NextResponse.json({ lesson: updated }, { status: 200 });
  }

  // Get the next order index
  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId: data.moduleId },
    orderBy: { orderIndex: "desc" },
  });

  const created = await prisma.lesson.create({
    data: {
      ...data,
      orderIndex: (lastLesson?.orderIndex ?? 0) + 1,
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: session!.user.id,
      action: "CREATE_LESSON",
      entityType: "Lesson",
      entityId: created.id,
      payload: JSON.stringify({ title: data.title, slug: data.slug }),
    },
  });

  return NextResponse.json({ lesson: created }, { status: 201 });
}
