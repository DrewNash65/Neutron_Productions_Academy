import { prisma } from "@/lib/db";

export const QUIZ_PASSING_SCORE_RATIO = 0.8;
export const QUIZ_PASSING_SCORE_PERCENT = Math.round(QUIZ_PASSING_SCORE_RATIO * 100);

export async function gradeQuiz(lessonId: string, answers: Record<string, string>) {
  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId },
    orderBy: { orderIndex: "asc" },
  });

  let score = 0;

  const results = questions.map((question) => {
    const response = answers[question.id] ?? "";
    const correct = response.trim() === question.correctAnswer.trim();
    if (correct) {
      score += 1;
    }

    return {
      questionId: question.id,
      response,
      correct,
      explanation: question.explanation,
    };
  });

  return {
    score,
    maxScore: questions.length,
    passed: questions.length > 0 ? score / questions.length >= QUIZ_PASSING_SCORE_RATIO : false,
    results,
  };
}

export async function saveQuizAttempt(input: {
  userId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<string, string>;
}) {
  return prisma.quizAttempt.create({
    data: {
      userId: input.userId,
      lessonId: input.lessonId,
      score: input.score,
      maxScore: input.maxScore,
      passed: input.passed,
      answers: JSON.stringify(input.answers),
    },
  });
}
