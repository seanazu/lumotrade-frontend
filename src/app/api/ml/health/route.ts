/**
 * ML Health Check Proxy
 * Proxies request to backend /api/health
 */
import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const mlUrl = new URL(`${ML_BACKEND_URL}/api/health`);

    const response = await fetch(mlUrl.toString(), {
      headers: { "X-API-Key": ML_API_KEY },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "unhealthy", error: "Backend unreachable" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: "unhealthy", error: error.message },
      { status: 500 }
    );
  }
}
