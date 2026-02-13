import Link from "next/link";

/**
 * Marketing homepage for Neutron Productions Coding Academy.
 * Server Component by default (no "use client").
 */
const curriculumModules = [
  {
    module: "Module 0",
    title: "Orientation",
    description:
      "Meet the platform, set your goals, and learn how lessons, projects, and feedback work.",
  },
  {
    module: "Module 1",
    title: "Computer Thinking + Logic",
    description:
      "Build problem-solving skills with patterns, sequencing, conditionals, and algorithmic thinking.",
  },
  {
    module: "Module 2",
    title: "Web Basics",
    description:
      "Learn how the web works and start building pages with semantic HTML and modern CSS.",
  },
  {
    module: "Module 3",
    title: "JavaScript",
    description:
      "Add interactivity with variables, functions, arrays, objects, and real debugging practice.",
  },
  {
    module: "Module 4",
    title: "Git + Workflow",
    description:
      "Use Git confidently: commits, branches, pull requests, and collaboration best practices.",
  },
  {
    module: "Module 5",
    title: "TypeScript + Modern Frontend",
    description:
      "Write safer frontends with TypeScript, reusable components, and modern app architecture.",
  },
  {
    module: "Module 6",
    title: "Backend + Databases",
    description:
      "Design APIs, model data, and connect apps to databases with secure backend fundamentals.",
  },
  {
    module: "Module 7",
    title: "Capstone Projects",
    description:
      "Ship portfolio-ready projects from planning to deployment with mentor-style guidance.",
  },
] as const;

const featureCards = [
  {
    title: "Interactive Sandbox",
    description:
      "Practice in-browser with instant feedback, guided hints, and safe experimentation.",
  },
  {
    title: "Personalized Learning",
    description:
      "Adaptive lesson flow aligns to your pace, goals, and preferred learning style.",
  },
  {
    title: "Progress Tracking",
    description:
      "Visual milestones and completion data keep momentum strong and measurable.",
  },
  {
    title: "Achievements & Badges",
    description:
      "Earn recognition as you master concepts, finish modules, and complete projects.",
  },
] as const;

const demoHtml = `<section class="card">
  <h2>Hello, Academy!</h2>
  <p>I just wrote my first HTML block.</p>
  <button>Run Demo</button>
</section>`;

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen bg-academy-bg text-academy-text">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 md:px-10 lg:px-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-academy-accent/20 bg-academy-card/70 px-8 py-16 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,140,255,0.2),transparent_45%),radial-gradient(circle_at_left,rgba(94,234,212,0.16),transparent_40%)]" />
          <div className="relative z-10 max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-academy-violet/40 bg-academy-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-academy-violet">
              Neutron Productions Coding Academy
            </p>
            <h1 className="gradient-text text-4xl font-bold leading-tight md:text-6xl">
              Learn to code with confidence, structure, and real projects.
            </h1>
            <p className="mt-6 text-lg text-academy-muted md:text-xl">
              Learn to code from scratch — guided, interactive, and personal
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="hover-lift rounded-xl bg-academy-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-academy-violet"
              >
                Start Learning
              </Link>
              <Link
                href="/login"
                className="hover-lift rounded-xl border border-academy-mint/60 bg-academy-mint/10 px-6 py-3 text-sm font-semibold text-academy-mint transition hover:bg-academy-mint/20"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        {/* Curriculum preview */}
        <section className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-academy-text">Curriculum Preview</h2>
              <p className="mt-2 text-sm text-academy-muted md:text-base">
                A complete path from first concepts to capstone-ready development.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {curriculumModules.map((item) => (
              <article
                key={item.module}
                className="glass-card hover-lift p-5"
                aria-label={`${item.module}: ${item.title}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-academy-mint">
                  {item.module}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-academy-text">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-academy-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Demo lesson preview */}
        <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-academy-text">Try a Demo Lesson</h2>
            <p className="mt-3 max-w-xl text-academy-muted">
              Explore a realistic coding lesson preview with an editor-style interface. This is a visual
              demo to show what hands-on learning looks like in the Academy.
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-academy-accent/20 bg-academy-card/90 px-4 py-3">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-academy-muted">lesson-demo.html</span>
            </div>

            <div className="bg-[#0a1328] p-4 font-mono text-sm text-academy-text">
              <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">{demoHtml}</pre>
            </div>

            <div className="border-t border-academy-accent/20 bg-academy-card/70 px-4 py-3">
              <button
                type="button"
                className="hover-lift rounded-lg bg-academy-accent px-4 py-2 text-sm font-semibold text-white"
                aria-label="Run demo code preview (visual only)"
              >
                Run
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-academy-text">Why learners choose us</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <article key={feature.title} className="glass-card hover-lift p-5">
                <h3 className="text-lg font-semibold text-academy-text">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-academy-muted">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-academy-accent/20 pt-8">
          <div className="flex flex-col items-start justify-between gap-4 text-sm text-academy-muted md:flex-row md:items-center">
            <p>© 2026 Neutron Productions</p>
            <nav aria-label="Footer links" className="flex items-center gap-5">
              <Link href="/privacy" className="transition hover:text-academy-mint">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-academy-mint">
                Terms
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
