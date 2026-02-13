import { NextResponse, type NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/csrf";
import { progressSchema } from "@/lib/validation";
import { upsertProgress } from "@/server/services/progress-service";
import { trackEvent } from "@/server/services/analytics-service";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = progressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.status === "COMPLETED") {
    const quizQuestionCount = await prisma.quizQuestion.count({
      where: { lessonId: parsed.data.lessonId },
    });

    if (quizQuestionCount > 0) {
      const passedAttempt = await prisma.quizAttempt.findFirst({
        where: {
          lessonId: parsed.data.lessonId,
          userId: session.user.id,
          passed: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!passedAttempt) {
        return NextResponse.json(
          { message: "Pass the quiz with at least 80% before completing this lesson." },
          { status: 400 },
        );
      }
    }
  }

  const progress = await upsertProgress({
    userId: session.user.id,
    lessonId: parsed.data.lessonId,
    status: parsed.data.status,
    percent: parsed.data.percent,
  });

  // Track analytics event
  if (parsed.data.status === "COMPLETED") {
    await trackEvent({
      userId: session.user.id,
      lessonId: parsed.data.lessonId,
      eventType: "LESSON_COMPLETED",
    });
  } else if (parsed.data.status === "IN_PROGRESS") {
    await trackEvent({
      userId: session.user.id,
      lessonId: parsed.data.lessonId,
      eventType: "LESSON_STARTED",
    });
  }

  return NextResponse.json({ progress }, { status: 200 });
}
