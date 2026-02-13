"use client";

import Link from "next/link";
import { useState } from "react";

interface SidebarLesson {
  slug: string;
  title: string;
  status: string;
  isCurrent: boolean;
}

interface LessonSidebarProps {
  moduleTitle: string;
  moduleSlug: string;
  lessons: SidebarLesson[];
  glossary: Record<string, string>;
}

function statusIcon(status: string, isCurrent: boolean): string {
  if (isCurrent) return "▶";
  if (status === "COMPLETED") return "✅";
  if (status === "IN_PROGRESS") return "◐";
  return "○";
}

export default function LessonSidebar({
  moduleTitle,
  moduleSlug,
  lessons,
  glossary,
}: LessonSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const glossaryTerms = Object.entries(glossary);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="lesson-sidebar"
        className="fixed bottom-4 left-4 z-40 rounded-full bg-academy-accent p-3 text-white shadow-lg transition hover:bg-academy-violet lg:hidden"
        aria-label={isOpen ? "Close sidebar" : "Open lesson outline"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {isOpen ? (
            <>
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </>
          )}
        </svg>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id="lesson-sidebar"
        className={`fixed top-0 left-0 z-30 h-full w-72 flex-shrink-0 overflow-y-auto border-r border-academy-accent/15 bg-academy-card/95 p-5 backdrop-blur-sm transition-transform lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Lesson outline"
      >
        <div className="mb-4">
          <Link
            href={`/module/${moduleSlug}`}
            className="inline-flex items-center text-xs text-academy-muted transition hover:text-academy-mint"
          >
            ← {moduleTitle}
          </Link>
        </div>

        <nav aria-label="Lesson list">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-academy-muted">
            Outline
          </h2>

          <ol className="space-y-1.5" role="list">
            {lessons.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/lesson/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  aria-current={item.isCurrent ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    item.isCurrent
                      ? "border border-academy-accent/30 bg-academy-accent/15 font-semibold text-academy-text"
                      : "text-academy-muted hover:bg-academy-bg/50 hover:text-academy-text"
                  }`}
                >
                  <span className="text-xs" aria-hidden="true">
                    {statusIcon(item.status, item.isCurrent)}
                  </span>
                  <span className="line-clamp-2">{item.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {glossaryTerms.length > 0 ? (
          <section className="mt-6 border-t border-academy-muted/20 pt-4" aria-labelledby="glossary-heading">
            <h2
              id="glossary-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-academy-muted"
            >
              Glossary
            </h2>

            <dl className="space-y-3">
              {glossaryTerms.map(([term, definition]) => (
                <div key={term}>
                  <dt className="text-sm font-semibold text-academy-mint">{term}</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-academy-muted">
                    {definition}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </aside>
    </>
  );
}
