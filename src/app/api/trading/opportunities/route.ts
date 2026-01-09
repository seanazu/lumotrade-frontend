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
    const mlBackendUrl = process.env.ML_BACKEND_URL;
    const mlApiKey = process.env.ML_API_KEY;

    if (!mlBackendUrl || !mlApiKey) {
      console.error("❌ ML Backend not configured:", {
        hasUrl: !!mlBackendUrl,
        hasKey: !!mlApiKey,
      });
      return NextResponse.json(
        {
          error:
            "ML Backend not configured. Please set ML_BACKEND_URL and ML_API_KEY environment variables.",
          opportunities: [],
          marketContext: null,
        },
        { status: 500 }
      );
    }

    // Fetch from ML backend (which reads from database)
    // NOW USING NEW INTELLIGENT PICKS ENDPOINT (8-dimensional scoring with quality thresholds)
    console.log("📡 Fetching intelligent picks from ML backend...");
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
          message:
            "No picks available. Please run generate_daily_picks.py on the ML backend.",
          error: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `✅ Received ${data.opportunities?.length || 0} intelligent picks from ML backend`
    );

    // Transform to ensure all fields are present and properly formatted
    const transformedData = {
      opportunities: (data.opportunities || []).map((opp: any) => ({
        symbol: opp.symbol,
        name: opp.name,
        setupType: "swing_trade", // All picks are swing trades
        entry: opp.entry || { price: 0, range: { min: 0, max: 0 } },
        target: opp.target || { price: 0, percentage: 0 },
        stopLoss: opp.stopLoss || { price: 0, percentage: 0 },
        riskReward: opp.riskReward || 2.0,
        winRate: opp.confidence || 60, // Use confidence as winRate
        timeframe: opp.timeframe || "2-5 days",
        reasoning: opp.reasoning || "Trade setup",
        probability: opp.confidence || 60,
        confidence: opp.confidence || 60,
        score: opp.score || 0,
        scoreBreakdown: opp.scoreBreakdown || {},
        catalysts: opp.catalysts || [],
      })),
      marketContext: data.marketContext || {
        regime: "NEUTRAL",
        sentiment: "NEUTRAL",
        vixLevel: 0,
        spyPerformance: 0,
      },
    };

    return createResponse(transformedData);
  } catch (error) {
    console.error("❌ Error in trading opportunities endpoint:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );

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
