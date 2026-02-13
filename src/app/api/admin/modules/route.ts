import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { validateCsrfOrigin } from "@/lib/csrf";
import { adminModuleSchema } from "@/lib/validation";

export async function GET() {
  const session = await getAuthSession();

  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const modules = await prisma.module.findMany({
    include: {
      _count: { select: { lessons: true } },
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ modules }, { status: 200 });
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
  const parsed = adminModuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const { moduleId, ...data } = parsed.data;

  if (moduleId) {
    const updated = await prisma.module.update({
      where: { id: moduleId },
      data,
    });

    await prisma.adminAuditLog.create({
      data: {
        actorId: session!.user.id,
        action: "UPDATE_MODULE",
        entityType: "Module",
        entityId: updated.id,
        payload: JSON.stringify(data),
      },
    });

    return NextResponse.json({ module: updated }, { status: 200 });
  }

  const created = await prisma.module.create({ data });

  await prisma.adminAuditLog.create({
    data: {
      actorId: session!.user.id,
      action: "CREATE_MODULE",
      entityType: "Module",
      entityId: created.id,
      payload: JSON.stringify(data),
    },
  });

  return NextResponse.json({ module: created }, { status: 201 });
}
