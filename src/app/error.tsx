"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-3xl font-bold gradient-text">Oops!</h1>
        <p className="text-academy-muted">
          Something went wrong loading this page. Please try again.
        </p>
        <p className="text-sm text-academy-muted/60">
          {error.digest ? `Reference: ${error.digest}` : ""}
        </p>
        <button
          onClick={reset}
          className="bg-academy-accent hover:bg-academy-accent/80 text-white font-semibold px-6 py-3 rounded-lg hover-lift"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
