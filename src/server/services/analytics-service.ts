import { prisma } from "@/lib/db";

export async function trackEvent(input: {
  userId?: string;
  lessonId?: string;
  moduleId?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.analyticsEvent.create({
    data: {
      userId: input.userId,
      lessonId: input.lessonId,
      moduleId: input.moduleId,
      eventType: input.eventType,
      metadata: JSON.stringify(input.metadata ?? {}),
    },
  });
}

export async function getAnalyticsOverview() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [activeUsers, completions, quizAttempts, dropOff] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.progress.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { score: true, maxScore: true },
    }),
    prisma.progress.count({
      where: {
        status: "IN_PROGRESS",
        lastSeenAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  const averageQuizScore7d =
    quizAttempts.length === 0
      ? 0
      : Math.round(
          (quizAttempts.reduce((acc, attempt) => {
            const percentage = attempt.maxScore > 0 ? attempt.score / attempt.maxScore : 0;
            return acc + percentage * 100;
          }, 0) /
            quizAttempts.length) *
            100,
        ) / 100;

  return {
    activeUsers7d: activeUsers.filter((event) => event.userId).length,
    lessonCompletions7d: completions,
    averageQuizScore7d,
    dropOffCount7d: dropOff,
  };
}
