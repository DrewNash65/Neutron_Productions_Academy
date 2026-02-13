"use client";

import { useMemo } from "react";

interface ErrorExplainerProps {
  errorText: string;
}

type ExplanationRule = {
  pattern: RegExp;
  title: string;
  explanation: string;
  tips: string[];
};

const ERROR_RULES: ExplanationRule[] = [
  {
    pattern: /SyntaxError/i,
    title: "Syntax Error",
    explanation:
      "JavaScript found code that does not follow language rules. This usually means something is missing or misplaced.",
    tips: [
      "Check for missing commas, semicolons, or parentheses.",
      "Look for unmatched curly braces {} and quotes.",
      "Review the line where the error points first, then the line above it.",
    ],
  },
  {
    pattern: /ReferenceError/i,
    title: "Reference Error",
    explanation:
      "Your code is trying to use a variable or function name that does not exist in the current scope.",
    tips: [
      "Confirm the variable is declared before use.",
      "Check for typos in variable and function names.",
      "If using let/const, ensure the reference is not before declaration.",
    ],
  },
  {
    pattern: /TypeError/i,
    title: "Type Error",
    explanation:
      "An operation is being used on a value of the wrong type. For example, calling a method on undefined.",
    tips: [
      "Log the value before using it to confirm its type.",
      "Use optional chaining (?.) when a value may be missing.",
      "Check function return values before accessing properties.",
    ],
  },
  {
    pattern: /undefined is not a function|is not a function/i,
    title: "Function Call Error",
    explanation:
      "Your code tried to call something like a function, but the value is not actually a function.",
    tips: [
      "Verify the method name exists on that object.",
      "Confirm the value is not undefined or null before calling it.",
      "Check imports/exports if this function comes from another file.",
    ],
  },
  {
    pattern: /Unexpected token/i,
    title: "Unexpected Token",
    explanation:
      "The parser found a character or keyword where it did not expect one.",
    tips: [
      "Look for extra commas, brackets, or stray characters.",
      "Check object/array syntax and closing delimiters.",
      "If using JSX/HTML-like syntax, ensure tags are properly closed.",
    ],
  },
  {
    pattern: /missing closing tag|end tag|not properly closed|Unclosed tag/i,
    title: "Missing Closing Tag",
    explanation:
      "An HTML tag appears to be opened but not closed correctly.",
    tips: [
      "Match each opening tag with a closing tag.",
      "Check nesting order (inner tags should close before outer tags).",
      "Use indentation to make tag structure easier to scan.",
    ],
  },
  {
    pattern: /Cannot read properties of undefined|Cannot read property/i,
    title: "Undefined Property Access",
    explanation:
      "The code is trying to read a property from a value that is undefined or null.",
    tips: [
      "Trace where the value is set to ensure it exists.",
      "Guard access with conditionals or optional chaining.",
      "Check asynchronous data loading timing.",
    ],
  },
  {
    pattern: /Failed to execute|DOMException/i,
    title: "Browser API Error",
    explanation:
      "A browser API call failed because the input or context was invalid.",
    tips: [
      "Review the exact API method and required arguments.",
      "Ensure related DOM elements exist before interacting with them.",
      "Verify sandbox/security restrictions if running inside an iframe.",
    ],
  },
];

const FALLBACK_EXPLANATION = {
  title: "General Debugging Guidance",
  explanation: "Try checking your syntax and verifying variable names and values step by step.",
  tips: [
    "Read the exact error message and location carefully.",
    "Comment out sections to isolate the failing code.",
    "Add console.log statements to inspect intermediate values.",
  ],
};

export default function ErrorExplainer({ errorText }: ErrorExplainerProps) {
  const normalizedError = errorText.trim();

  const explanation = useMemo(() => {
    const match = ERROR_RULES.find((rule) => rule.pattern.test(normalizedError));
    return match ?? FALLBACK_EXPLANATION;
  }, [normalizedError]);

  if (!normalizedError) return null;

  return (
    <section
      className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100 shadow-lg"
      aria-label="Friendly error explanation"
      role="status"
    >
      <h3 className="text-base font-semibold text-amber-200">{explanation.title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{explanation.explanation}</p>

      <div className="mt-3 rounded-lg border border-amber-300/30 bg-black/15 p-3">
        <p className="text-xs uppercase tracking-wide text-amber-200">Original error</p>
        <p className="mt-1 break-words font-mono text-xs text-amber-100">{normalizedError}</p>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        {explanation.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-amber-200/90">
        This is automated guidance and may not be perfectly accurate.
      </p>
    </section>
  );
}
