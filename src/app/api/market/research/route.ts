/**
 * Research Insights API Route
 * GET /api/market/research
 * Returns technical analysis and market insights from Marketaux and FMP
 */

import { NextResponse } from "next/server";
import { marketauxClient } from "@/lib/api/clients/marketaux-client";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ResearchInsight {
  category: "TECHNICAL" | "FUNDAMENTAL" | "SENTIMENT" | "MACRO";
  title: string;
  summary: string;
  time: string;
  source: string;
  url?: string;
}

interface ResearchResponse {
  success: boolean;
  data?: ResearchInsight[];
  error?: string;
  source: string;
  timestamp: number;
}

/**
 * Keywords that indicate research/analysis content
 */
const RESEARCH_KEYWORDS = [
  "analysis",
  "technical",
  "outlook",
  "forecast",
  "pattern",
  "support",
  "resistance",
  "trend",
  "breakout",
  "reversal",
  "strategy",
  "trading",
  "chart",
  "indicator",
  "signal",
];

/**
 * Check if content is research-oriented
 */
function isResearchContent(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase();
  return RESEARCH_KEYWORDS.some((keyword) => combined.includes(keyword));
}

/**
 * Determine category based on content
 */
function categorizeInsight(
  title: string,
  description: string
): "TECHNICAL" | "FUNDAMENTAL" | "SENTIMENT" | "MACRO" {
  const combined = `${title} ${description}`.toLowerCase();

  const technicalKeywords = [
    "technical",
    "chart",
    "pattern",
    "support",
    "resistance",
    "breakout",
    "moving average",
    "rsi",
    "macd",
  ];
  const fundamentalKeywords = [
    "earnings",
    "valuation",
    "revenue",
    "profit",
    "fundamental",
    "balance sheet",
  ];
  const sentimentKeywords = [
    "sentiment",
    "positioning",
    "flows",
    "options",
    "put",
    "call",
  ];
  const macroKeywords = [
    "macro",
    "fed",
    "gdp",
    "inflation",
    "rates",
    "economy",
    "policy",
  ];

  if (technicalKeywords.some((kw) => combined.includes(kw))) return "TECHNICAL";
  if (fundamentalKeywords.some((kw) => combined.includes(kw)))
    return "FUNDAMENTAL";
  if (sentimentKeywords.some((kw) => combined.includes(kw))) return "SENTIMENT";
  if (macroKeywords.some((kw) => combined.includes(kw))) return "MACRO";

  return "TECHNICAL"; // Default
}

/**
 * Format time ago
 */
function formatTimeAgo(timestamp: string): string {
  try {
    const now = new Date();
    const published = new Date(timestamp);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  } catch {
    return "Recently";
  }
}

/**
 * Fetch insights from Marketaux
 */
async function fetchMarketauxInsights(): Promise<ResearchInsight[]> {
  try {
    if (!marketauxClient.isConfigured()) {
      return [];
    }

    const articles = await marketauxClient.getTopMarketNews(20);

    // Filter for research-oriented content
    const researchArticles = articles
      .filter((article) =>
        isResearchContent(article.title, article.description || "")
      )
      .slice(0, 5);

    return researchArticles.map((article) => ({
      category: categorizeInsight(article.title, article.description || ""),
      title: article.title,
      summary: article.description || article.snippet || "",
      time: formatTimeAgo(article.published_at),
      source: article.source,
      url: article.url,
    }));
  } catch (error) {
    console.error("Error fetching Marketaux insights:", error);
    return [];
  }
}

// Removed: Massive API integration (deprecated, now using Polygon)

/**
 * Generate actionable technical insights based on market data
 */
