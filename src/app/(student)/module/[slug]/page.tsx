import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getModuleBySlugForUser } from "@/server/services/curriculum-service";

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return { label: "Completed", styles: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" };
    case "IN_PROGRESS":
      return { label: "In Progress", styles: "border-academy-accent/40 bg-academy-accent/15 text-academy-text" };
    default:
      return { label: "Not Started", styles: "border-academy-muted/25 bg-academy-card/50 text-academy-muted" };
  }
}

function DifficultyDots({ difficulty, max = 5 }: { difficulty: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Difficulty ${difficulty} out of ${max}`} role="img">
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={`inline-block h-2 w-2 rounded-full ${index < difficulty ? "bg-academy-accent" : "bg-academy-muted/30"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default async function ModuleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const module = await getModuleBySlugForUser(params.slug, session.user.id);

  if (!module) {
    notFound();
  }

  const totalLessons = module.lessons.length;
  const completedCount = module.lessons.filter((lesson) => lesson.status === "COMPLETED").length;
  const modulePercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <main className="min-h-screen bg-academy-bg px-4 py-8 text-academy-text sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <nav>
          <Link
            href="/curriculum"
            className="inline-flex items-center text-sm text-academy-muted transition hover:text-academy-mint"
          >
            ← Back to curriculum
          </Link>
        </nav>

        <header className="glass-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-academy-mint">Module</p>
          <h1 className="mt-2 text-3xl font-bold gradient-text md:text-4xl">{module.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-academy-muted md:text-base">
            {module.description}
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-academy-muted">
              <span>
                {completedCount}/{totalLessons} lesson{totalLessons === 1 ? "" : "s"} completed
              </span>
              <span>{modulePercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-academy-card/80">
              <div
                className="progress-fill h-full rounded-full bg-gradient-to-r from-academy-accent to-academy-mint"
                style={{ width: `${modulePercent}%` }}
              />
            </div>
          </div>
        </header>

        <section aria-labelledby="lessons-title" className="space-y-4">
          <h2 id="lessons-title" className="text-xl font-semibold text-academy-text">
            Lessons
          </h2>

          <ol className="space-y-4" role="list" aria-label="Lesson list">
            {module.lessons.map((lesson, index) => {
              const badge = statusBadge(lesson.status);
              const isLocked = lesson.locked;
              const isCompleted = lesson.status === "COMPLETED";

              return (
                <li key={lesson.id}>
                  <article
                    className={`glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                      isLocked ? "opacity-60" : "hover-lift"
                    }`}
                    aria-label={`${isLocked ? "Locked lesson: " : ""}${lesson.title}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-academy-muted/30 bg-academy-card text-xs font-semibold text-academy-accent">
                          {isLocked ? "🔒" : isCompleted ? "✅" : index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-academy-text">{lesson.title}</h3>
                      </div>

                      {lesson.summary ? (
                        <p className="mt-2 ml-10 line-clamp-2 text-sm text-academy-muted">
                          {lesson.summary}
                        </p>
                      ) : null}

                      <div className="mt-3 ml-10 flex flex-wrap items-center gap-3 text-xs text-academy-muted">
                        <span className="inline-flex items-center gap-1">
                          ~{lesson.estimatedMinutes} min
                        </span>
                        <DifficultyDots difficulty={lesson.difficulty} />
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.styles}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <div className="sm:pl-4">
                      {isLocked ? (
                        <span
                          className="inline-flex cursor-not-allowed items-center rounded-lg border border-academy-muted/30 bg-academy-card/80 px-4 py-2 text-sm font-medium text-academy-muted"
                          aria-label="Locked, complete prerequisites first"
                        >
                          Locked
                        </span>
                      ) : (
                        <Link
                          href={`/lesson/${lesson.slug}`}
                          className="hover-lift inline-flex items-center rounded-lg bg-academy-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-academy-violet"
                        >
                          {isCompleted ? "Review" : lesson.status === "IN_PROGRESS" ? "Continue" : "Start"}
                        </Link>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}
