import { prisma } from "@/lib/db";

export async function getPublishedModulesWithProgress(userId: string) {
  const modules = await prisma.module.findMany({
    where: { published: true, track: "WEB" },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
        include: {
          progress: {
            where: { userId },
            select: { percent: true, status: true },
          },
        },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  return modules.map((module) => {
    const lessonCount = module.lessons.length;
    const completedLessons = module.lessons.filter((lesson) => lesson.progress[0]?.status === "COMPLETED").length;
    const totalPercent = module.lessons.reduce((acc, lesson) => acc + (lesson.progress[0]?.percent ?? 0), 0);

    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      published: module.published,
      comingSoon: module.comingSoon,
      lessonCount,
      completedLessons,
      percentComplete: lessonCount > 0 ? Math.round(totalPercent / lessonCount) : 0,
    };
  });
}

export async function getModuleBySlugForUser(moduleSlug: string, userId: string) {
  const module = await prisma.module.findUnique({
    where: { slug: moduleSlug },
    include: {
      lessons: {
        include: {
          progress: {
            where: { userId },
            select: { status: true, percent: true },
          },
          prerequisites: {
            include: {
              prerequisiteLesson: {
                select: { slug: true, id: true, title: true },
              },
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!module) {
    return null;
  }

  const completedLessonIds = new Set(
    module.lessons
      .filter((lesson) => lesson.progress[0]?.status === "COMPLETED")
      .map((lesson) => lesson.id),
  );

  return {
    ...module,
    lessons: module.lessons.map((lesson) => {
      const prerequisiteIds = lesson.prerequisites.map((item) => item.prerequisiteLesson.id);
      const locked = prerequisiteIds.some((id) => !completedLessonIds.has(id));

      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        orderIndex: lesson.orderIndex,
        estimatedMinutes: lesson.estimatedMinutes,
        difficulty: lesson.difficulty,
        status: lesson.progress[0]?.status ?? "NOT_STARTED",
        percent: lesson.progress[0]?.percent ?? 0,
        prerequisiteSlugs: lesson.prerequisites.map((item) => item.prerequisiteLesson.slug),
        locked,
      };
    }),
  };
}

export async function getLessonBySlugForUser(lessonSlug: string, userId: string) {
  return prisma.lesson.findUnique({
    where: { slug: lessonSlug },
    include: {
      module: true,
      progress: {
        where: { userId },
        take: 1,
      },
      exercises: {
        orderBy: { orderIndex: "asc" },
      },
      quizQuestions: {
        orderBy: { orderIndex: "asc" },
      },
      prerequisites: {
        include: {
          prerequisiteLesson: {
            select: { id: true, slug: true, title: true },
          },
        },
      },
    },
  });
}
