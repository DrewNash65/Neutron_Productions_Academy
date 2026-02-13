"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

/**
 * Password reset request page.
 */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error("Unable to process reset request right now.");
      }

      setSuccessMessage("If an account with that email exists, a reset link has been sent.");
      setEmail("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected reset request error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-academy-bg px-6 py-10 text-academy-text">
      <section className="glass-card w-full max-w-md p-6 md:p-8" aria-labelledby="reset-heading">
        <h1 id="reset-heading" className="text-3xl font-bold gradient-text">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-academy-muted">
          Enter your email and we&apos;ll send password reset instructions.
        </p>

        {successMessage ? (
          <p
            className="mt-4 rounded-lg border border-academy-mint/30 bg-academy-mint/10 p-3 text-sm text-academy-mint"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p
            id="reset-error"
            className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300"
            role="alert"
            aria-live="assertive"
          >
            {errorMessage}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "reset-error" : undefined}
              className="w-full rounded-lg border border-academy-accent/30 bg-academy-card px-3 py-2.5 text-sm text-academy-text placeholder:text-academy-muted focus:border-academy-accent"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="hover-lift w-full rounded-lg bg-academy-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academy-violet disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-5 text-sm text-academy-muted">
          <Link href="/login" className="font-medium text-academy-accent hover:text-academy-mint">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
