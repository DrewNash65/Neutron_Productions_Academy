import { prisma } from "@/lib/db";

const BADGE_DEFINITIONS = [
  {
    code: "FIRST_LESSON",
    title: "First Steps",
    description: "Completed your first lesson",
    icon: "🎯",
    check: async (userId: string) => {
      const count = await prisma.progress.count({
        where: { userId, status: "COMPLETED" },
      });
      return count >= 1;
    },
  },
  {
    code: "MODULE_1_COMPLETE",
    title: "Logic Master",
    description: "Completed Module 1: Computer Thinking + Logic",
    icon: "🧠",
    check: async (userId: string) => {
      const module = await prisma.module.findFirst({
        where: { orderIndex: 1 },
        include: { lessons: { include: { progress: { where: { userId } } } } },
      });
      if (!module) return false;
      return module.lessons.every((l) => l.progress.some((p) => p.status === "COMPLETED"));
    },
  },
  {
    code: "MODULE_2_COMPLETE",
    title: "Web Builder",
    description: "Completed Module 2: Web Basics",
    icon: "🌐",
    check: async (userId: string) => {
      const module = await prisma.module.findFirst({
        where: { orderIndex: 2 },
        include: { lessons: { include: { progress: { where: { userId } } } } },
      });
      if (!module) return false;
      return module.lessons.every((l) => l.progress.some((p) => p.status === "COMPLETED"));
    },
  },
  {
    code: "MODULE_3_COMPLETE",
    title: "JavaScript Ninja",
    description: "Completed Module 3: JavaScript Fundamentals",
    icon: "⚡",
    check: async (userId: string) => {
      const module = await prisma.module.findFirst({
        where: { orderIndex: 3 },
        include: { lessons: { include: { progress: { where: { userId } } } } },
      });
      if (!module) return false;
      return module.lessons.every((l) => l.progress.some((p) => p.status === "COMPLETED"));
    },
  },
  {
    code: "FIVE_LESSONS",
    title: "Getting Started",
    description: "Completed 5 lessons",
    icon: "🌟",
    check: async (userId: string) => {
      const count = await prisma.progress.count({
        where: { userId, status: "COMPLETED" },
      });
      return count >= 5;
    },
  },
  {
    code: "TEN_LESSONS",
    title: "Dedicated Learner",
    description: "Completed 10 lessons",
    icon: "🏆",
    check: async (userId: string) => {
      const count = await prisma.progress.count({
        where: { userId, status: "COMPLETED" },
      });
      return count >= 10;
    },
  },
  {
    code: "STREAK_3",
    title: "Streak Starter",
    description: "3-day learning streak",
    icon: "🔥",
    check: async (userId: string) => {
      const { getUserStreak } = await import("@/server/services/progress-service");
      return (await getUserStreak(userId)) >= 3;
    },
  },
  {
    code: "STREAK_7",
    title: "Week Warrior",
    description: "7-day learning streak",
    icon: "💪",
    check: async (userId: string) => {
      const { getUserStreak } = await import("@/server/services/progress-service");
      return (await getUserStreak(userId)) >= 7;
    },
  },
  {
    code: "QUIZ_PERFECT",
    title: "Perfect Score",
    description: "Got 100% on a quiz",
    icon: "💯",
    check: async (userId: string) => {
      const attempt = await prisma.quizAttempt.findFirst({
        where: { userId, passed: true },
        orderBy: { createdAt: "desc" },
      });
      return attempt ? attempt.score === attempt.maxScore && attempt.maxScore > 0 : false;
    },
  },
];

/**
 * Check and award any new badges for a user.
 * Called after lesson completion, quiz submission, etc.
 */
export async function checkAndAwardBadges(userId: string) {
  // Ensure badge definitions exist in DB
  for (const def of BADGE_DEFINITIONS) {
    await prisma.badgeDefinition.upsert({
      where: { code: def.code },
      create: {
        code: def.code,
        title: def.title,
        description: def.description,
        icon: def.icon,
      },
      update: {},
    });
  }

  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const earnedCodes = new Set(existingBadges.map((ub) => ub.badge.code));
  const newlyAwarded: string[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earnedCodes.has(def.code)) continue;

    const earned = await def.check(userId);

    if (earned) {
      const badgeDef = await prisma.badgeDefinition.findUnique({ where: { code: def.code } });
      if (badgeDef) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badgeDef.id },
        });
        newlyAwarded.push(def.code);
      }
    }
  }

  return newlyAwarded;
}

export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
}
