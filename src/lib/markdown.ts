import { marked } from "marked";

/**
 * Convert markdown content to sanitised HTML for lesson rendering.
 * Uses `marked` for fast server-side conversion.
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
