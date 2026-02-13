import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { getAnalyticsOverview } from "@/server/services/analytics-service";

export async function GET() {
  const session = await getAuthSession();

  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const overview = await getAnalyticsOverview();

  return NextResponse.json(overview, { status: 200 });
}
