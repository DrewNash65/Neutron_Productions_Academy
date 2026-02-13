"use client";

import { useMemo } from "react";

interface ExerciseFeedbackProps {
  passed: boolean;
  feedback: string;
  hint: string;
  showHint: boolean;
  onToggleHint?: () => void;
}

export default function ExerciseFeedback({
  passed,
  feedback,
  hint,
  showHint,
  onToggleHint,
}: ExerciseFeedbackProps) {
  const cardStyles = useMemo(
    () =>
      passed
        ? "border-emerald-400/45 bg-emerald-500/10 text-emerald-100"
        : "border-amber-400/45 bg-amber-500/10 text-amber-100",
    [passed],
  );

  return (
    <section
      className={`animate-fade-in rounded-xl border p-4 shadow-md ${cardStyles}`}
      role="status"
      aria-live="polite"
      aria-label={passed ? "Exercise passed" : "Exercise needs more work"}
    >
      {passed ? (
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="text-lg leading-none text-emerald-200">
            ✔
          </span>
          <div>
            <h3 className="text-base font-semibold text-emerald-200">Great job!</h3>
            <p className="mt-1 text-sm">{feedback || "You completed this exercise successfully."}</p>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-base font-semibold text-amber-200">Keep going</h3>
          <p className="mt-1 text-sm">{feedback || "Not quite yet. Review your code and try again."}</p>

          {hint ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={onToggleHint}
                aria-expanded={showHint}
                aria-label={showHint ? "Hide hint" : "Show hint"}
                className="rounded-lg border border-amber-300/40 bg-black/20 px-3 py-2 text-sm text-amber-100 transition hover:bg-black/30"
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>

              {showHint ? (
                <p className="mt-2 rounded-lg border border-amber-300/30 bg-black/20 p-3 text-sm leading-relaxed text-amber-50">
                  {hint}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      <style jsx>{`
        .animate-fade-in {
          animation: feedback-fade-in 240ms ease-out;
        }

        @keyframes feedback-fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
