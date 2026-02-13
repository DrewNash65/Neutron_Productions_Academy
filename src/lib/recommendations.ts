import type { RecommendationResult } from "@/types/curriculum";

type LessonSignal = {
  lessonId: string;
  title: string;
  moduleId: string;
  orderIndex: number;
  prerequisites: string[];
  completed: boolean;
  completionPercent: number;
  quizScoreRatio: number;
  failedAttempts: number;
  goalsOverlapScore: number;
};

type RecommendationInput = {
  lessons: LessonSignal[];
  weeklyTimeCommitmentH: number;
};

function masteryScore(lesson: LessonSignal) {
  const completionScore = lesson.completionPercent / 100;
  const quizScore = lesson.quizScoreRatio;
  const exerciseScore = lesson.failedAttempts > 0 ? Math.max(0, 1 - lesson.failedAttempts * 0.1) : 1;
  const strugglePenalty = lesson.failedAttempts >= 3 ? 0.15 : 0;

  return 0.45 * quizScore + 0.35 * exerciseScore + 0.2 * completionScore - strugglePenalty;
}

export function chooseRecommendation(input: RecommendationInput): RecommendationResult {
  const completedSet = new Set(input.lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.lessonId));

  const unmetPrerequisiteLesson = input.lessons
    .filter((lesson) => !lesson.completed)
    .find((lesson) => lesson.prerequisites.some((prereq) => !completedSet.has(prereq)));

  if (unmetPrerequisiteLesson) {
    return {
      lessonId: unmetPrerequisiteLesson.lessonId,
      moduleId: unmetPrerequisiteLesson.moduleId,
      reason: "You have a missing prerequisite. Completing it first will make the next lessons easier.",
      personalizedPath: [
        {
          lessonId: unmetPrerequisiteLesson.lessonId,
          title: unmetPrerequisiteLesson.title,
          reason: "Prerequisite lesson is required before moving ahead.",
        },
      ],
    };
  }

  const strugglingLesson = input.lessons
    .filter((lesson) => !lesson.completed)
    .map((lesson) => ({ lesson, score: masteryScore(lesson) }))
    .sort((a, b) => a.score - b.score)
    .find((item) => item.score < 0.7 || item.lesson.failedAttempts >= 3);

  if (strugglingLesson) {
    return {
      lessonId: strugglingLesson.lesson.lessonId,
      moduleId: strugglingLesson.lesson.moduleId,
      reason:
        "You’ve had a few difficult attempts here. A remediation mini-lesson and extra practice will strengthen your fundamentals.",
      personalizedPath: [
        {
          lessonId: strugglingLesson.lesson.lessonId,
          title: strugglingLesson.lesson.title,
          reason: "Low mastery score detected from quiz/exercise signals.",
        },
      ],
    };
  }

  const candidates = input.lessons
    .filter((lesson) => !lesson.completed)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .sort((a, b) => b.goalsOverlapScore - a.goalsOverlapScore);

  const next = candidates[0] ?? null;

  if (!next) {
    return {
      lessonId: null,
      moduleId: null,
      reason: "Great work. You completed all currently published lessons in this track.",
      personalizedPath: [],
    };
  }

  const timeNote =
    input.weeklyTimeCommitmentH <= 2
      ? "Your weekly time commitment suggests shorter lessons first."
      : "You can handle the next full lesson sequence this week.";

  return {
    lessonId: next.lessonId,
    moduleId: next.moduleId,
    reason: `Recommended next based on your goals and current progress. ${timeNote}`,
    personalizedPath: [
      {
        lessonId: next.lessonId,
        title: next.title,
        reason: "Best next lesson by prerequisite completion and goal alignment.",
      },
    ],
  };
}
