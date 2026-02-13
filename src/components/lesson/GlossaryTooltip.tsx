"use client";

import { useId, useState } from "react";

interface GlossaryTooltipProps {
  term: string;
  definition: string;
}

export default function GlossaryTooltip({ term, definition }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex" onMouseLeave={() => setIsOpen(false)}>
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        aria-label={`Glossary term: ${term}`}
        onMouseEnter={() => setIsOpen(true)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="rounded-sm border-b border-dotted border-academy-mint/80 text-academy-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-accent"
      >
        {term}
      </button>

      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2 rounded-lg border border-academy-muted/30 bg-academy-card px-3 py-2 text-left text-xs leading-relaxed text-academy-text shadow-xl transition-all duration-150 ${
          isOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"
        }`}
      >
        {definition}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-academy-muted/30 bg-academy-card"
        />
      </span>
    </span>
  );
}
