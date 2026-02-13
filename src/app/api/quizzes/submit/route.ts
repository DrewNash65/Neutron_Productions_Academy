import { NextResponse, type NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/csrf";
import { quizSubmitSchema } from "@/lib/validation";
import { gradeQuiz, saveQuizAttempt } from "@/server/services/quiz-service";
import { trackEvent } from "@/server/services/analytics-service";

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = quizSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const gradeResult = await gradeQuiz(parsed.data.lessonId, parsed.data.answers);

  await saveQuizAttempt({
    userId: session.user.id,
    lessonId: parsed.data.lessonId,
    score: gradeResult.score,
    maxScore: gradeResult.maxScore,
    passed: gradeResult.passed,
    answers: parsed.data.answers,
  });

  await trackEvent({
    userId: session.user.id,
    lessonId: parsed.data.lessonId,
    eventType: "QUIZ_SUBMITTED",
    metadata: { score: gradeResult.score, maxScore: gradeResult.maxScore, passed: gradeResult.passed },
  });

  // Transform results into the shape the client QuizBlock expects
  const feedback: Record<string, { isCorrect: boolean; explanation: string }> = {};
  for (const item of gradeResult.results) {
    feedback[item.questionId] = {
      isCorrect: item.correct,
      explanation: item.explanation ?? "",
    };
  }

  const clientPayload = {
    score: gradeResult.score,
    total: gradeResult.maxScore,
    passed: gradeResult.passed,
    feedback,
  };

  return NextResponse.json(clientPayload, { status: 200 });
}
