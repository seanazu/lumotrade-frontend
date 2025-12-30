import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/api/clients/openai-client";
import { MarketAnalyzer } from "@/lib/trading";
import { AdvancedStockScreener } from "@/lib/trading/advanced-screener";
import { getEtDateString } from "@/lib/server/time";
import { getOrComputeDailyCache } from "@/lib/server/file-cache";

/**
 * POST /api/cron/premarket-generation
 * 
 * Pre-generates expensive AI content during pre-market hours
 * Should be called by a cron job at 8:00 AM ET (before market open)
 * 
 * Generates:
 * - Lumo's Picks (Trading Opportunities) - uses OpenAI
 * 
 * Storage: InstantDB apiCache collection
 * Security: Requires CRON_SECRET header to prevent unauthorized access
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dateEt = getEtDateString(new Date());
    const results: any = {
      date: dateEt,
      generated: [],
      errors: [],
    };

    // ========================================================================
    // Generate Trading Opportunities (Lumo's Picks)
    // ========================================================================
    console.log("🎯 Pre-generating Lumo's Picks for", dateEt);
    
    try {
      const cacheKey = "trading:opportunities:v1";

      // Use the caching system (will check if exists first)
      const { data, cache } = await getOrComputeDailyCache({
        key: cacheKey,
        dateEt,
        forceRefresh: true, // ALWAYS generate fresh picks in pre-market
        compute: async () => {
          console.log("🔄 Generating new Lumo's Picks using advanced multi-source screener...");
          
          // Analyze market conditions
          const marketContext = await MarketAnalyzer.getMarketContext();
          console.log("📊 Market context:", marketContext);

          // Use advanced screener with Polygon, Finnhub, Marketaux, FMP data
          const enrichedCandidates = await AdvancedStockScreener.findOpportunities(
            marketContext,
            10 // Get top 10 enriched candidates
          );
          console.log(`🎯 Advanced screener found ${enrichedCandidates.length} enriched opportunities`);

          let opportunities = [];
          if (enrichedCandidates.length > 0) {
            // Convert enriched data to API format
            opportunities = enrichedCandidates.slice(0, 3).map((stock) => ({
              symbol: stock.symbol,
              name: stock.companyInfo?.name || stock.symbol,
              price: stock.price,
              change: stock.changePercent,
              reasoning: [
                `Score: ${stock.score}/100`,
                ...stock.signals,
                stock.catalysts && stock.catalysts.length > 0 ? `\n📰 Catalysts: ${stock.catalysts.join(", ")}` : "",
              ].filter(Boolean).join(". "),
              confidence: stock.score,
              technicalSetup: stock.trend === "bullish" ? "Bullish trend with positive momentum" : "Neutral technical setup",
              targetPrice: stock.price * 1.08, // 8% upside target
              stopLoss: stock.price * 0.95, // 5% stop loss
              timeframe: "3-7 days",
            }));

            console.log(`✅ Selected top ${opportunities.length} opportunities:`, 
              opportunities.map(o => `${o.symbol} (${o.confidence})`).join(", "));
          } else {
            console.log("⚠️ No high-quality opportunities found today");
          }

          return {
            opportunities,
            marketContext,
          };
        },
      });

      console.log("✅ Successfully processed Lumo's Picks");
      
      results.generated.push({
        item: "trading_opportunities",
        status: cache.hit ? "already_exists" : "generated",
        opportunitiesCount: data.opportunities?.length || 0,
        cachedAt: cache.storedAt || new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Error generating trading opportunities:", error);
      results.errors.push({
        item: "trading_opportunities",
        error: error.message,
      });
    }

    // ========================================================================
    // Return Results
    // ========================================================================
    const hasErrors = results.errors.length > 0;
    
    return NextResponse.json(
      {
        success: !hasErrors,
        ...results,
        completedAt: new Date().toISOString(),
      },
      { status: hasErrors ? 207 : 200 } // 207 = Multi-Status (partial success)
    );
  } catch (error: any) {
    console.error("❌ Pre-market generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/premarket-generation
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: "Pre-Market Generation",
    status: "ready",
    database: "InstantDB",
    timestamp: new Date().toISOString(),
  });
}

