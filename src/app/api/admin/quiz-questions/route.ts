import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { validateCsrfOrigin } from "@/lib/csrf";
import { adminQuizQuestionSchema, adminDeleteQuizQuestionSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();

  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  const where = lessonId ? { lessonId } : {};

  const questions = await prisma.quizQuestion.findMany({
    where,
    include: {
      lesson: { select: { title: true, slug: true } },
    },
    orderBy: [{ lesson: { orderIndex: "asc" } }, { orderIndex: "asc" }],
  });

  return NextResponse.json({ questions }, { status: 200 });
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
  const parsed = adminQuizQuestionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const { questionId, options, ...rest } = parsed.data;
  const data = {
    ...rest,
    options: options ? JSON.stringify(options) : null,
  };

  if (questionId) {
    const updated = await prisma.quizQuestion.update({
      where: { id: questionId },
      data,
    });

    await prisma.adminAuditLog.create({
      data: {
        actorId: session!.user.id,
        action: "UPDATE_QUIZ_QUESTION",
        entityType: "QuizQuestion",
        entityId: updated.id,
        payload: JSON.stringify({ question: data.question, lessonId: data.lessonId }),
      },
    });

    return NextResponse.json({ question: updated }, { status: 200 });
  }

  const created = await prisma.quizQuestion.create({ data });

  await prisma.adminAuditLog.create({
    data: {
      actorId: session!.user.id,
      action: "CREATE_QUIZ_QUESTION",
      entityType: "QuizQuestion",
      entityId: created.id,
      payload: JSON.stringify({ question: data.question, lessonId: data.lessonId }),
    },
  });

  return NextResponse.json({ question: created }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const session = await getAuthSession();

  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = adminDeleteQuizQuestionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.quizQuestion.findUnique({
    where: { id: parsed.data.questionId },
  });

  if (!existing) {
    return NextResponse.json({ message: "Question not found" }, { status: 404 });
  }

  await prisma.quizQuestion.delete({
    where: { id: parsed.data.questionId },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorId: session!.user.id,
      action: "DELETE_QUIZ_QUESTION",
      entityType: "QuizQuestion",
      entityId: parsed.data.questionId,
      payload: JSON.stringify({ question: existing.question, lessonId: existing.lessonId }),
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
