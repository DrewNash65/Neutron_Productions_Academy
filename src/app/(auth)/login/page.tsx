"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

/**
 * Login screen for credentials-based auth.
 */
export default function LoginPage() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show a success message after a completed signup flow.
  const signupSuccess = useMemo(() => searchParams.get("signup") === "success", [searchParams]);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (!authError) {
      return;
    }

    setErrorMessage("Login failed. Please verify your email and password, then try again.");
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch {
      setErrorMessage("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-academy-bg px-6 py-10 text-academy-text">
      <section className="glass-card w-full max-w-md p-6 md:p-8" aria-labelledby="login-heading">
        <h1 id="login-heading" className="text-3xl font-bold gradient-text">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-academy-muted">Log in to continue your learning path.</p>

        {signupSuccess ? (
          <p
            className="mt-4 rounded-lg border border-academy-mint/30 bg-academy-mint/10 p-3 text-sm text-academy-mint"
            role="status"
            aria-live="polite"
          >
            Signup successful. You can log in now.
          </p>
        ) : null}

        {errorMessage ? (
          <p
            id="login-error"
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
              aria-describedby={errorMessage ? "login-error" : undefined}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "login-error" : undefined}
              className="w-full rounded-lg border border-academy-accent/30 bg-academy-card px-3 py-2.5 text-sm text-academy-text placeholder:text-academy-muted focus:border-academy-accent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="hover-lift w-full rounded-lg bg-academy-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academy-violet disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-2 text-sm text-academy-muted">
          <Link href="/signup" className="w-fit hover:text-academy-mint">
            Need an account? Create one
          </Link>
          <Link href="/reset-password" className="w-fit hover:text-academy-mint">
            Forgot your password?
          </Link>
        </div>
      </section>
    </main>
  );
}
