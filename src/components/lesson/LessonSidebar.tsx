"use client";

import { useEffect, useMemo, useState } from "react";

type GlossaryMap = Record<string, string>;

type OutlineItem = {
  id: string;
  text: string;
  level: number;
};

interface LessonSidebarProps {
  lessonTitle: string;
  glossary?: GlossaryMap;
  progressPercent?: number;
  contentRootSelector?: string;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function LessonSidebar({
  lessonTitle,
  glossary = {},
  progressPercent = 0,
  contentRootSelector = "main",
}: LessonSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  useEffect(() => {
    // Build an outline from lesson headings to support quick navigation.
    const root = document.querySelector(contentRootSelector) ?? document.body;
    const headings = Array.from(root.querySelectorAll<HTMLElement>("h2, h3"));

    const nextOutline = headings
      .map((heading, index) => {
        const text = heading.textContent?.trim() || `Section ${index + 1}`;
        if (!heading.id) {
          const proposedId = toSlug(text) || `section-${index + 1}`;
          heading.id = proposedId;
        }

        const level = Number(heading.tagName.replace("H", "")) || 2;
        return {
          id: heading.id,
          text,
          level,
        };
      })
      .filter((item) => item.text.length > 0);

    setOutline(nextOutline);
  }, [contentRootSelector]);

  const glossaryEntries = useMemo(() => Object.entries(glossary), [glossary]);
  const normalizedProgress = Math.max(0, Math.min(100, Math.round(progressPercent)));

  return (
    <aside className="w-full lg:w-80" aria-label="Lesson sidebar">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-academy-muted/35 bg-academy-card px-4 py-3 text-left text-academy-text lg:hidden"
        aria-expanded={isMobileOpen}
        aria-controls="lesson-sidebar-panel"
        aria-label={isMobileOpen ? "Collapse lesson sidebar" : "Expand lesson sidebar"}
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        <span className="font-semibold">Lesson Menu</span>
        <span aria-hidden="true" className="text-xl leading-none">
          ☰
        </span>
      </button>

      <div
        id="lesson-sidebar-panel"
        className={`glass-card rounded-2xl border border-academy-muted/25 bg-academy-card p-4 text-academy-text shadow-xl lg:sticky lg:top-4 ${
          isMobileOpen ? "block" : "hidden lg:block"
        }`}
      >
        <header>
          <h2 className="gradient-text text-xl font-bold">{lessonTitle}</h2>

          <div className="mt-4" aria-label={`Lesson progress ${normalizedProgress}%`}>
            <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-academy-muted">
              <span>Progress</span>
              <span>{normalizedProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-academy-bg">
              <div
                className="progress-fill h-full rounded-full bg-gradient-to-r from-academy-accent via-academy-violet to-academy-mint transition-all duration-500"
                style={{ width: `${normalizedProgress}%` }}
              />
            </div>
          </div>
        </header>

        <section className="mt-6" aria-label="Lesson outline">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-academy-muted">Outline</h3>
          {outline.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {outline.map((item) => (
                <li key={item.id} className={item.level === 3 ? "pl-3" : "pl-0"}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-md px-2 py-1 text-sm text-academy-text transition hover:bg-academy-bg hover:text-academy-mint"
                    aria-label={`Jump to section ${item.text}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-academy-muted">No headings found yet.</p>
          )}
        </section>

        <section className="mt-6" aria-label="Glossary">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-academy-muted">Glossary</h3>
          {glossaryEntries.length > 0 ? (
            <div className="mt-2 space-y-2">
              {glossaryEntries.map(([term, definition]) => (
                <details
                  key={term}
                  className="rounded-lg border border-academy-muted/30 bg-academy-bg/60 p-3 text-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-academy-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-accent">
                    {term}
                  </summary>
                  <p className="mt-2 leading-relaxed text-academy-text/90">{definition}</p>
                </details>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-academy-muted">No glossary terms for this lesson.</p>
          )}
        </section>
      </div>
    </aside>
  );
}
