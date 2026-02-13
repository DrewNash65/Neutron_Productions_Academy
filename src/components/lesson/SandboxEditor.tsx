"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ValidationType = "DOM_CHECK" | "JS_CHECK";

type ValidationConfig = {
  selectors?: string[];
  expectedOutput?: string | string[];
  matchMode?: "exact" | "includes";
};

export type SandboxExercise = {
  id: string;
  prompt: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  hint?: string;
  validationType?: ValidationType;
  validationConfig?: ValidationConfig;
};

type TabKey = "HTML" | "CSS" | "JavaScript";

interface SandboxEditorProps {
  exercises?: SandboxExercise[];
}

const DEFAULT_SNIPPETS = {
  html: "<h1>Hello Academy</h1>\n<p>Edit this HTML and click Run.</p>",
  css: "body {\n  font-family: system-ui, sans-serif;\n  color: #e2e8f0;\n  background: #0b1020;\n}",
  js: "console.log('Sandbox ready!');",
};

const TAB_TO_KEY: Record<TabKey, "html" | "css" | "js"> = {
  HTML: "html",
  CSS: "css",
  JavaScript: "js",
};

function escapeScriptContent(input: string): string {
  return input.replace(/<\/script/gi, "<\\/script");
}

function createSrcDoc({
  html,
  css,
  js,
  messageSource,
}: {
  html: string;
  css: string;
  js: string;
  messageSource: string;
}): string {
  const safeJs = escapeScriptContent(js);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    window.addEventListener('error', function (event) {
      parent.postMessage(
        {
          source: '${messageSource}',
          type: 'runtime-error',
          message: event && event.message ? event.message : 'Unknown runtime error'
        },
        '*'
      );
    });

    window.addEventListener('unhandledrejection', function (event) {
      var reason = event && event.reason;
      parent.postMessage(
        {
          source: '${messageSource}',
          type: 'runtime-error',
          message: reason && reason.message ? reason.message : String(reason || 'Unhandled promise rejection')
        },
        '*'
      );
    });
  </script>
  <script>${safeJs}</script>
</body>
</html>`;
}

export default function SandboxEditor({ exercises = [] }: SandboxEditorProps) {
  const hasExercises = exercises.length > 0;
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const currentExercise = hasExercises ? exercises[exerciseIndex] : undefined;

  const [activeTab, setActiveTab] = useState<TabKey>("HTML");
  const [code, setCode] = useState({
    html: currentExercise?.starterHtml ?? DEFAULT_SNIPPETS.html,
    css: currentExercise?.starterCss ?? DEFAULT_SNIPPETS.css,
    js: currentExercise?.starterJs ?? DEFAULT_SNIPPETS.js,
  });

  const [srcDoc, setSrcDoc] = useState<string>(
    createSrcDoc({
      html: code.html,
      css: code.css,
      js: code.js,
      messageSource: "sandbox-preview",
    }),
  );

  const [previewError, setPreviewError] = useState<string>("");
  const [hintVisible, setHintVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [validationPassed, setValidationPassed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeKey = TAB_TO_KEY[activeTab];
  const activeCode = code[activeKey];

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, activeCode.split("\n").length);
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [activeCode]);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (!event.data || event.data.source !== "sandbox-preview") return;
      if (event.data.type === "runtime-error") {
        setPreviewError(String(event.data.message ?? "Unknown runtime error"));
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  useEffect(() => {
    if (!currentExercise) return;

    const nextCode = {
      html: currentExercise.starterHtml,
      css: currentExercise.starterCss,
      js: currentExercise.starterJs,
    };

    setCode(nextCode);
    setSrcDoc(
      createSrcDoc({
        html: nextCode.html,
        css: nextCode.css,
        js: nextCode.js,
        messageSource: "sandbox-preview",
      }),
    );
    setHintVisible(false);
    setValidationMessage("");
    setValidationPassed(null);
    setPreviewError("");
    setActiveTab("HTML");
  }, [currentExercise]);

  const handleRun = () => {
    setPreviewError("");
    setSrcDoc(
      createSrcDoc({
        html: code.html,
        css: code.css,
        js: code.js,
        messageSource: "sandbox-preview",
      }),
    );
  };

  const handleReset = () => {
    const resetCode = currentExercise
      ? {
          html: currentExercise.starterHtml,
          css: currentExercise.starterCss,
          js: currentExercise.starterJs,
        }
      : DEFAULT_SNIPPETS;

    setCode(resetCode);
    setValidationMessage("");
    setValidationPassed(null);
    setPreviewError("");
    setHintVisible(false);
    setSrcDoc(
      createSrcDoc({
        html: resetCode.html,
        css: resetCode.css,
        js: resetCode.js,
        messageSource: "sandbox-preview",
      }),
    );
  };

  const updateActiveTabCode = (value: string) => {
    setCode((prev) => ({ ...prev, [activeKey]: value }));
  };

  const runValidationInHiddenIframe = async (
    exercise: SandboxExercise,
  ): Promise<{ passed: boolean; message: string }> => {
    if (!exercise.validationType || !exercise.validationConfig) {
      return {
        passed: false,
        message: "This exercise is missing validation rules.",
      };
    }

    const token = `validation-${exercise.id}-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "absolute";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.left = "-9999px";

    const validationScript =
      exercise.validationType === "DOM_CHECK"
        ? `
          window.addEventListener('load', function () {
            setTimeout(function () {
              var selectors = ${JSON.stringify(exercise.validationConfig.selectors ?? [])};
              var missing = selectors.filter(function (selector) {
                return !document.querySelector(selector);
              });

              parent.postMessage(
                {
                  source: 'sandbox-validation',
                  token: '${token}',
                  mode: 'DOM_CHECK',
                  missing: missing
                },
                '*'
              );
            }, 120);
          });
        `
        : `
          window.__academyLogs = [];
          (function () {
            var originalLog = console.log;
            console.log = function () {
              var message = Array.prototype.slice.call(arguments).map(function (item) {
                if (typeof item === 'string') return item;
                try {
                  return JSON.stringify(item);
                } catch (error) {
                  return String(item);
                }
              }).join(' ');

              window.__academyLogs.push(message);
              originalLog.apply(console, arguments);
            };
          })();

          window.addEventListener('load', function () {
            setTimeout(function () {
              parent.postMessage(
                {
                  source: 'sandbox-validation',
                  token: '${token}',
                  mode: 'JS_CHECK',
                  logs: window.__academyLogs
                },
                '*'
              );
            }, 250);
          });
        `;

    const validationSrcDoc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>${code.css}</style>
</head>
<body>
  ${code.html}
  <script>
    window.addEventListener('error', function (event) {
      parent.postMessage(
        {
          source: 'sandbox-validation',
          token: '${token}',
          mode: 'RUNTIME_ERROR',
          message: event && event.message ? event.message : 'Unknown runtime error'
        },
        '*'
      );
    });
  </script>
  <script>${escapeScriptContent(code.js)}</script>
  <script>${escapeScriptContent(validationScript)}</script>
</body>
</html>`;

    return new Promise((resolve) => {
      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };

      const timeout = window.setTimeout(() => {
        cleanup();
        resolve({
          passed: false,
          message: "Validation timed out. Please try again.",
        });
      }, 4000);

      const messageListener = (event: MessageEvent) => {
        const data = event.data;
        if (!data || data.source !== "sandbox-validation" || data.token !== token) {
          return;
        }

        window.clearTimeout(timeout);
        cleanup();

        if (data.mode === "RUNTIME_ERROR") {
          resolve({
            passed: false,
            message: `Your code threw an error during validation: ${String(data.message)}`,
          });
          return;
        }

        if (data.mode === "DOM_CHECK") {
          const missing = Array.isArray(data.missing) ? (data.missing as string[]) : [];
          if (missing.length === 0) {
            resolve({
              passed: true,
              message: "Passed. All required DOM selectors were found.",
            });
          } else {
            resolve({
              passed: false,
              message: `Not yet. Missing required selectors: ${missing.join(", ")}`,
            });
          }
          return;
        }

        if (data.mode === "JS_CHECK") {
          const logs: string[] = Array.isArray(data.logs) ? data.logs.map(String) : [];
          const expected = exercise.validationConfig?.expectedOutput;
          const expectedLines = Array.isArray(expected)
            ? expected.map(String)
            : expected
              ? [String(expected)]
              : [];

          if (expectedLines.length === 0) {
            resolve({
              passed: false,
              message: "This exercise is missing expected console output configuration.",
            });
            return;
          }

          const mode = exercise.validationConfig?.matchMode ?? "exact";
          const normalizedActual = logs.join("\n").trim();
          const normalizedExpected = expectedLines.join("\n").trim();

          const passed =
            mode === "includes"
              ? expectedLines.every((line) => normalizedActual.includes(line.trim()))
              : normalizedActual === normalizedExpected;

          resolve({
            passed,
            message: passed
              ? "Passed. Console output matches expected output."
              : `Not yet. Expected output:\n${normalizedExpected || "(empty)"}\n\nYour output:\n${normalizedActual || "(empty)"}`,
          });
        }
      };

      window.addEventListener("message", messageListener);
      document.body.appendChild(iframe);
      iframe.srcdoc = validationSrcDoc;
    });
  };

  const handleCheck = async () => {
    if (!currentExercise) return;

    setIsChecking(true);
    setValidationMessage("");
    setValidationPassed(null);

    const result = await runValidationInHiddenIframe(currentExercise);
    setValidationPassed(result.passed);
    setValidationMessage(result.message);
    setIsChecking(false);

    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: currentExercise.id,
        htmlSnapshot: code.html,
        cssSnapshot: code.css,
        jsSnapshot: code.js,
        result: result.passed ? "PASS" : "FAIL",
        feedback: result.message,
      }),
    }).catch(() => {
      // Intentionally non-blocking: server logging should not interrupt learner flow.
    });
  };

  const canGoNext = Boolean(hasExercises && validationPassed && exerciseIndex < exercises.length - 1);

  return (
    <section
      className="glass-card rounded-2xl border border-academy-muted/25 bg-academy-card p-4 text-academy-text shadow-xl md:p-6"
      aria-label="Interactive code sandbox"
    >
      {currentExercise ? (
        <div className="mb-4 rounded-xl border border-academy-accent/40 bg-academy-bg/80 p-4">
          <p className="text-xs uppercase tracking-wider text-academy-mint">Current exercise</p>
          <h3 className="mt-1 text-lg font-semibold text-academy-text">Exercise {exerciseIndex + 1}</h3>
          <p className="mt-2 text-sm leading-relaxed text-academy-text/90">{currentExercise.prompt}</p>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Code editor tabs">
        {(["HTML", "CSS", "JavaScript"] as TabKey[]).map((tab) => {
          const selected = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab}`}
              aria-label={`Switch to ${tab} editor`}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-academy-accent text-white"
                  : "bg-academy-bg text-academy-muted hover:bg-academy-bg/70 hover:text-academy-text"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        className="overflow-hidden rounded-xl border border-academy-muted/30 bg-[#0a0f1d]"
        aria-label={`${activeTab} editor panel`}
      >
        <div className="flex max-h-[320px] min-h-[240px]">
          <div
            ref={lineNumbersRef}
            aria-hidden="true"
            className="w-12 overflow-hidden border-r border-academy-muted/20 bg-black/20 px-2 py-3 text-right font-mono text-xs leading-6 text-academy-muted"
          >
            {lineNumbers.map((line) => (
              <div key={line} className="h-6">
                {line}
              </div>
            ))}
          </div>

          <textarea
            ref={textAreaRef}
            aria-label={`${activeTab} code editor`}
            value={activeCode}
            onChange={(event) => updateActiveTabCode(event.target.value)}
            onScroll={(event) => {
              if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop;
              }
            }}
            spellCheck={false}
            className="h-[320px] w-full resize-y bg-transparent p-3 font-mono text-sm leading-6 text-academy-text outline-none ring-0 placeholder:text-academy-muted/70"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRun}
          aria-label="Run code in preview"
          className="hover-lift rounded-lg bg-academy-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Run
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset code to starter template"
          className="rounded-lg border border-academy-muted/40 bg-academy-bg px-4 py-2 text-sm text-academy-text transition hover:border-academy-mint/60"
        >
          Reset
        </button>

        {currentExercise?.hint ? (
          <button
            type="button"
            onClick={() => setHintVisible((prev) => !prev)}
            aria-expanded={hintVisible}
            aria-controls="sandbox-hint"
            aria-label={hintVisible ? "Hide hint" : "Show hint"}
            className="rounded-lg border border-academy-violet/40 bg-academy-violet/10 px-4 py-2 text-sm text-academy-violet transition hover:bg-academy-violet/20"
          >
            {hintVisible ? "Hide Hint" : "Show Hint"}
          </button>
        ) : null}

        {currentExercise ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={isChecking}
            aria-label="Check exercise solution"
            className="rounded-lg bg-academy-mint px-4 py-2 text-sm font-semibold text-academy-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isChecking ? "Checking..." : "Check"}
          </button>
        ) : null}

        {canGoNext ? (
          <button
            type="button"
            onClick={() => setExerciseIndex((prev) => prev + 1)}
            aria-label="Go to next exercise"
            className="rounded-lg border border-academy-mint/50 bg-academy-bg px-4 py-2 text-sm font-medium text-academy-mint transition hover:bg-academy-mint/10"
          >
            Next Exercise
          </button>
        ) : null}
      </div>

      {hintVisible && currentExercise?.hint ? (
        <div id="sandbox-hint" className="mt-3 rounded-lg border border-academy-violet/30 bg-academy-violet/10 p-3 text-sm text-academy-text">
          <p className="font-semibold text-academy-violet">Hint</p>
          <p className="mt-1">{currentExercise.hint}</p>
        </div>
      ) : null}

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-academy-muted">Preview</h4>
        <iframe
          title="Sandbox output preview"
          aria-label="Rendered sandbox output"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          className="h-72 w-full rounded-xl border border-academy-muted/30 bg-white"
        />

        <div className="mt-3" aria-live="polite">
          {previewError ? (
            <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              <p className="font-semibold">Runtime Error</p>
              <p className="mt-1 whitespace-pre-wrap">{previewError}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-academy-muted/25 bg-academy-bg/70 p-3 text-sm text-academy-muted">
              No runtime errors detected.
            </div>
          )}
        </div>
      </div>

      {validationPassed !== null ? (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            validationPassed
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-400/40 bg-red-500/10 text-red-200"
          }`}
          aria-live="polite"
        >
          <p className="font-semibold">{validationPassed ? "Passed" : "Not Passed Yet"}</p>
          <p className="mt-1 whitespace-pre-wrap">{validationMessage}</p>
        </div>
      ) : null}
    </section>
  );
}
