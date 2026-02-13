import Link from "next/link";

/**
 * Terms of Service page for legal route.
 */
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-academy-bg px-6 py-12 text-academy-text md:px-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header>
          <h1 className="text-4xl font-bold gradient-text">Terms of Service</h1>
          <p className="mt-3 text-academy-muted">
            Please read these terms carefully before using the platform.
          </p>
        </header>

        <section className="glass-card space-y-6 p-6 md:p-8">
          <article>
            <h2 className="text-2xl font-semibold">1. Acceptance</h2>
            <p className="mt-2 text-academy-muted">
              By creating an account or using Neutron Productions Coding Academy, you agree to these
              Terms of Service and all applicable laws.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p className="mt-2 text-academy-muted">
              The platform provides educational coding lessons, exercises, assessments, and project
              tools intended for learning software development skills.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <p className="mt-2 text-academy-muted">
              You are responsible for maintaining account security, providing accurate information, and
              restricting unauthorized access to your credentials.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">4. Acceptable Use</h2>
            <p className="mt-2 text-academy-muted">
              You agree not to misuse the service, disrupt platform operations, attempt unauthorized
              access, or submit harmful code or content.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
            <p className="mt-2 text-academy-muted">
              Course content, platform design, branding, and instructional materials are owned by
              Neutron Productions or its licensors and are protected by applicable laws.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">6. Disclaimer</h2>
            <p className="mt-2 text-academy-muted">
              The platform is provided on an "as is" and "as available" basis. No medical services are
              provided, and the platform is educational only.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <p className="mt-2 text-academy-muted">
              To the maximum extent permitted by law, Neutron Productions is not liable for indirect,
              incidental, or consequential damages arising from use of the platform.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">8. Changes to Terms</h2>
            <p className="mt-2 text-academy-muted">
              We may update these terms periodically. Continued use after updates constitutes acceptance
              of the revised terms.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="mt-2 text-academy-muted">
              Questions about these terms can be sent to{" "}
              <a
                href="mailto:support@neutronproductions.academy"
                className="font-medium text-academy-accent hover:text-academy-mint"
              >
                support@neutronproductions.academy
              </a>
              .
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
