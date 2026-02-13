import { hash } from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { validateCsrfOrigin } from "@/lib/csrf";
import { signupSchema } from "@/lib/validation";

const CONSENT_VERSION = "2026-02-v1";

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const ipKey = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimit = await enforceRateLimit(`signup:${ipKey}`, 6, 60_000);

  if (!rateLimit.success) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (existing) {
    return NextResponse.json({ message: "Account already exists" }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      policyAcceptances: {
        create: {
          privacyAccepted: parsed.data.privacyAccepted,
          termsAccepted: parsed.data.termsAccepted,
          consentVersion: CONSENT_VERSION,
        },
      },
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
