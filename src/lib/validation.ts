import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128)
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the privacy notice" }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const onboardingSchema = z.object({
  ageRange: z.enum([
    "UNDER_13",
    "AGE_13_17",
    "AGE_18_24",
    "AGE_25_44",
    "AGE_45_60",
    "AGE_60_PLUS",
  ]),
  experienceLevel: z.enum(["NONE", "BASIC_PAST", "BASIC", "INTERMEDIATE", "ADVANCED"]),
  goals: z.array(z.string()).min(1).max(6),
  learningPreferences: z
    .array(z.enum(["VISUAL", "STEP_BY_STEP", "PROJECT_FIRST", "THEORY_FIRST"]))
    .min(1)
    .max(4),
  weeklyTimeCommitmentH: z.number().int().min(1).max(40),
  avoidPHIAcknowledged: z.literal(true, {
    errorMap: () => ({ message: "You must acknowledge the no-PHI policy" }),
  }),
  privacyAccepted: z.literal(true),
  termsAccepted: z.literal(true),
});

export const progressSchema = z.object({
  lessonId: z.string().min(1),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
  percent: z.number().int().min(0).max(100),
});

export const attemptSchema = z.object({
  exerciseId: z.string().min(1),
  htmlSnapshot: z.string().max(12000),
  cssSnapshot: z.string().max(12000),
  jsSnapshot: z.string().max(12000),
  result: z.enum(["PASS", "FAIL", "ERROR"]),
  feedback: z.string().max(1200),
});

export const quizSubmitSchema = z.object({
  lessonId: z.string().min(1),
  answers: z.record(z.string()),
});

export const adminLessonSchema = z.object({
  lessonId: z.string().optional(),
  moduleId: z.string(),
  slug: z.string().min(2).max(120),
  title: z.string().min(2).max(200),
  summary: z.string().min(10).max(1000),
  contentMDX: z.string().min(50),
  difficulty: z.number().int().min(1).max(5),
  estimatedMinutes: z.number().int().min(5).max(240),
  tags: z.array(z.string()).max(12),
  published: z.boolean(),
});

export const adminModuleSchema = z.object({
  moduleId: z.string().optional(),
  slug: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(10),
  orderIndex: z.number().int().min(0).max(100),
  estimatedMinutes: z.number().int().min(10).max(10000).optional(),
  published: z.boolean(),
  comingSoon: z.boolean(),
});

export const adminQuizQuestionSchema = z.object({
  questionId: z.string().optional(),
  lessonId: z.string().min(1),
  question: z.string().min(5).max(500),
  type: z.enum(["MULTIPLE_CHOICE", "FILL_IN", "PREDICT_OUTPUT"]),
  options: z.array(z.string().min(1).max(200)).max(6).optional(),
  correctAnswer: z.string().min(1).max(200),
  explanation: z.string().min(5).max(500),
  orderIndex: z.number().int().min(0).max(50),
});

export const adminDeleteQuizQuestionSchema = z.object({
  questionId: z.string().min(1),
});
