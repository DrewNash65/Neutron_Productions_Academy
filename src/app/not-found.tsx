import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-academy-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-academy-accent hover:bg-academy-accent/80 text-white font-semibold px-6 py-3 rounded-lg hover-lift"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
