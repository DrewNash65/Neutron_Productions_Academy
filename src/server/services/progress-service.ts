import { prisma } from "@/lib/db";

export async function upsertProgress(input: {
  userId: string;
  lessonId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  percent: number;
}) {
  const completedAt = input.status === "COMPLETED" ? new Date() : null;

  return prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId: input.userId,
        lessonId: input.lessonId,
      },
    },
    create: {
      userId: input.userId,
      lessonId: input.lessonId,
      status: input.status,
      percent: input.percent,
      lastSeenAt: new Date(),
      completedAt,
    },
    update: {
      status: input.status,
      percent: input.percent,
      lastSeenAt: new Date(),
      completedAt,
    },
  });
}

export async function getUserStreak(userId: string) {
  const recentCompletions = await prisma.progress.findMany({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: { not: null },
    },
    orderBy: {
      completedAt: "desc",
    },
    take: 30,
  });

  const daySet = new Set(
    recentCompletions
      .map((progress) => progress.completedAt)
      .filter(Boolean)
      .map((date) => new Date(date as Date).toISOString().slice(0, 10)),
  );

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daySet.has(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
