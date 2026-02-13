import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  onboardingSchema,
  progressSchema,
  attemptSchema,
  quizSubmitSchema,
  adminLessonSchema,
} from "@/lib/validation";

describe("signupSchema", () => {
  it("validates a correct signup payload", () => {
    const result = signupSchema.safeParse({
      name: "Drew Nash",
      email: "drew@example.com",
      password: "SecurePass1!",
      privacyAccepted: true,
      termsAccepted: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = signupSchema.safeParse({
      name: "Drew",
      email: "drew@example.com",
      password: "short",
      privacyAccepted: true,
      termsAccepted: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing consent", () => {
    const result = signupSchema.safeParse({
      name: "Drew",
      email: "drew@example.com",
      password: "SecurePass1!",
      privacyAccepted: false,
      termsAccepted: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("validates correct login", () => {
    const result = loginSchema.safeParse({
      email: "drew@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("validates complete onboarding data", () => {
    const result = onboardingSchema.safeParse({
      ageRange: "AGE_60_PLUS",
      experienceLevel: "BASIC_PAST",
      goals: ["websites", "fluency"],
      learningPreferences: ["STEP_BY_STEP"],
      weeklyTimeCommitmentH: 3,
      avoidPHIAcknowledged: true,
      privacyAccepted: true,
      termsAccepted: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing PHI acknowledgment", () => {
    const result = onboardingSchema.safeParse({
      ageRange: "AGE_25_44",
      experienceLevel: "NONE",
      goals: ["apps"],
      learningPreferences: ["VISUAL"],
      weeklyTimeCommitmentH: 5,
      avoidPHIAcknowledged: false,
      privacyAccepted: true,
      termsAccepted: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("progressSchema", () => {
  it("validates progress update", () => {
    const result = progressSchema.safeParse({
      lessonId: "lesson-123",
      status: "COMPLETED",
      percent: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = progressSchema.safeParse({
      lessonId: "lesson-123",
      status: "INVALID",
      percent: 50,
    });
    expect(result.success).toBe(false);
  });
});

describe("attemptSchema", () => {
  it("validates attempt submission", () => {
    const result = attemptSchema.safeParse({
      exerciseId: "ex-1",
      htmlSnapshot: "<div>Test</div>",
      cssSnapshot: "body { color: red; }",
      jsSnapshot: "console.log('hello');",
      result: "PASS",
      feedback: "All tests passed",
    });
    expect(result.success).toBe(true);
  });
});

describe("quizSubmitSchema", () => {
  it("validates quiz submission", () => {
    const result = quizSubmitSchema.safeParse({
      lessonId: "lesson-1",
      answers: { q1: "option-a", q2: "option-c" },
    });
    expect(result.success).toBe(true);
  });
});

describe("adminLessonSchema", () => {
  it("validates admin lesson creation", () => {
    const result = adminLessonSchema.safeParse({
      moduleId: "mod-1",
      slug: "my-lesson",
      title: "My Lesson",
      summary: "A lesson about things that matter in code",
      contentMDX: "# My Lesson\n\nThis is a lesson about coding fundamentals that covers many important topics.",
      difficulty: 2,
      estimatedMinutes: 15,
      tags: ["javascript", "basics"],
      published: false,
    });
    expect(result.success).toBe(true);
  });
});
