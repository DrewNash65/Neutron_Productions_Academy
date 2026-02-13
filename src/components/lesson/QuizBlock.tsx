"use client";

import { FormEvent, useMemo, useState } from "react";

type QuizQuestionType = "MULTIPLE_CHOICE" | "FILL_IN" | "PREDICT_OUTPUT";

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  options?: string[];
  explanation?: string;
  orderIndex: number;
}

type QuizMode = "one-at-a-time" | "all";

interface QuizBlockProps {
  lessonId: string;
  questions: QuizQuestion[];
  mode?: QuizMode;
  passingScorePercent?: number;
}

type ServerQuestionFeedback = {
  isCorrect?: boolean;
  explanation?: string;
  expectedAnswer?: string;
};

type QuizSubmitResponse = {
  score?: number;
  total?: number;
  passed?: boolean;
  feedback?: Record<string, ServerQuestionFeedback>;
};

const CONFETTI_COLORS = ["#7c8cff", "#5eead4", "#a78bfa", "#facc15", "#34d399"];

export default function QuizBlock({
  lessonId,
  questions,
  mode = "all",
  passingScorePercent = 70,
}: QuizBlockProps) {
  const orderedQuestions = useMemo(
    () => [...questions].sort((a, b) => a.orderIndex - b.orderIndex),
    [questions],
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const attemptedCount = Object.values(answers).filter((value) => value.trim().length > 0).length;

  const score = result?.score ?? 0;
  const total = result?.total ?? orderedQuestions.length;
  const scorePercent = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = result?.passed ?? scorePercent >= passingScorePercent;

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => {
        const left = (index * 13.7) % 100;
        const duration = 2.8 + ((index * 0.31) % 2.2);
        const delay = (index * 0.08) % 0.9;
        const rotate = (index * 47) % 360;
        const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

        return { id: index, left, duration, delay, rotate, color };
      }),
    [],
  );

  const onAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitQuiz = async (event?: FormEvent) => {
    event?.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          answers: orderedQuestions.reduce<Record<string, string>>((acc, question) => {
            acc[question.id] = (answers[question.id] ?? "").trim();
            return acc;
          }, {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit quiz. Please try again.");
      }

      const payload = (await response.json()) as QuizSubmitResponse;
      setResult(payload);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setSubmitError("");
    setActiveQuestionIndex(0);
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answerValue = answers[question.id] ?? "";
    const feedback = result?.feedback?.[question.id];

    return (
      <article
        key={question.id}
        className="rounded-xl border border-academy-muted/25 bg-academy-bg/70 p-4 shadow-md"
        aria-label={`Question ${index + 1}`}
      >
        <header className="mb-3">
          <p className="text-xs uppercase tracking-wide text-academy-muted">Question {index + 1}</p>
          {question.type === "PREDICT_OUTPUT" ? (
            <>
              <p className="mt-1 text-sm text-academy-text">What will this code output?</p>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-academy-muted/30 bg-black/30 p-3 font-mono text-xs text-academy-text">
                <code>{question.question}</code>
              </pre>
            </>
          ) : (
            <h3 className="mt-1 text-base font-semibold text-academy-text">{question.question}</h3>
          )}
        </header>

        {question.type === "MULTIPLE_CHOICE" ? (
          <fieldset className="space-y-2" aria-label={`Answer options for question ${index + 1}`}>
            <legend className="sr-only">Select one option</legend>
            {(question.options ?? []).map((option, optionIndex) => {
              const optionId = `${question.id}-option-${optionIndex}`;
              return (
                <label
                  htmlFor={optionId}
                  key={optionId}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-academy-muted/30 bg-academy-card/80 px-3 py-2 text-sm text-academy-text transition hover:border-academy-accent/60"
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answerValue === option}
                    onChange={(event) => onAnswerChange(question.id, event.target.value)}
                    className="mt-0.5 h-4 w-4 accent-academy-accent"
                    aria-label={`Choose ${option}`}
                    disabled={Boolean(result)}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <label className="block" htmlFor={`response-${question.id}`}>
            <span className="sr-only">Type your answer</span>
            <input
              id={`response-${question.id}`}
              type="text"
              value={answerValue}
              disabled={Boolean(result)}
              onChange={(event) => onAnswerChange(question.id, event.target.value)}
              placeholder={question.type === "PREDICT_OUTPUT" ? "Enter predicted output" : "Type your answer"}
              aria-label={`Answer for question ${index + 1}`}
              className="w-full rounded-lg border border-academy-muted/35 bg-academy-card px-3 py-2 text-sm text-academy-text placeholder:text-academy-muted focus:border-academy-accent focus:outline-none"
            />
          </label>
        )}

        {result ? (
          <div
            className={`mt-3 rounded-lg border p-3 text-sm ${
              feedback?.isCorrect
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-amber-400/40 bg-amber-500/10 text-amber-100"
            }`}
            aria-live="polite"
          >
            <p className="font-semibold">{feedback?.isCorrect ? "Correct" : "Needs review"}</p>
            <p className="mt-1">
              {feedback?.explanation?.trim() || question.explanation?.trim() || "Review this concept and try again."}
            </p>
          </div>
        ) : null}
      </article>
    );
  };

  const visibleQuestions =
    mode === "one-at-a-time" ? [orderedQuestions[activeQuestionIndex]].filter(Boolean) : orderedQuestions;

  return (
    <section
      className="glass-card relative overflow-hidden rounded-2xl border border-academy-muted/20 bg-academy-card p-5 text-academy-text shadow-xl md:p-6"
      aria-label="Lesson quiz"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="gradient-text text-2xl font-bold">Knowledge Check</h2>
          <p className="mt-1 text-sm text-academy-muted">
            {result
              ? `You answered ${score} of ${total} correctly.`
              : `${attemptedCount}/${orderedQuestions.length} answered`}
          </p>
        </div>

        {mode === "one-at-a-time" && !result ? (
          <p className="rounded-full border border-academy-muted/30 px-3 py-1 text-xs text-academy-muted">
            Question {activeQuestionIndex + 1} of {orderedQuestions.length}
          </p>
        ) : null}
      </header>

      {result && passed ? (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="quiz-confetti-piece"
              style={{
                left: `${piece.left}%`,
                animationDuration: `${piece.duration}s`,
                animationDelay: `${piece.delay}s`,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotate}deg)`,
              }}
            />
          ))}
        </div>
      ) : null}

      <form onSubmit={submitQuiz} className="space-y-4">
        {visibleQuestions.map((question, localIndex) =>
          renderQuestion(
            question,
            mode === "one-at-a-time" ? activeQuestionIndex : localIndex,
          ),
        )}

        {submitError ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200" aria-live="polite">
            {submitError}
          </div>
        ) : null}

        {!result && mode === "one-at-a-time" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeQuestionIndex === 0}
              aria-label="Go to previous question"
              className="rounded-lg border border-academy-muted/40 bg-academy-bg px-4 py-2 text-sm text-academy-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {activeQuestionIndex < orderedQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveQuestionIndex((prev) => Math.min(orderedQuestions.length - 1, prev + 1))}
                aria-label="Go to next question"
                className="rounded-lg border border-academy-accent/50 bg-academy-accent/15 px-4 py-2 text-sm font-medium text-academy-accent"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                aria-label="Submit quiz"
                className="rounded-lg bg-academy-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        ) : null}

        {!result && mode === "all" ? (
          <button
            type="submit"
            disabled={submitting || orderedQuestions.length === 0}
            aria-label="Submit quiz"
            className="rounded-lg bg-academy-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : null}
      </form>

      {result ? (
        <section
          className={`mt-5 rounded-xl border p-4 ${
            passed
              ? "border-emerald-400/40 bg-emerald-500/10"
              : "border-amber-400/40 bg-amber-500/10"
          }`}
          aria-live="polite"
        >
          <h3 className="text-lg font-semibold text-academy-text">Quiz Results</h3>
          <p className="mt-1 text-sm text-academy-text/90">
            Score: <span className="font-semibold">{scorePercent}%</span> ({score}/{total})
          </p>
          <p className="mt-1 text-sm font-medium text-academy-text">{passed ? "Pass" : "Not passed yet"}</p>

          <button
            type="button"
            onClick={handleRetry}
            aria-label="Retry quiz"
            className="mt-3 rounded-lg border border-academy-muted/35 bg-academy-bg px-4 py-2 text-sm text-academy-text transition hover:border-academy-mint/60"
          >
            Retry
          </button>
        </section>
      ) : null}

      <style jsx>{`
        .quiz-confetti-piece {
          position: absolute;
          top: -16px;
          width: 8px;
          height: 16px;
          opacity: 0.9;
          border-radius: 2px;
          animation-name: quiz-confetti-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes quiz-confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(460px) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