async function generateTechnicalInsights(): Promise<ResearchInsight[]> {
  const insights: ResearchInsight[] = [];

  try {
    if (!fmpClient.isConfigured()) {
      return insights;
    }

    // Fetch key market data
    const [spyQuote, vixQuote, qqqQuote] = await Promise.all([
      fmpClient.getQuote("SPY"),
      fmpClient.getQuote("^VIX"),
      fmpClient.getQuote("QQQ"),
    ]);

    // 1. S&P 500 Technical Analysis
    if (spyQuote) {
      const price = spyQuote.price;
      const ma50 = spyQuote.priceAvg50;
      const ma200 = spyQuote.priceAvg200;
      const change = spyQuote.changesPercentage;
      const volume = spyQuote.volume;
      const avgVolume = spyQuote.avgVolume;

      const volumeRatio = volume / avgVolume;
      const distanceFrom50MA = ((price - ma50) / ma50) * 100;
      const distanceFrom200MA = ((price - ma200) / ma200) * 100;

      let title = "";
      let summary = "";
      let category: "TECHNICAL" | "SENTIMENT" = "TECHNICAL";

      // Actionable insights based on technical setup
      if (price > ma50 && price > ma200 && change > 0.5 && volumeRatio > 1.2) {
        title = `S&P 500 momentum accelerating with volume confirmation`;
        summary = `Trading ${distanceFrom50MA.toFixed(1)}% above 50-day MA ($${ma50.toFixed(2)}) with volume ${((volumeRatio - 1) * 100).toFixed(0)}% above average. Strong bullish setup suggests continuation toward next resistance. Watch for profit-taking near recent highs.`;
      } else if (price > ma50 && price > ma200) {
        title = `S&P 500 holds above key support, consolidation likely`;
        summary = `Price ${distanceFrom50MA.toFixed(1)}% above 50-MA support at $${ma50.toFixed(2)}. Volume ${volumeRatio < 1 ? "declining" : "steady"} suggests consolidation. Buyers stepping in at dips, but breakout needs catalyst.`;
      } else if (price < ma50 && price > ma200) {
        title = `S&P 500 pulls back to test 200-day MA support zone`;
        summary = `Index trading between 50-MA ($${ma50.toFixed(2)}) and 200-MA ($${ma200.toFixed(2)}). Critical support at $${ma200.toFixed(2)}. Bounce here could signal buying opportunity; break below indicates deeper correction.`;
      } else if (price < ma50 && price < ma200) {
        title = `S&P 500 in correction mode below key moving averages`;
        summary = `Price ${Math.abs(distanceFrom200MA).toFixed(1)}% below 200-day MA at $${ma200.toFixed(2)}. Bearish technical setup requires reclaim of $${ma50.toFixed(2)} to improve outlook. Risk management critical here.`;
      } else {
        title = `S&P 500 at crossroads between support and resistance`;
        summary = `Trading near 50-day MA at $${ma50.toFixed(2)} after ${change > 0 ? "gaining" : "losing"} ${Math.abs(change).toFixed(2)}%. Direction unclear—wait for breakout above $${(ma50 * 1.01).toFixed(2)} or breakdown below $${(ma50 * 0.99).toFixed(2)} for confirmation.`;
      }

      insights.push({
        category,
        title,
        summary,
        time: "Live",
        source: "Technical Analysis",
      });
    }

    // 2. VIX / Volatility Insight
    if (vixQuote) {
      const vix = vixQuote.price;
      const vixChange = vixQuote.changesPercentage;

      let title = "";
      let summary = "";

      if (vix < 12) {
        title = "Extreme complacency: VIX at historically low levels";
        summary = `VIX at ${vix.toFixed(2)}, below 12 threshold indicating extreme low fear. Markets vulnerable to sharp volatility spike. Consider hedging strategies or reducing leverage ahead of potential mean reversion.`;
      } else if (vix < 15 && vixChange < -5) {
        title = "Fear gauge declining: Risk appetite increasing";
        summary = `VIX dropping ${Math.abs(vixChange).toFixed(1)}% to ${vix.toFixed(2)}, signaling strong risk-on sentiment. Investors rotating into growth/momentum plays. Favorable environment for breakout trades.`;
      } else if (vix > 25 && vixChange > 10) {
        title = "Volatility spike: Market stress levels rising";
        summary = `VIX surging ${vixChange.toFixed(1)}% to ${vix.toFixed(2)}, indicating heightened uncertainty. Defensive positioning warranted. Look for capitulation signals before re-entering long positions.`;
      } else if (vix > 20) {
        title = "Elevated volatility persists: Cautious positioning advised";
        summary = `VIX at ${vix.toFixed(2)} remains elevated above 20 threshold. Markets still digesting uncertainty. Premium sellers benefit from high implied volatility; buyers should wait for clearer signals.`;
      }

      if (title) {
        insights.push({
          category: "SENTIMENT",
          title,
          summary,
          time: "Live",
          source: "Volatility Analysis",
        });
      }
    }

    // 3. Tech Sector Analysis (QQQ)
    if (qqqQuote && spyQuote) {
      const qqqChange = qqqQuote.changesPercentage;
      const spyChange = spyQuote.changesPercentage;
      const outperformance = qqqChange - spyChange;

      if (Math.abs(outperformance) > 0.5) {
        const title =
          outperformance > 0
            ? "Tech leading: QQQ outperforming broad market"
            : "Tech lagging: Defensive rotation underway";
        const summary =
          outperformance > 0
            ? `Nasdaq-100 (QQQ) up ${qqqChange.toFixed(2)}% vs S&P 500 +${spyChange.toFixed(2)}%, outperforming by ${outperformance.toFixed(2)}%. Growth momentum accelerating—tech names showing relative strength. Favor semiconductor, software, and mega-cap tech exposure.`
            : `Nasdaq-100 (QQQ) ${qqqChange.toFixed(2)}% vs S&P 500 ${spyChange.toFixed(2)}%, underperforming by ${Math.abs(outperformance).toFixed(2)}%. Sector rotation favoring defensive sectors. Consider cyclicals, utilities, or consumer staples until tech stabilizes.`;

        insights.push({
          category: "TECHNICAL",
          title,
          summary,
          time: "Live",
          source: "Sector Analysis",
        });
      }
    }

    return insights;
  } catch (error) {
    console.error("Error generating technical insights:", error);
    return insights;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "1";

    const { data, cache } = await getOrComputeTtlCache({
      key: "market:research:v1",
      ttlSeconds: 60 * 60, // 1 hour
      forceRefresh,
      compute: async () => {
        // Fetch insights from all sources in parallel
        const [marketauxInsights, technicalInsights] = await Promise.all([
          fetchMarketauxInsights(),
          generateTechnicalInsights(),
        ]);

        // Combine and deduplicate insights
        const allInsights: ResearchInsight[] = [];

        // Add technical insights first (most actionable)
        allInsights.push(...technicalInsights);

        // Add Marketaux insights (external analysis)
        allInsights.push(...marketauxInsights);

        // Deduplicate by title
        const seenTitles = new Set<string>();
        const uniqueInsights = allInsights.filter((insight) => {
          const titleLower = insight.title.toLowerCase();
          if (seenTitles.has(titleLower)) {
            return false;
          }
          seenTitles.add(titleLower);
          return true;
        });

        // Take top 3 insights
        const topInsights = uniqueInsights.slice(0, 3);

        // Determine source
        let source = "fmp";
        if (technicalInsights.length > 0) {
          source = "fmp-analysis";
        }
        if (marketauxInsights.length > 0) {
          source += "+marketaux";
        }

        return { topInsights, source };
      },
    });

    return NextResponse.json({
      success: true,
      data: data.topInsights,
      cache,
      source: data.source,
      timestamp: Date.now(),
    } as ResearchResponse & { cache?: unknown });
  } catch (error) {
    console.error("Error in /api/market/research:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "error",
        timestamp: Date.now(),
      } as ResearchResponse,
      { status: 500 }
    );
  }
}
