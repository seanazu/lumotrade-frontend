import { NextRequest, NextResponse } from "next/server";

const CACHE_DURATION = 3600; // 1 hour (picks are daily)
const STALE_WHILE_REVALIDATE = 7200; // 2 hours

/**
 * GET /api/trading/opportunities
 *
 * Returns AI-selected trading opportunities with:
 * - 2 best setups with high win probability
 * - Complete entry/exit parameters
 * - Market context and regime analysis
 *
 * NOW FETCHES FROM ML BACKEND DATABASE (generated before market open)
 * This ensures all users see the same picks and reduces API costs
 */
export async function GET(request: NextRequest) {
  console.log("🚀 Trading opportunities API called (fetching from ML backend)");
  
  try {
    const mlBackendUrl = process.env.ML_BACKEND_URL || "https://lumotrade-ml-backend-312910527085.us-central1.run.app";
    const mlApiKey = process.env.ML_BACKEND_API_KEY;
    
    if (!mlApiKey) {
      console.error("❌ ML Backend API key not configured");
      return NextResponse.json(
        { 
          error: "ML Backend not configured",
          opportunities: [],
          marketContext: null,
        },
        { status: 500 }
      );
    }
    
    // Fetch from ML backend (which reads from database)
    console.log("📡 Fetching picks from ML backend...");
    const response = await fetch(`${mlBackendUrl}/api/stock-picks/daily`, {
      headers: {
        "X-API-Key": mlApiKey,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ML Backend error:", errorText);
      
      // Fallback to empty response
      return NextResponse.json(
        { 
          opportunities: [],
          marketContext: null,
          message: "No picks available. Please run generate_daily_picks.py on the ML backend.",
          error: errorText,
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`✅ Received ${data.opportunities?.length || 0} picks from ML backend`);
    
    return createResponse(data);
  } catch (error) {
    console.error("❌ Error in trading opportunities endpoint:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      {
        error: "Failed to fetch trading opportunities",
        details: error instanceof Error ? error.message : String(error),
        opportunities: [],
        marketContext: null,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Enhance opportunities with real-time catalyst information
 */
/**
 * Create standardized API response with caching headers
 */
function createResponse(data: any) {
  return NextResponse.json(
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
      },
    }
  );
}
