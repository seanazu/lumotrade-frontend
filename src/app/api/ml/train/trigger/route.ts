/**
 * ML Train Trigger API Proxy
 * Proxies requests to ML backend to keep API keys secure on server
 */

import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/ml/train/trigger
 * Trigger model training on ML backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mlUrl = `${ML_BACKEND_URL}/api/train/trigger`;

    const response = await fetch(mlUrl, {
      method: "POST",
      headers: {
        "X-API-Key": ML_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000), // 60s timeout for training
    });

    if (!response.ok) {
      console.error(`ML Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to trigger training on ML backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error proxying ML train trigger:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message,
      },
      { status: 500 }
    );
  }
}

