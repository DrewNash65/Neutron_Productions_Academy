import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ipKey = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimit = await enforceRateLimit(`reset-pw:${ipKey}`, 4, 60_000);

  if (!rateLimit.success) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const email = body?.email;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const genericResponse = NextResponse.json(
    { message: "If an account with that email exists, a reset link has been sent." },
    { status: 200 },
  );

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return genericResponse;
  }

  // Generate a secure token
  const { randomBytes, createHash } = await import("crypto");
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  // TODO: Send email with reset link containing rawToken
  // For MVP, log the token in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);
  }

  return genericResponse;
}
