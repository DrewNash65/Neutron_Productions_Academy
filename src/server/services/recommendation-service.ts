import { prisma } from "@/lib/db";
import { chooseRecommendation } from "@/lib/recommendations";

export async function calculateAndStoreRecommendation(userId: string) {
  const [profile, lessons, quizAttempts, attempts] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.lesson.findMany({
      where: { published: true, module: { published: true, track: "WEB" } },
      include: {
        module: true,
        progress: {
          where: { userId },
          select: { percent: true, status: true },
        },
        prerequisites: {
          include: {
            prerequisiteLesson: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { exercise: { select: { lessonId: true } } },
    }),
  ]);

  const quizMap = new Map<string, { score: number; maxScore: number }>();
  for (const attempt of quizAttempts) {
    if (!quizMap.has(attempt.lessonId)) {
      quizMap.set(attempt.lessonId, { score: attempt.score, maxScore: attempt.maxScore });
    }
  }

  const failedAttemptCounts = new Map<string, number>();
  for (const attempt of attempts) {
    if (attempt.result !== "PASS") {
      const lessonId = attempt.exercise.lessonId;
      failedAttemptCounts.set(lessonId, (failedAttemptCounts.get(lessonId) ?? 0) + 1);
    }
  }

  const goalsRaw = profile?.goals ?? "[]";
  const goalKeywords: string[] = (typeof goalsRaw === "string" ? JSON.parse(goalsRaw) : goalsRaw).map((g: string) => g.toLowerCase());

  const recommendation = chooseRecommendation({
    weeklyTimeCommitmentH: profile?.weeklyTimeCommitmentH ?? 3,
    lessons: lessons.map((lesson, index) => {
      const latestQuiz = quizMap.get(lesson.id);
      const quizScoreRatio = latestQuiz && latestQuiz.maxScore > 0 ? latestQuiz.score / latestQuiz.maxScore : 0;
      const failedAttempts = failedAttemptCounts.get(lesson.id) ?? 0;
      const tagsArray: string[] = typeof lesson.tags === "string" ? JSON.parse(lesson.tags) : lesson.tags;
      const goalsOverlapScore = tagsArray.reduce((acc: number, tag: string) => {
        return goalKeywords.some((goal: string) => goal.includes(tag.toLowerCase()) || tag.toLowerCase().includes(goal))
          ? acc + 1
          : acc;
      }, 0);

      return {
        lessonId: lesson.id,
        title: lesson.title,
        moduleId: lesson.moduleId,
        orderIndex: index,
        prerequisites: lesson.prerequisites.map((pr) => pr.prerequisiteLesson.id),
        completed: lesson.progress[0]?.status === "COMPLETED",
        completionPercent: lesson.progress[0]?.percent ?? 0,
        quizScoreRatio,
        failedAttempts,
        goalsOverlapScore,
      };
    }),
  });

  const snapshot = await prisma.recommendationSnapshot.create({
    data: {
      userId,
      lessonId: recommendation.lessonId,
      moduleId: recommendation.moduleId,
      reason: recommendation.reason,
      personalizedPath: JSON.stringify(recommendation.personalizedPath),
    },
  });

  return snapshot;
}

export async function getLatestRecommendation(userId: string) {
  return prisma.recommendationSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      lesson: {
        select: { id: true, slug: true, title: true },
      },
      module: {
        select: { id: true, slug: true, title: true },
      },
    },
  });
}
