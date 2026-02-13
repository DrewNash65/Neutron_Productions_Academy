"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type SignupFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  privacyAccepted: boolean;
  termsAccepted: boolean;
};

/**
 * Signup page with client-side validation and policy consent checks.
 */
export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    privacyAccepted: false,
    termsAccepted: false,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMeetsStrength = useMemo(() => {
    const value = form.password;
    return value.length >= 10 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
  }, [form.password]);

  function updateField<K extends keyof SignupFormState>(key: K, value: SignupFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!passwordMeetsStrength) {
      setErrorMessage(
        "Password must be at least 10 characters and include uppercase, lowercase, and a number.",
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!form.privacyAccepted || !form.termsAccepted) {
      setErrorMessage("You must accept the privacy notice and terms to create an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          privacyAccepted: form.privacyAccepted,
          termsAccepted: form.termsAccepted,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: unknown } | null;
        const serverMessage =
          typeof data?.message === "string"
            ? data.message
            : "Unable to complete signup. Please review your details and try again.";
        throw new Error(serverMessage);
      }

      // Redirect to login with a success flag for inline feedback.
      router.push("/login?signup=success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected signup error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-academy-bg px-6 py-10 text-academy-text">
      <section className="glass-card w-full max-w-lg p-6 md:p-8" aria-labelledby="signup-heading">
        <h1 id="signup-heading" className="text-3xl font-bold gradient-text">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-academy-muted">Start your coding journey with structured guidance.</p>

        <p
          className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-300"
          role="note"
          aria-label="Important educational-only notice"
        >
          Important: Do NOT enter any health information. This platform is educational only.
        </p>

        {errorMessage ? (
          <p
            id="signup-error"
            className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300"
            role="alert"
            aria-live="assertive"
          >
            {errorMessage}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "signup-error" : undefined}
              className="w-full rounded-lg border border-academy-accent/30 bg-academy-card px-3 py-2.5 text-sm text-academy-text placeholder:text-academy-muted focus:border-academy-accent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "signup-error" : undefined}
              className="w-full rounded-lg border border-academy-accent/30 bg-academy-card px-3 py-2.5 text-sm text-academy-text placeholder:text-academy-muted focus:border-academy-accent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              aria-required="true"
              aria-invalid={!passwordMeetsStrength && form.password.length > 0}
              aria-describedby="password-help"
              className="w-full rounded-lg border border-academy-accent/30 bg-academy-card px-3 py-2.5 text-sm text-academy-text placeholder:text-academy-muted focus:border-academy-accent"
              placeholder="Create a strong password"
            />
            <p id="password-help" className="mt-1 text-xs text-academy-muted">
              Must be 10+ characters with uppercase, lowercase, and a number.
            </p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              aria-required="true"
              aria-invalid={form.confirmPassword.length > 0 && form.confirmPassword !== form.password}
              className="w-full rounded-lg border border-academy-accent/30 bg-academy-card px-3 py-2.5 text-sm text-academy-text placeholder:text-academy-muted focus:border-academy-accent"
              placeholder="Re-enter your password"
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border border-academy-accent/20 bg-academy-card/40 p-4">
            <legend className="px-1 text-sm font-medium">Required consents</legend>

            <label className="flex items-start gap-2 text-sm text-academy-muted">
              <input
                type="checkbox"
                checked={form.privacyAccepted}
                onChange={(event) => updateField("privacyAccepted", event.target.checked)}
                aria-required="true"
                className="mt-0.5 h-4 w-4 rounded border-academy-accent/40 bg-academy-card text-academy-accent"
              />
              <span>
                I accept the{" "}
                <Link href="/privacy" className="font-medium text-academy-accent hover:text-academy-mint">
                  privacy notice
                </Link>
                .
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm text-academy-muted">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(event) => updateField("termsAccepted", event.target.checked)}
                aria-required="true"
                className="mt-0.5 h-4 w-4 rounded border-academy-accent/40 bg-academy-card text-academy-accent"
              />
              <span>
                I accept the{" "}
                <Link href="/terms" className="font-medium text-academy-accent hover:text-academy-mint">
                  terms of service
                </Link>
                .
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="hover-lift w-full rounded-lg bg-academy-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academy-violet disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-academy-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-academy-accent hover:text-academy-mint">
            Log in
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
