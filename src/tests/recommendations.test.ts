import { describe, it, expect } from "vitest";
import { chooseRecommendation } from "@/lib/recommendations";

describe("chooseRecommendation", () => {
  const baseLessonSignal = {
    lessonId: "lesson-1",
    title: "Test Lesson",
    moduleId: "module-1",
    orderIndex: 0,
    prerequisites: [] as string[],
    completed: false,
    completionPercent: 0,
    quizScoreRatio: 0,
    failedAttempts: 0,
    goalsOverlapScore: 0,
  };

  it("recommends next sequential lesson when no struggling or prerequisites", () => {
    const result = chooseRecommendation({
      weeklyTimeCommitmentH: 5,
      lessons: [
        { ...baseLessonSignal, lessonId: "l1", completed: true },
        { ...baseLessonSignal, lessonId: "l2", orderIndex: 1 },
        { ...baseLessonSignal, lessonId: "l3", orderIndex: 2 },
      ],
    });

    expect(result.lessonId).toBe("l2");
    expect(result.reason).toContain("Recommended next");
  });

  it("recommends prerequisite lesson when it is not completed", () => {
    const result = chooseRecommendation({
      weeklyTimeCommitmentH: 5,
      lessons: [
        { ...baseLessonSignal, lessonId: "prereq-1", completed: false },
        {
          ...baseLessonSignal,
          lessonId: "target-1",
          orderIndex: 1,
          prerequisites: ["prereq-1"],
        },
      ],
    });

    expect(result.lessonId).toBe("target-1");
    expect(result.reason).toContain("prerequisite");
  });

  it("recommends struggling lesson when mastery is low", () => {
    const result = chooseRecommendation({
      weeklyTimeCommitmentH: 5,
      lessons: [
        {
          ...baseLessonSignal,
          lessonId: "struggle-1",
          quizScoreRatio: 0.3,
          failedAttempts: 5,
          completionPercent: 20,
        },
        {
          ...baseLessonSignal,
          lessonId: "normal-1",
          orderIndex: 1,
          quizScoreRatio: 0.8,
          completionPercent: 80,
        },
      ],
    });

    expect(result.lessonId).toBe("struggle-1");
    expect(result.reason).toContain("difficult attempts");
  });

  it("returns null lessonId when all lessons completed", () => {
    const result = chooseRecommendation({
      weeklyTimeCommitmentH: 5,
      lessons: [
        { ...baseLessonSignal, lessonId: "l1", completed: true },
        { ...baseLessonSignal, lessonId: "l2", orderIndex: 1, completed: true },
      ],
    });

    expect(result.lessonId).toBeNull();
    expect(result.reason).toContain("completed all");
  });

  it("notes short time commitment in recommendation", () => {
    const result = chooseRecommendation({
      weeklyTimeCommitmentH: 1,
      lessons: [{ ...baseLessonSignal, lessonId: "l1" }],
    });

    expect(result.reason).toContain("shorter lessons");
  });

  it("prefers lessons matching user goals", () => {
    const result = chooseRecommendation({
      weeklyTimeCommitmentH: 5,
      lessons: [
        { ...baseLessonSignal, lessonId: "low-match", orderIndex: 0, goalsOverlapScore: 0 },
        { ...baseLessonSignal, lessonId: "high-match", orderIndex: 1, goalsOverlapScore: 3 },
      ],
    });

    expect(result.lessonId).toBe("high-match");
  });
});
