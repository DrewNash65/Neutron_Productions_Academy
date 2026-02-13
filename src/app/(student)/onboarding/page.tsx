"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type AgeRange = "UNDER_13" | "AGE_13_17" | "AGE_18_24" | "AGE_25_44" | "AGE_45_60" | "AGE_60_PLUS";
type ExperienceLevel = "NONE" | "BASIC_PAST" | "BASIC" | "INTERMEDIATE" | "ADVANCED";
type LearningPreference = "VISUAL" | "STEP_BY_STEP" | "PROJECT_FIRST" | "THEORY_FIRST";

const AGE_OPTIONS: Array<{ value: AgeRange; label: string }> = [
  { value: "UNDER_13", label: "Under 13" },
  { value: "AGE_13_17", label: "13-17" },
  { value: "AGE_18_24", label: "18-24" },
  { value: "AGE_25_44", label: "25-44" },
  { value: "AGE_45_60", label: "45-60" },
  { value: "AGE_60_PLUS", label: "60+" },
];

const EXPERIENCE_OPTIONS: Array<{ value: ExperienceLevel; label: string }> = [
  { value: "NONE", label: "None" },
  { value: "BASIC_PAST", label: "Coded in BASIC years ago" },
  { value: "BASIC", label: "Basic" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const GOAL_OPTIONS = [
  "Build Websites",
  "Build Apps",
  "Automation",
  "Data Analysis",
  "Game Dev",
  "Just want coding fluency",
] as const;

const LEARNING_STYLE_OPTIONS: Array<{ value: LearningPreference; label: string }> = [
  { value: "VISUAL", label: "Visual" },
  { value: "STEP_BY_STEP", label: "Step-by-Step" },
  { value: "PROJECT_FIRST", label: "Project-First" },
  { value: "THEORY_FIRST", label: "Theory-First" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [ageRange, setAgeRange] = useState<AgeRange>("AGE_18_24");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("NONE");
  const [goals, setGoals] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState<LearningPreference>("STEP_BY_STEP");
  const [weeklyTimeCommitmentH, setWeeklyTimeCommitmentH] = useState(5);

  const [avoidPHIAcknowledged, setAvoidPHIAcknowledged] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const completionPercent = useMemo(() => {
    let completeSections = 0;

    if (ageRange) completeSections += 1;
    if (experienceLevel) completeSections += 1;
    if (goals.length > 0) completeSections += 1;
    if (learningStyle) completeSections += 1;
    if (weeklyTimeCommitmentH >= 1) completeSections += 1;
    if (avoidPHIAcknowledged && privacyAccepted && termsAccepted) completeSections += 1;

    return Math.round((completeSections / 6) * 100);
  }, [ageRange, avoidPHIAcknowledged, experienceLevel, goals.length, learningStyle, privacyAccepted, termsAccepted, weeklyTimeCommitmentH]);

  function toggleGoal(goal: string) {
    setGoals((prev) => {
      if (prev.includes(goal)) {
        return prev.filter((item) => item !== goal);
      }

      if (prev.length >= 6) {
        return prev;
      }

      return [...prev, goal];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (goals.length === 0) {
      setErrorMessage("Please select at least one learning goal.");
      return;
    }

    if (!avoidPHIAcknowledged || !privacyAccepted || !termsAccepted) {
      setErrorMessage("Please complete all required acknowledgements before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ageRange,
          experienceLevel,
          goals,
          learningPreferences: [learningStyle],
          weeklyTimeCommitmentH,
          avoidPHIAcknowledged,
          privacyAccepted,
          termsAccepted,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: unknown } | null;
        const message = typeof payload?.message === "string" ? payload.message : "Unable to save onboarding details.";
        throw new Error(message);
      }

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-academy-bg px-4 py-8 text-academy-text sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="glass-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-academy-mint">Student Setup</p>
          <h1 className="mt-2 text-3xl font-bold gradient-text md:text-4xl">Welcome to your coding journey</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-academy-muted md:text-base">
            Tell us how you learn best so we can personalize your curriculum and recommendations.
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-academy-muted">
              <span>Onboarding progress</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-academy-card/80">
              <div className="progress-fill h-full rounded-full bg-gradient-to-r from-academy-accent to-academy-mint" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </header>

        {errorMessage ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert" aria-live="assertive">
            {errorMessage}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <section className="glass-card space-y-4 p-6" aria-labelledby="age-heading">
            <h2 id="age-heading" className="text-xl font-semibold text-academy-text">
              1. Age range
            </h2>
            <fieldset>
              <legend className="mb-3 text-sm text-academy-muted">Choose the age range that best describes you.</legend>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {AGE_OPTIONS.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="ageRange"
                      value={option.value}
                      checked={ageRange === option.value}
                      onChange={() => setAgeRange(option.value)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-lg border border-academy-muted/30 bg-academy-card px-4 py-3 text-sm text-academy-text transition peer-checked:border-academy-accent peer-checked:bg-academy-accent/20 peer-focus-visible:ring-2 peer-focus-visible:ring-academy-accent">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="glass-card space-y-4 p-6" aria-labelledby="experience-heading">
            <h2 id="experience-heading" className="text-xl font-semibold text-academy-text">
              2. Experience level
            </h2>
            <fieldset>
              <legend className="mb-3 text-sm text-academy-muted">Pick your current coding experience level.</legend>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={option.value}
                      checked={experienceLevel === option.value}
                      onChange={() => setExperienceLevel(option.value)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-lg border border-academy-muted/30 bg-academy-card px-4 py-3 text-sm text-academy-text transition peer-checked:border-academy-mint peer-checked:bg-academy-mint/15 peer-focus-visible:ring-2 peer-focus-visible:ring-academy-mint">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="glass-card space-y-4 p-6" aria-labelledby="goals-heading">
            <h2 id="goals-heading" className="text-xl font-semibold text-academy-text">
              3. Learning goals
            </h2>
            <fieldset>
              <legend className="mb-3 text-sm text-academy-muted">Select all that apply.</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {GOAL_OPTIONS.map((goal) => {
                  const checked = goals.includes(goal);
                  return (
                    <label key={goal} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="goals"
                        value={goal}
                        checked={checked}
                        onChange={() => toggleGoal(goal)}
                        className="peer sr-only"
                      />
                      <span className="flex items-center justify-between rounded-lg border border-academy-muted/30 bg-academy-card px-4 py-3 text-sm transition peer-checked:border-academy-violet peer-checked:bg-academy-violet/15 peer-focus-visible:ring-2 peer-focus-visible:ring-academy-violet">
                        <span>{goal}</span>
                        <span className="text-xs text-academy-muted">{checked ? "Selected" : "Select"}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </section>

          <section className="glass-card space-y-4 p-6" aria-labelledby="style-heading">
            <h2 id="style-heading" className="text-xl font-semibold text-academy-text">
              4. Learning style preference
            </h2>
            <fieldset>
              <legend className="mb-3 text-sm text-academy-muted">Choose the style that helps you learn fastest.</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {LEARNING_STYLE_OPTIONS.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="learningStyle"
                      value={option.value}
                      checked={learningStyle === option.value}
                      onChange={() => setLearningStyle(option.value)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-lg border border-academy-muted/30 bg-academy-card px-4 py-3 text-sm transition peer-checked:border-academy-accent peer-checked:bg-academy-accent/20 peer-focus-visible:ring-2 peer-focus-visible:ring-academy-accent">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="glass-card space-y-4 p-6" aria-labelledby="time-heading">
            <h2 id="time-heading" className="text-xl font-semibold text-academy-text">
              5. Weekly time commitment
            </h2>
            <label htmlFor="weeklyTime" className="block text-sm text-academy-muted">
              How many hours can you commit each week?
            </label>
            <div className="rounded-lg border border-academy-muted/30 bg-academy-card p-4">
              <input
                id="weeklyTime"
                type="range"
                min={1}
                max={20}
                value={weeklyTimeCommitmentH}
                onChange={(event) => setWeeklyTimeCommitmentH(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-academy-bg"
                aria-valuemin={1}
                aria-valuemax={20}
                aria-valuenow={weeklyTimeCommitmentH}
                aria-label="Weekly time commitment"
              />
              <p className="mt-3 text-sm font-medium text-academy-mint">{weeklyTimeCommitmentH} hour{weeklyTimeCommitmentH === 1 ? "" : "s"} per week</p>
            </div>
          </section>

          <section className="glass-card space-y-5 p-6" aria-labelledby="consent-heading">
            <h2 id="consent-heading" className="text-xl font-semibold text-academy-text">
              6. Consent and policies
            </h2>

            <label className="flex items-start gap-3 rounded-lg border border-academy-muted/30 bg-academy-card/70 p-3">
              <input
                type="checkbox"
                checked={avoidPHIAcknowledged}
                onChange={(event) => setAvoidPHIAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-academy-muted/40 bg-academy-card accent-academy-accent"
                required
              />
              <span className="text-sm text-academy-text">
                I understand this platform does NOT collect health information.
              </span>
            </label>

            <div className="grid gap-3">
              <label className="flex items-start gap-3 rounded-lg border border-academy-muted/30 bg-academy-card/70 p-3">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-academy-muted/40 bg-academy-card accent-academy-accent"
                  required
                />
                <span className="text-sm text-academy-text">
                  I accept the{" "}
                  <Link href="/privacy" className="font-medium text-academy-accent hover:text-academy-mint">
                    Privacy Notice
                  </Link>
                  .
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-academy-muted/30 bg-academy-card/70 p-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-academy-muted/40 bg-academy-card accent-academy-accent"
                  required
                />
                <span className="text-sm text-academy-text">
                  I accept the{" "}
                  <Link href="/terms" className="font-medium text-academy-accent hover:text-academy-mint">
                    Terms of Service
                  </Link>
                  .
                </span>
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-academy-muted">You can update these preferences later in your profile settings.</p>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="hover-lift inline-flex items-center justify-center rounded-lg bg-academy-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-academy-violet disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving your preferences..." : "Finish onboarding"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
