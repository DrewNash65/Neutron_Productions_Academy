import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { validateCsrfOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const session = await getAuthSession();

  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { entityType, entityId, published } = body;

  if (!entityType || !entityId || typeof published !== "boolean") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  if (entityType === "module") {
    await prisma.module.update({
      where: { id: entityId },
      data: { published },
    });
  } else if (entityType === "lesson") {
    await prisma.lesson.update({
      where: { id: entityId },
      data: { published },
    });
  } else {
    return NextResponse.json({ message: "Unknown entity type" }, { status: 400 });
  }

  await prisma.adminAuditLog.create({
    data: {
      actorId: session!.user.id,
      action: published ? "PUBLISH" : "UNPUBLISH",
      entityType,
      entityId,
      payload: JSON.stringify({ published }),
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
