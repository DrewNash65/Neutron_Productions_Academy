"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav
      className="sticky top-0 z-40 border-b border-academy-accent/15 bg-academy-bg/80 backdrop-blur-xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold gradient-text group-hover:opacity-90 transition-opacity">
            Neutron Academy
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          {status === "loading" && (
            <div className="w-20 h-8 bg-academy-card animate-pulse rounded-lg" />
          )}

          {status === "authenticated" && session?.user && (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-academy-muted hover:text-academy-text transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/curriculum"
                className="text-sm text-academy-muted hover:text-academy-text transition-colors"
              >
                Curriculum
              </Link>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-academy-violet hover:text-academy-violet/80 transition-colors"
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-academy-accent/20">
                <span className="text-sm text-academy-muted">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs bg-academy-card text-academy-muted px-3 py-1.5 rounded-lg hover:text-academy-text hover:bg-academy-card/80 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className="text-sm text-academy-muted hover:text-academy-text transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-academy-accent text-white px-4 py-2 rounded-lg hover-lift font-medium"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
