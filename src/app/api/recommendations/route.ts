import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { calculateAndStoreRecommendation, getLatestRecommendation } from "@/server/services/recommendation-service";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const recommendation = await getLatestRecommendation(session.user.id);

  return NextResponse.json({ recommendation }, { status: 200 });
}

export async function POST() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const recommendation = await calculateAndStoreRecommendation(session.user.id);

  return NextResponse.json({ recommendation }, { status: 200 });
}
