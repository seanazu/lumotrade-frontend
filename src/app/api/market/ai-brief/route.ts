/**
 * AI Brief API Route
 * GET /api/market/ai-brief
 * Returns AI-generated market summary with sentiment and sector performance
 */

import { NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { finnhubClient } from "@/lib/api/clients/finnhub-client";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SectorDriver {
  name: string;
  symbol: string;
  change: number;
  reason: string;
  icon: string;
}

interface AIBriefData {
  title: string;
  summary: string;
  sentimentScore: number; // 0-100
  sentimentLabel: "Fear" | "Neutral" | "Greed";
  keyDrivers: SectorDriver[];
}

interface AIBriefResponse {
  success: boolean;
  data?: AIBriefData;
  error?: string;
  source: string;
  timestamp: number;
}

/**
 * Fetch sector performance data
 */
async function fetchSectorPerformance(): Promise<Map<string, number>> {
  const sectorETFs = [
    { symbol: "XLK", name: "Technology" },
    { symbol: "XLE", name: "Energy" },
    { symbol: "XLF", name: "Financials" },
    { symbol: "XLV", name: "Healthcare" },
    { symbol: "XLI", name: "Industrials" },
    { symbol: "XLP", name: "Consumer Staples" },
    { symbol: "XLY", name: "Consumer Discretionary" },
    { symbol: "XLU", name: "Utilities" },
    { symbol: "XLRE", name: "Real Estate" },
  ];

  const performanceMap = new Map<string, number>();

  try {
    // Fetch quotes for all sector ETFs in parallel
    const symbols = sectorETFs.map((s) => s.symbol);
    const quotes = await fmpClient.getQuotes(symbols);

    sectorETFs.forEach((sector) => {
      const quote = quotes.get(sector.symbol);
      if (quote) {
        performanceMap.set(sector.name, quote.changesPercentage);
      }
    });
  } catch (error) {
    console.error("Error fetching sector performance:", error);
  }

  return performanceMap;
}

/**
 * Calculate market sentiment score (0-100)
 */
async function calculateSentiment(): Promise<{
  score: number;
  label: "Fear" | "Neutral" | "Greed";
}> {
  try {
    // Fetch key market indicators
    const [spyQuote, vixQuote] = await Promise.all([
      fmpClient.getQuote("SPY"),
      fmpClient.getQuote("^VIX"),
    ]);

    // Calculate sentiment based on:
    // 1. VIX level (fear gauge)
    // 2. Market direction (SPY change)
    // 3. Market breadth (would need additional API call)

    let score = 50; // Start neutral

    // VIX contribution (lower VIX = more greed)
    if (vixQuote) {
      const vix = vixQuote.price;
      if (vix < 12) {
        score += 25; // Very low fear
      } else if (vix < 15) {
        score += 15; // Low fear
      } else if (vix < 20) {
        score += 5; // Normal
      } else if (vix < 30) {
        score -= 10; // Elevated fear
      } else {
        score -= 25; // High fear
      }
    }

    // SPY momentum contribution
    if (spyQuote) {
      const change = spyQuote.changesPercentage;
      if (change > 1.5) {
        score += 20; // Strong rally
      } else if (change > 0.5) {
        score += 10; // Moderate rally
      } else if (change < -1.5) {
        score -= 20; // Strong selloff
      } else if (change < -0.5) {
        score -= 10; // Moderate selloff
      }
    }

    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine label
    let label: "Fear" | "Neutral" | "Greed";
    if (score < 35) {
      label = "Fear";
    } else if (score > 65) {
      label = "Greed";
    } else {
      label = "Neutral";
    }

    return { score, label };
  } catch (error) {
    console.error("Error calculating sentiment:", error);
    return { score: 50, label: "Neutral" };
  }
}

/**
 * Generate top headline based on market conditions
 */
async function generateHeadline(
  sentimentLabel: string,
  topSector: { name: string; change: number } | null
): Promise<{ title: string; summary: string }> {
  if (sentimentLabel === "Greed" && topSector && topSector.change > 1.5) {
    return {
      title: `${topSector.name} Sector Leading Broad Market Rally`,
      summary: `${topSector.name} stocks are driving major indices higher with strong momentum. Risk appetite remains elevated as investors rotate into growth sectors.`,
    };
  } else if (sentimentLabel === "Fear") {
    return {
      title: "Market Volatility Elevated Amid Uncertainty",
      summary:
        "Investors showing caution as volatility rises. Defensive sectors gaining favor as market participants reassess risk exposure.",
    };
  } else if (topSector && Math.abs(topSector.change) > 1) {
    const direction = topSector.change > 0 ? "Gains" : "Declines";
    return {
      title: `${topSector.name} Sector ${direction} Lead Mixed Trading`,
      summary: `${topSector.name} seeing significant movement while broader market remains mixed. Sector rotation continues as investors reposition portfolios.`,
    };
  } else {
    return {
      title: "Markets Trade in Consolidation Range",
      summary:
        "Major indices showing modest moves as investors await fresh catalysts. Volume remains near average with balanced participation across sectors.",
    };
  }
}

/**
 * Get sector icon
 */
function getSectorIcon(sectorName: string): string {
  const icons: Record<string, string> = {
    Technology: "💻",
    Energy: "⚡",
    Financials: "🏦",
    Healthcare: "🏥",
    Industrials: "🏭",
    "Consumer Staples": "🛒",
    "Consumer Discretionary": "🛍️",
    Utilities: "💡",
    "Real Estate": "🏢",
  };

  return icons[sectorName] || "📊";
}

/**
 * Get reason text for sector movement
 */
function getSectorReason(sectorName: string, change: number): string {
  const isPositive = change > 0;

  const reasons: Record<string, { positive: string; negative: string }> = {
    Technology: {
      positive: "Earnings beat exp.",
      negative: "Profit taking",
    },
    Energy: {
      positive: "Oil stabilizing",
      negative: "Demand concerns",
    },
    Financials: {
      positive: "Rate optimism",
      negative: "Credit concerns",
    },
    Healthcare: {
      positive: "Defensive bid",
      negative: "Policy pressure",
    },
    Industrials: {
      positive: "Order growth",
      negative: "Weak guidance",
    },
    "Consumer Staples": {
      positive: "Safety bid",
      negative: "Margin pressure",
    },
    "Consumer Discretionary": {
      positive: "Strong spending",
      negative: "Weak outlook",
    },
    Utilities: {
      positive: "Defensive rotation",
      negative: "Rate sensitivity",
    },
    "Real Estate": {
      positive: "REIT strength",
      negative: "Financing costs",
    },
  };

  const reason = reasons[sectorName];
  if (reason) {
    return isPositive ? reason.positive : reason.negative;
  }

  return isPositive ? "Strong buying" : "Profit taking";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "1";

    // Check if FMP is configured
    if (!fmpClient.isConfigured()) {
      console.error("FMP API not configured.");
      return NextResponse.json(
        {
          success: false,
          error: "FMP API is not configured. Add FMP_API_KEY to .env.local",
          timestamp: Date.now(),
        } as AIBriefResponse,
        { status: 503 }
      );
    }

    const { data: briefData, cache } = await getOrComputeTtlCache({
      key: "market:ai-brief:v1",
      ttlSeconds: 15 * 60, // 15 minutes (shared DB cache across users)
      forceRefresh,
      compute: async () => {
        // Fetch data in parallel
        const [sentiment, sectorPerformance] = await Promise.all([
          calculateSentiment(),
          fetchSectorPerformance(),
        ]);

        // Sort sectors by performance
        const sortedSectors = Array.from(sectorPerformance.entries())
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .slice(0, 3); // Top 3 movers

        // Generate key drivers
        const keyDrivers: SectorDriver[] = sortedSectors.map(
          ([name, change]) => ({
            name,
            symbol: name.toUpperCase().substring(0, 4),
            change,
            reason: getSectorReason(name, change),
            icon: getSectorIcon(name),
          })
        );

        // Generate headline
        const topSector =
          sortedSectors.length > 0
            ? { name: sortedSectors[0][0], change: sortedSectors[0][1] }
            : null;

        const { title, summary } = await generateHeadline(
          sentiment.label,
          topSector
        );

        return {
          title,
          summary,
          sentimentScore: sentiment.score,
          sentimentLabel: sentiment.label,
          keyDrivers,
        } as AIBriefData;
      },
    });

    return NextResponse.json({
      success: true,
      data: briefData,
      cache,
      source: "fmp",
      timestamp: Date.now(),
    } as AIBriefResponse & { cache?: unknown });
  } catch (error) {
    console.error("Error in /api/market/ai-brief:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "error",
        timestamp: Date.now(),
      } as AIBriefResponse,
      { status: 500 }
    );
  }
}
