import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublishedModulesWithProgress } from "@/server/services/curriculum-service";
import { getUserStreak } from "@/server/services/progress-service";
import { getLatestRecommendation } from "@/server/services/recommendation-service";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [modules, streak, recommendation, completedLessonsCount, totalLessonsCount] = await Promise.all([
    getPublishedModulesWithProgress(userId),
    getUserStreak(userId),
    getLatestRecommendation(userId),
    prisma.progress.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),
    prisma.lesson.count({
      where: {
        published: true,
        module: { published: true },
      },
    }),
  ]);

  const moduleCount = modules.length;
  const overallProgress =
    moduleCount > 0
      ? clampPercent(Math.round(modules.reduce((sum, module) => sum + module.percentComplete, 0) / moduleCount))
      : 0;

  const learnerName = session.user.name?.trim() || "there";

  return (
    <main className="min-h-screen bg-academy-bg px-4 py-8 text-academy-text sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="glass-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-academy-mint">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Welcome back, <span className="gradient-text">{learnerName}</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-academy-muted md:text-base">
            Continue your web development track with personalized next steps and a clear view of your momentum.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3" aria-label="Dashboard highlights">
          <article className="glass-card p-6 xl:col-span-2">
            <h2 className="text-xl font-semibold text-academy-text">Next Up</h2>

            {recommendation?.lesson ? (
              <div className="mt-4 rounded-xl border border-academy-accent/30 bg-academy-card/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-academy-mint">
                  Recommended lesson
                </p>
                <h3 className="mt-2 text-2xl font-bold text-academy-text">{recommendation.lesson.title}</h3>
                <p className="mt-1 text-sm text-academy-muted">
                  Module: <span className="font-medium text-academy-text">{recommendation.module?.title ?? "Unassigned"}</span>
                </p>
                <p className="mt-4 rounded-lg border border-academy-muted/20 bg-academy-bg/60 p-3 text-sm leading-relaxed text-academy-text/90">
                  {recommendation.reason}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/lesson/${recommendation.lesson.slug}`}
                    className="hover-lift inline-flex items-center rounded-lg bg-academy-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academy-violet"
                  >
                    Continue
                  </Link>
                  {recommendation.module?.slug ? (
                    <Link
                      href={`/module/${recommendation.module.slug}`}
                      className="inline-flex items-center rounded-lg border border-academy-muted/35 bg-academy-bg px-4 py-2.5 text-sm font-medium text-academy-text transition hover:border-academy-mint/60"
                    >
                      View module
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-academy-muted/30 bg-academy-card/70 p-5">
                <h3 className="text-lg font-semibold text-academy-text">No recommendation yet</h3>
                <p className="mt-2 text-sm text-academy-muted">
                  Start your first lesson to unlock personalized recommendations.
                </p>
                <Link
                  href="/curriculum"
                  className="hover-lift mt-4 inline-flex items-center rounded-lg bg-academy-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academy-violet"
                >
                  Start your first lesson!
                </Link>
              </div>
            )}
          </article>

          <article className="glass-card p-6" aria-labelledby="progress-overview-title">
            <h2 id="progress-overview-title" className="text-xl font-semibold text-academy-text">
              Progress overview
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-academy-muted">
                  <span>Overall progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-academy-card/80">
                  <div
                    className="progress-fill h-full rounded-full bg-gradient-to-r from-academy-accent to-academy-mint"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              <dl className="grid gap-3">
                <div className="rounded-lg border border-academy-muted/25 bg-academy-card/70 px-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-academy-muted">Streak</dt>
                  <dd className="mt-1 text-2xl font-bold text-academy-text">🔥 {streak} day{streak === 1 ? "" : "s"}</dd>
                </div>
                <div className="rounded-lg border border-academy-muted/25 bg-academy-card/70 px-3 py-3">
                  <dt className="text-xs uppercase tracking-wide text-academy-muted">Completed lessons</dt>
                  <dd className="mt-1 text-2xl font-bold text-academy-text">{completedLessonsCount} <span className="text-sm font-normal text-academy-muted">/ {totalLessonsCount}</span></dd>
                </div>
              </dl>
            </div>
          </article>
        </section>

        <section aria-labelledby="module-progress-title" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="module-progress-title" className="text-2xl font-bold text-academy-text">
                Module Progress
              </h2>
              <p className="mt-1 text-sm text-academy-muted">Track your momentum across each published module.</p>
            </div>
            <Link
              href="/curriculum"
              className="inline-flex items-center rounded-lg border border-academy-muted/35 bg-academy-card px-4 py-2 text-sm font-medium text-academy-text transition hover:border-academy-accent/60"
            >
              View full curriculum
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <article key={module.id} className="glass-card hover-lift p-5">
                <h3 className="text-lg font-semibold text-academy-text">{module.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-academy-muted">{module.description}</p>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-academy-muted">
                    <span>
                      {module.completedLessons}/{module.lessonCount} lessons
                    </span>
                    <span>{module.percentComplete}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-academy-bg/90">
                    <div
                      className="progress-fill h-full rounded-full bg-gradient-to-r from-academy-violet to-academy-accent"
                      style={{ width: `${clampPercent(module.percentComplete)}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/module/${module.slug}`}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-academy-accent transition hover:text-academy-mint"
                >
                  Open module →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
