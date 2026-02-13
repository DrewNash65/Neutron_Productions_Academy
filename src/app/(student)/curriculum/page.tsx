import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getPublishedModulesWithProgress } from "@/server/services/curriculum-service";

function moduleStatus(module: {
  comingSoon: boolean;
  percentComplete: number;
  lessonCount: number;
  completedLessons: number;
}) {
  if (module.comingSoon) {
    return "Coming Soon";
  }

  if (module.lessonCount > 0 && module.completedLessons === module.lessonCount) {
    return "Completed";
  }

  if (module.percentComplete > 0) {
    return "In Progress";
  }

  return "Not Started";
}

function statusStyles(status: string) {
  switch (status) {
    case "Completed":
      return "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";
    case "In Progress":
      return "border-academy-accent/40 bg-academy-accent/15 text-academy-text";
    case "Coming Soon":
      return "border-amber-400/40 bg-amber-500/10 text-amber-100";
    default:
      return "border-academy-muted/35 bg-academy-card/60 text-academy-muted";
  }
}

export default async function CurriculumPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const modules = await getPublishedModulesWithProgress(session.user.id);

  return (
    <main className="min-h-screen bg-academy-bg px-4 py-8 text-academy-text sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="glass-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-academy-mint">Curriculum</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            <span className="gradient-text">Web Developer Track</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-academy-muted md:text-base">
            Build practical skills through progressively structured modules. Complete lessons in order to unlock your next steps.
          </p>
        </header>

        <section aria-labelledby="modules-title" className="space-y-4">
          <h2 id="modules-title" className="text-2xl font-semibold text-academy-text">
            Modules
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const status = moduleStatus(module);
              const isCompleted = status === "Completed";
              const isComingSoon = status === "Coming Soon";

              return (
                <article
                  key={module.id}
                  className={`glass-card relative flex h-full flex-col p-5 ${isComingSoon ? "opacity-80" : "hover-lift"}`}
                  aria-label={`${module.title} module card`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-xl font-semibold text-academy-text">{module.title}</h3>
                    {isCompleted ? <span aria-hidden="true">✅</span> : null}
                    {isComingSoon ? <span aria-hidden="true">🔒</span> : null}
                  </div>

                  <p className="text-sm leading-relaxed text-academy-muted">{module.description}</p>

                  <p className="mt-3 text-xs uppercase tracking-wide text-academy-muted">
                    {module.lessonCount} lesson{module.lessonCount === 1 ? "" : "s"}
                  </p>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-academy-muted">
                      <span>
                        {module.completedLessons}/{module.lessonCount} complete
                      </span>
                      <span>{module.percentComplete}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-academy-bg/80">
                      <div
                        className="progress-fill h-full rounded-full bg-gradient-to-r from-academy-violet to-academy-mint"
                        style={{ width: `${Math.max(0, Math.min(100, module.percentComplete))}%` }}
                      />
                    </div>
                  </div>

                  <span className={`mt-4 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles(status)}`}>
                    {status}
                    {isComingSoon ? " • Coming Soon" : ""}
                  </span>

                  <div className="mt-5 pt-1">
                    {isComingSoon ? (
                      <span className="inline-flex cursor-not-allowed items-center rounded-lg border border-academy-muted/35 bg-academy-card/80 px-4 py-2 text-sm font-medium text-academy-muted">
                        Available soon
                      </span>
                    ) : (
                      <Link
                        href={`/module/${module.slug}`}
                        className="inline-flex items-center rounded-lg bg-academy-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-academy-violet"
                      >
                        Open module
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
