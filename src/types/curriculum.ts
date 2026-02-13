export type LessonStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ModuleSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  published: boolean;
  comingSoon: boolean;
  lessonCount: number;
  completedLessons: number;
  percentComplete: number;
};

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  orderIndex: number;
  estimatedMinutes: number;
  difficulty: number;
  status: LessonStatus;
  percent: number;
  prerequisiteSlugs: string[];
  locked: boolean;
};

export type RecommendationResult = {
  lessonId: string | null;
  moduleId: string | null;
  reason: string;
  personalizedPath: Array<{
    lessonId: string;
    title: string;
    reason: string;
  }>;
};
