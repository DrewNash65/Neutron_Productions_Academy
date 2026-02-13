import type { Session } from "next-auth";

export function isAdmin(session: Session | null | undefined) {
  return session?.user?.role === "ADMIN";
}

export function isAuthenticated(session: Session | null | undefined) {
  return Boolean(session?.user?.id);
}
