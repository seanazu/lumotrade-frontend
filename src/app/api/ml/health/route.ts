/**
 * ML Health API Proxy
 * Proxies requests to ML backend to keep API keys secure on server
 */

import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ml/health
 * Fetch health status from ML backend
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${ML_BACKEND_URL}/api/health`, {
      headers: {
        "X-API-Key": ML_API_KEY,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`ML Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch health from ML backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("Error proxying ML health:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message,
      },
      { status: 500 }
    );
  }
}

