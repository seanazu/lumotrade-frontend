import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/api/clients/openai-client";
import { MarketAnalyzer, StockScreener, StockAnalyzer } from "@/lib/trading";

const CACHE_DURATION = 900; // 15 minutes
const STALE_WHILE_REVALIDATE = 1800; // 30 minutes

/**
 * GET /api/trading/opportunities
 *
 * Returns AI-selected trading opportunities with:
 * - 1-2 best setups with high win probability
 * - Complete entry/exit parameters
 * - Market context and regime analysis
 *
 * Cached for 15 minutes for optimal performance
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🎯 Starting AI Trading Opportunities analysis...");

    // Analyze market conditions
    const marketContext = await MarketAnalyzer.getMarketContext();
    console.log("📊 Market context:", marketContext);

    // Screen for quality candidates
    const candidates = await StockScreener.screenCandidates(marketContext);
    console.log(`🔍 Found ${candidates.length} candidates`);

    if (candidates.length === 0) {
      return createResponse({
        opportunities: [],
        marketContext,
        message:
          "No viable trading opportunities found in current market conditions",
      });
    }

    // Analyze top candidates with technical data
    const analyzedCandidates = await StockAnalyzer.analyzeCandidates(
      candidates.slice(0, 10)
    );
    console.log(
      `📈 Analyzed ${analyzedCandidates.length} candidates in detail`
    );

    // Let AI select best opportunities
    const opportunities = await openaiClient.analyzeTradingOpportunities(
      analyzedCandidates,
      marketContext
    );
    console.log(`✅ AI selected ${opportunities.length} opportunities`);

    // Enhance with real-time catalysts
    if (opportunities.length > 0) {
      await enhanceWithCatalysts(opportunities);
    }

    return createResponse({
      opportunities,
      marketContext,
    });
  } catch (error) {
    console.error("Error in trading opportunities endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze trading opportunities",
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
async function enhanceWithCatalysts(opportunities: any[]): Promise<void> {
  try {
    const symbols = opportunities.map((o) => o.symbol);
    const catalysts = await openaiClient.searchMarketCatalysts(symbols);
    console.log("📰 Found catalysts:", catalysts);

    opportunities.forEach((opp) => {
      const stockCatalysts = catalysts[opp.symbol];
      if (stockCatalysts?.length > 0) {
        opp.reasoning = `${opp.reasoning}\n\n📰 Recent Catalysts: ${stockCatalysts.join("; ")}`;
      }
    });
  } catch (error) {
    console.error("Error fetching catalysts:", error);
    // Non-critical, continue without catalysts
  }
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
