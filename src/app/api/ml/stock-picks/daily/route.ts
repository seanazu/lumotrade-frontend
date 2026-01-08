import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/ml/stock-picks/daily
 * 
 * Proxy to ML backend for daily INTELLIGENT stock picks
 * Uses the new GPT-5.2 powered intelligent picker with 8-dimensional scoring
 * Fetches from database instead of generating fresh
 */
export async function GET(request: NextRequest) {
  try:
    const mlBackendUrl = process.env.ML_BACKEND_URL || "https://lumotrade-ml-backend-312910527085.us-central1.run.app";
    const mlApiKey = process.env.ML_API_KEY; // Use existing ML_API_KEY convention
    
    if (!mlApiKey) {
      return NextResponse.json(
        { error: "ML Backend API key not configured" },
        { status: 500 }
      );
    }
    
    // Call ML backend - NOW USING INTELLIGENT PICKS ENDPOINT
    const response = await fetch(`${mlBackendUrl}/api/stock-picks/intelligent/daily`, {
      headers: {
        "X-API-Key": mlApiKey,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("ML Backend error:", error);
      return NextResponse.json(
        { error: "Failed to fetch stock picks from ML backend" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return with caching headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error in stock picks proxy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

