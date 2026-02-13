import "./globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Neutron Productions Coding Academy",
  description:
    "Learn to code from the ground up — an interactive, personalized academy that takes you from fundamentals to building real projects.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-academy-bg text-academy-text">
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-academy-accent px-4 py-2 rounded z-50 text-white"
          >
            Skip to content
          </a>
          <Navbar />
          <div id="main-content">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
