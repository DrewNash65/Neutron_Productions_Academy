import Link from "next/link";

/**
 * Privacy notice page for marketing/legal routes.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-academy-bg px-6 py-12 text-academy-text md:px-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header>
          <h1 className="text-4xl font-bold gradient-text">Privacy Notice</h1>
          <p className="mt-3 text-academy-muted">Last updated: February 2026</p>
        </header>

        <section className="glass-card space-y-5 p-6 md:p-8">
          <p className="rounded-xl border border-academy-mint/35 bg-academy-mint/10 p-4 text-sm font-medium text-academy-mint md:text-base">
            Neutron Productions Coding Academy does NOT collect, store, or process any Protected
            Health Information (PHI).
          </p>

          <article>
            <h2 className="text-2xl font-semibold">Data we collect</h2>
            <p className="mt-3 text-academy-muted">
              To support educational delivery, we may collect your email address, name, age range,
              experience level, learning preferences, time commitment, and learning progress or quiz
              performance data. All collected data is educational only.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">How data is used</h2>
            <p className="mt-3 text-academy-muted">
              We use data to personalize your learning path, improve adaptive curriculum decisions, and
              generate aggregate analytics that help us improve course quality and learner outcomes.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Security measures</h2>
            <p className="mt-3 text-academy-muted">
              We apply modern security practices, including encrypted transport (HTTPS), controlled
              system access, and monitoring safeguards designed to reduce unauthorized access and
              protect learner account information.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Your rights</h2>
            <p className="mt-3 text-academy-muted">
              You can request access to your data, request correction of inaccurate account details,
              request data deletion, and ask questions about how your information is handled.
            </p>
          </article>
        </section>

        <div>
          <Link href="/" className="text-sm font-medium text-academy-accent transition hover:text-academy-mint">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
