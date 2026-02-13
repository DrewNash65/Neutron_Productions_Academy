import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { env } from "@/lib/env";
import { applySecurityHeaders } from "@/lib/security-headers";

const studentProtected = ["/dashboard", "/curriculum", "/module", "/lesson", "/onboarding", "/admin"];
const adminProtected = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const securityResponse = applySecurityHeaders(request);

  const requiresStudentAuth = studentProtected.some((path) => pathname.startsWith(path));
  const requiresAdminAuth = adminProtected.some((path) => pathname.startsWith(path));

  if (!requiresStudentAuth && !requiresAdminAuth) {
    return securityResponse;
  }

  const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (requiresAdminAuth && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return securityResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
