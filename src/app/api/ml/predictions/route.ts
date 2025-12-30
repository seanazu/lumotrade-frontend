/**
 * ML Predictions API Proxy
 * Proxies requests to ML backend to keep API keys secure on server
 */

import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ml/predictions
 * Fetch predictions from ML backend
 * Query params: date, days, page, page_size, search, direction, should_trade, result
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Forward all query params to ML backend
    const mlUrl = new URL(`${ML_BACKEND_URL}/api/predictions`);
    searchParams.forEach((value, key) => {
      mlUrl.searchParams.append(key, value);
    });

    const response = await fetch(mlUrl.toString(), {
      headers: {
        "X-API-Key": ML_API_KEY,
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`ML Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch predictions from ML backend" },
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
    console.error("Error proxying ML predictions:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message,
        predictions: [], // Return empty array as fallback
      },
      { status: 500 }
    );
  }
}

