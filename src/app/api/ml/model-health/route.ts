/**
 * ML Model Health API Proxy
 * Proxies requests to ML backend to keep API keys secure on server
 */

import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ml/model-health
 * Fetch model health metrics from ML backend
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${ML_BACKEND_URL}/api/model-health`, {
      headers: {
        "X-API-Key": ML_API_KEY,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`ML Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch model health from ML backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    console.error("Error proxying ML model health:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message,
        health: null,
        account: null,
      },
      { status: 500 }
    );
  }
}

