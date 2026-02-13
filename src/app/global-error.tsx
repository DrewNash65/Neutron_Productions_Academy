"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-academy-bg text-academy-text">
        <div className="text-center space-y-6 max-w-lg mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text">Something went wrong</h1>
          <p className="text-academy-muted">
            An unexpected error occurred. Our team has been notified.
          </p>
          <p className="text-sm text-academy-muted">
            Error reference: {error.digest ?? "N/A"}
          </p>
          <button
            onClick={reset}
            className="bg-academy-accent hover:bg-academy-accent/80 text-white font-semibold px-6 py-3 rounded-lg hover-lift"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
