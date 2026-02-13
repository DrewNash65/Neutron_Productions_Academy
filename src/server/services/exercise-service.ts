import { prisma } from "@/lib/db";

export async function saveExerciseAttempt(input: {
  userId: string;
  exerciseId: string;
  htmlSnapshot: string;
  cssSnapshot: string;
  jsSnapshot: string;
  result: "PASS" | "FAIL" | "ERROR";
  feedback: string;
}) {
  return prisma.attempt.create({
    data: {
      userId: input.userId,
      exerciseId: input.exerciseId,
      htmlSnapshot: input.htmlSnapshot,
      cssSnapshot: input.cssSnapshot,
      jsSnapshot: input.jsSnapshot,
      result: input.result,
      feedback: input.feedback,
    },
  });
}

export async function getExerciseAttempts(userId: string, exerciseId: string) {
  return prisma.attempt.findMany({
    where: {
      userId,
      exerciseId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
}
