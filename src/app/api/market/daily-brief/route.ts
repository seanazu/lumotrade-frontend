import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

/**
 * GET /api/market/daily-brief
 * Note: This route is deprecated. Use InstantDB directly from the client via useDailyBrief hook.
 * Kept for backwards compatibility.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "This endpoint is deprecated. Use InstantDB client-side queries via useDailyBrief hook.",
      note: "Query InstantDB directly from the client for better performance and to avoid server-side query limitations.",
    },
    { status: 410 } // Gone
  );
}

