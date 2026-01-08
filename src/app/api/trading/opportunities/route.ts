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
        hasKey: !!mlApiKey 
      });
      return NextResponse.json(
        { 
          error: "ML Backend not configured. Please set ML_BACKEND_URL and ML_API_KEY environment variables.",
          opportunities: [],
          marketContext: null,
        },
        { status: 500 }
      );
    }
    
    // Fetch from ML backend (which reads from database)
    // NOW USING INTELLIGENT PICKS ENDPOINT (GPT-5.2 powered, 8-dimensional scoring)
    console.log("📡 Fetching intelligent picks from ML backend...");
    const response = await fetch(`${mlBackendUrl}/api/stock-picks/intelligent/daily`, {
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
    console.log(`✅ Received ${data.picks?.length || 0} intelligent picks from ML backend`);
    
    // Transform intelligent picks to opportunities format
    const transformedData = transformIntelligentPicks(data);
    
    return createResponse(transformedData);
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
 * Transform intelligent picks from ML backend to frontend format
 */
function transformIntelligentPicks(data: any): any {
  const picks = data.picks || [];
  
  // Transform each pick to opportunity format
  const opportunities = picks.map((pick: any) => ({
    symbol: pick.symbol,
    name: pick.company_name || pick.symbol,
    setupType: mapSetupType(pick.setup_type),
    entry: {
      price: pick.entry_price,
      range: {
        min: pick.entry_zone_min || pick.entry_price * 0.99,
        max: pick.entry_zone_max || pick.entry_price * 1.01,
      },
    },
    target: {
      price: pick.target_2 || pick.target_1,  // Use target_2 as primary
      percentage: pick.target_2_percent || pick.target_1_percent || 0,
    },
    stopLoss: {
      price: pick.stop_loss,
      percentage: Math.abs(pick.stop_loss_percent || 0),
    },
    riskReward: pick.risk_reward_ratio || 2.0,
    winRate: pick.win_probability || pick.ai_confidence || 60,
    timeframe: pick.timeframe_days || "3-5 days",
    reasoning: pick.ai_thesis || pick.catalysts?.join(", ") || "Trade setup",
    probability: pick.win_probability || 60,
    confidence: pick.ai_confidence || 70,
  }));
  
  // Build market context from the first pick (they all have same regime)
  const firstPick = picks[0];
  const marketContext = firstPick ? {
    regime: firstPick.market_regime || "NEUTRAL",
    sentiment: firstPick.market_regime || "NEUTRAL",
    vixLevel: 0,  // Not provided by intelligent picks
    spyPerformance: 0,  // Not provided by intelligent picks
    topSectors: firstPick.sector ? [firstPick.sector] : [],
  } : null;
  
  return {
    opportunities,
    marketContext,
  };
}

/**
 * Map intelligent picker setup types to frontend setup types
 */
function mapSetupType(setupType: string | undefined): string {
  if (!setupType) return "swing_trade";
  
  const mapping: Record<string, string> = {
    "BREAKOUT": "momentum_breakout",
    "BREAKDOWN": "momentum_breakout",
    "EARNINGS_MOMENTUM": "momentum_breakout",
    "MEAN_REVERSION": "mean_reversion",
    "FAILED_BREAKOUT": "mean_reversion",
    "OPTIONS_FLOW": "options_play",
    "INSIDER_BUYING": "swing_trade",
    "SECTOR_ROTATION": "swing_trade",
  };
  
  return mapping[setupType.toUpperCase()] || "swing_trade";
}
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
