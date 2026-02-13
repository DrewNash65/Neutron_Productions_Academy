import { NextResponse, type NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/csrf";
import { attemptSchema } from "@/lib/validation";
import { saveExerciseAttempt } from "@/server/services/exercise-service";

export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = attemptSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.flatten() }, { status: 400 });
  }

  const attempt = await saveExerciseAttempt({
    userId: session.user.id,
    exerciseId: parsed.data.exerciseId,
    htmlSnapshot: parsed.data.htmlSnapshot,
    cssSnapshot: parsed.data.cssSnapshot,
    jsSnapshot: parsed.data.jsSnapshot,
    result: parsed.data.result,
    feedback: parsed.data.feedback,
  });

  return NextResponse.json({ attempt }, { status: 201 });
}
