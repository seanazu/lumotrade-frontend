import { NextRequest, NextResponse } from "next/server";
import { MarketAnalyzer } from "@/lib/trading";
import { AdvancedStockScreener } from "@/lib/trading/advanced-screener";
import { openaiClient } from "@/lib/api/clients/openai-client";
import { getEtDateString } from "@/lib/server/time";
import { getOrComputeDailyCache } from "@/lib/server/file-cache";

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
  console.log("🚀 Trading opportunities API called");
  
  try {
    // Log environment variables status (without exposing values)
    console.log("Environment check:", {
      hasPolygon: !!process.env.POLYGON_API_KEY,
      hasFMP: !!process.env.FMP_API_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasMarketaux: !!process.env.MARKETAUX_API_KEY,
    });
    
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "1";
    const dateEt = getEtDateString(new Date());
    console.log("📅 Trading date:", dateEt);

    const cacheKey = "trading:opportunities:v1";

    const { data, cache } = await getOrComputeDailyCache({
      key: cacheKey,
      dateEt,
      forceRefresh,
      compute: async () => {
        console.log("🎯 Starting advanced multi-source stock screening...");

        // Analyze market conditions
        const marketContext = await MarketAnalyzer.getMarketContext();
        console.log("📊 Market context:", marketContext);

        // Use advanced screener with all data sources to get top candidates
        const enrichedCandidates = await AdvancedStockScreener.findOpportunities(
          marketContext,
          10 // Get top 10 candidates for AI to analyze
        );
        console.log(`🎯 Found ${enrichedCandidates.length} enriched opportunities`);

        if (enrichedCandidates.length === 0) {
          return {
            opportunities: [],
            marketContext,
            message:
              "No viable trading opportunities found in current market conditions",
          };
        }

        // Convert enriched candidates to format OpenAI can analyze
        const candidatesForAI = enrichedCandidates.map((stock) => ({
          symbol: stock.symbol,
          name: stock.companyInfo?.name || stock.symbol,
          price: stock.price,
          changePercent: stock.changePercent,
          volume: stock.volume,
          avgVolume: stock.avgVolume,
          marketCap: stock.marketCap,
          score: stock.score,
          signals: stock.signals,
          catalysts: stock.catalysts,
          insiderBuying: stock.insiderBuying,
          analystRating: stock.analystRating,
          newsSentiment: stock.newsSentiment,
          optionsFlow: stock.optionsFlow,
          rsi: stock.rsi,
          macdSignal: stock.macdSignal,
          trend: stock.trend,
        }));

        // 🤖 Use OpenAI to analyze all candidates and select the BEST 2
        console.log("🤖 Sending candidates to OpenAI for final analysis...");
        const aiOpportunities = await openaiClient.analyzeTradingOpportunities(
          candidatesForAI,
          marketContext
        );
        
        console.log(`✅ OpenAI selected ${aiOpportunities.length} opportunities`);

        if (aiOpportunities.length === 0) {
          console.warn("⚠️ OpenAI returned no opportunities, using top 2 from screener");
          // Fallback: use top 2 from our screener if AI fails
          const opportunities = enrichedCandidates.slice(0, 2).map((stock) => {
            const entryPrice = stock.price;
            const targetPrice = stock.price * 1.08;
            const stopLossPrice = stock.price * 0.95;
            const riskReward = (targetPrice - entryPrice) / (entryPrice - stopLossPrice);
            
            return {
              symbol: stock.symbol,
              name: stock.companyInfo?.name || stock.symbol,
              setupType: stock.trend === "bullish" ? "momentum_breakout" : undefined,
              entry: {
                price: entryPrice,
                range: { min: entryPrice * 0.995, max: entryPrice * 1.005 },
              },
              target: { price: targetPrice, percentage: 8.0 },
              stopLoss: { price: stopLossPrice, percentage: 5.0 },
              riskReward: parseFloat(riskReward.toFixed(2)),
              winRate: Math.min(75, Math.max(55, Math.floor(stock.score * 0.7))),
              timeframe: "3-7 days",
              reasoning: [
                `Score: ${stock.score}/100`,
                ...stock.signals,
                stock.catalysts && stock.catalysts.length > 0 
                  ? `Catalysts: ${stock.catalysts.join(", ")}`
                  : "",
              ].filter(Boolean).join(" • "),
              probability: Math.floor(stock.score * 0.8),
              confidence: stock.score,
            };
          });

          return { opportunities, marketContext };
        }

        // Return AI-selected opportunities (already in correct format)
        return {
          opportunities: aiOpportunities,
          marketContext,
        };
      },
    });

    return createResponse({
      ...data,
      cache,
      tradingDateEt: dateEt,
    });
  } catch (error) {
    console.error("Error in trading opportunities endpoint:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      {
        error: "Failed to analyze trading opportunities",
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
