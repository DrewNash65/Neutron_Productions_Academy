"use client";

import { useState } from "react";

interface MarkCompleteButtonProps {
  lessonId: string;
  initialCompleted: boolean;
  requiresQuizPass: boolean;
  hasPassedRequiredQuiz: boolean;
}

export default function MarkCompleteButton({
  lessonId,
  initialCompleted,
  requiresQuizPass,
  hasPassedRequiredQuiz,
}: MarkCompleteButtonProps) {
  const blockedByQuiz = requiresQuizPass && !hasPassedRequiredQuiz;
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleMarkComplete() {
    if (blockedByQuiz) {
      setErrorMessage("Pass the quiz with at least 80% before marking this lesson complete.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          status: "COMPLETED",
          percent: 100,
        }),
      });

      if (!response.ok) {
        let apiMessage = "";
        try {
          const payload = (await response.json()) as { message?: string };
          apiMessage = payload?.message?.trim?.() ?? "";
        } catch {
          apiMessage = "";
        }

        throw new Error(apiMessage || "Failed to mark lesson as complete.");
      }

      setIsCompleted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5">
        <span className="text-lg" aria-hidden="true">
          ✅
        </span>
        <span className="text-sm font-semibold text-emerald-200">
          Lesson completed
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleMarkComplete}
        disabled={isSubmitting || blockedByQuiz}
        aria-busy={isSubmitting}
        className="hover-lift inline-flex items-center justify-center rounded-lg bg-academy-mint px-5 py-2.5 text-sm font-semibold text-academy-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Mark as Complete"}
      </button>
      {blockedByQuiz ? (
        <p className="text-sm text-amber-200" role="status" aria-live="polite">
          Pass the quiz with at least 80% before marking this lesson complete.
        </p>
      ) : null}
      {errorMessage ? (
        <p
          className="text-sm text-red-300"
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
