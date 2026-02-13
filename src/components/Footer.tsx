import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-academy-accent/10 bg-academy-bg mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg gradient-text mb-2">Neutron Productions</h3>
            <p className="text-sm text-academy-muted max-w-xs">
              An interactive coding academy that takes you from absolute beginner to building real
              projects.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-academy-text mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/curriculum" className="text-sm text-academy-muted hover:text-academy-accent transition-colors">
                  Curriculum
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-academy-muted hover:text-academy-accent transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-academy-muted hover:text-academy-accent transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-academy-text mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-academy-muted hover:text-academy-accent transition-colors">
                  Privacy Notice
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-academy-muted hover:text-academy-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-academy-accent/10 mt-8 pt-6 text-center">
          <p className="text-xs text-academy-muted">
            &copy; {new Date().getFullYear()} Neutron Productions. All rights reserved.
          </p>
          <p className="text-xs text-academy-muted/60 mt-1">
            This platform does NOT collect or store protected health information (PHI).
          </p>
        </div>
      </div>
    </footer>
  );
}
