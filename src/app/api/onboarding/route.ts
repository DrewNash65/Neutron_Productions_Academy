import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/csrf";
import { onboardingSchema } from "@/lib/validation";

const CONSENT_VERSION = "2026-02-v1";

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const { ageRange, experienceLevel, goals, learningPreferences, weeklyTimeCommitmentH, avoidPHIAcknowledged, privacyAccepted, termsAccepted } = parsed.data;

  // Upsert profile
  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ageRange,
      experienceLevel,
      goals: JSON.stringify(goals),
      learningPreferences: JSON.stringify(learningPreferences),
      weeklyTimeCommitmentH,
      avoidPHIAcknowledged,
      onboardingComplete: true,
    },
    update: {
      ageRange,
      experienceLevel,
      goals: JSON.stringify(goals),
      learningPreferences: JSON.stringify(learningPreferences),
      weeklyTimeCommitmentH,
      avoidPHIAcknowledged,
      onboardingComplete: true,
    },
  });

  // Store consent
  await prisma.policyAcceptance.upsert({
    where: {
      userId_consentVersion: {
        userId: session.user.id,
        consentVersion: CONSENT_VERSION,
      },
    },
    create: {
      userId: session.user.id,
      privacyAccepted,
      termsAccepted,
      consentVersion: CONSENT_VERSION,
    },
    update: {
      privacyAccepted,
      termsAccepted,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
