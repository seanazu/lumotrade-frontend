/**
 * Market Metrics API Route
 * GET /api/market/metrics
 * Returns real-time market health indicators for the status bar
 */

import { NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { finnhubClient } from "@/lib/api/clients/finnhub-client";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MarketMetrics {
  isMarketOpen: boolean;
  sentiment: string;
  volume: string;
  volatility: string;
  trend: string;
}

interface MarketMetricsResponse {
  success: boolean;
  data?: MarketMetrics;
  error?: string;
  source: string;
  timestamp: number;
}

/**
 * Calculate if market is currently open
 * US Markets: 9:30 AM - 4:00 PM ET, Monday-Friday
 */
function isMarketOpen(): boolean {
  const now = new Date();

  // Convert to ET timezone
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = etTime.getDay();
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();

  // Weekend check
  if (day === 0 || day === 6) {
    return false;
  }

  // Market hours: 9:30 AM - 4:00 PM ET
  const currentTime = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60; // 4:00 PM

  return currentTime >= marketOpen && currentTime < marketClose;
}

/**
 * Calculate market sentiment based on VIX and market movement
 */
function calculateSentiment(vixPrice: number, spyChange: number): string {
  // VIX interpretation:
  // < 15: Low volatility, bullish
  // 15-20: Normal, neutral
  // 20-30: Elevated, cautious
  // > 30: High fear, bearish

  if (vixPrice < 15 && spyChange > 0.5) {
    return "Bullish";
  } else if (vixPrice < 15 && spyChange > 0) {
    return "Slightly Bullish";
  } else if (vixPrice > 30 || spyChange < -1.5) {
    return "Bearish";
  } else if (vixPrice > 25 || spyChange < -0.5) {
    return "Cautious";
  } else if (vixPrice < 20 && Math.abs(spyChange) < 0.3) {
    return "Neutral";
  } else {
    return "Mixed";
  }
}

/**
 * Calculate volume status compared to average
 */
function calculateVolumeStatus(
  currentVolume: number,
  avgVolume: number
): string {
  if (!avgVolume || avgVolume === 0) {
    return "Normal";
  }

  const ratio = currentVolume / avgVolume;

  if (ratio > 1.5) {
    return "Very High";
  } else if (ratio > 1.2) {
    return "Above Avg";
  } else if (ratio < 0.7) {
    return "Below Avg";
  } else {
    return "Normal";
  }
}

/**
 * Calculate volatility status based on VIX
 */
function calculateVolatility(vixPrice: number): string {
  if (vixPrice < 12) {
    return "Very Low";
  } else if (vixPrice < 15) {
    return "Low";
  } else if (vixPrice < 20) {
    return "Normal";
  } else if (vixPrice < 30) {
    return "Elevated";
  } else {
    return "High";
  }
}

/**
 * Calculate trend based on price movement
 */
function calculateTrend(changePercent: number): string {
  if (changePercent > 1) {
    return "Strong Upward";
  } else if (changePercent > 0.3) {
    return "Upward";
  } else if (changePercent > -0.3) {
    return "Sideways";
  } else if (changePercent > -1) {
    return "Downward";
  } else {
    return "Strong Downward";
  }
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
          error: "FMP API is not configured",
          timestamp: Date.now(),
        } as MarketMetricsResponse,
        { status: 503 }
      );
    }

    const { data, cache } = await getOrComputeTtlCache({
      key: "market:metrics:v1",
      ttlSeconds: 60, // 1 minute shared cache
      forceRefresh,
      compute: async () => {
        const marketOpen = isMarketOpen();

        // Fetch key market data in parallel
        const [spyQuote, vixQuote] = await Promise.all([
          fmpClient.getQuote("SPY"), // S&P 500 ETF
          fmpClient.getQuote("^VIX"), // Volatility Index
        ]);

        // Use SPY as primary indicator
        const spyData = spyQuote || {
          changesPercentage: 0,
          volume: 0,
          avgVolume: 0,
        };

        const vixData = vixQuote || { price: 16 }; // Default VIX at neutral level

        // Calculate metrics
        const sentiment = calculateSentiment(
          vixData.price,
          spyData.changesPercentage
        );

        const volume = calculateVolumeStatus(spyData.volume, spyData.avgVolume);

        const volatility = calculateVolatility(vixData.price);

        const trend = calculateTrend(spyData.changesPercentage);

        const metrics: MarketMetrics = {
          isMarketOpen: marketOpen,
          sentiment,
          volume,
          volatility,
          trend,
        };

        return metrics;
      },
    });

    return NextResponse.json({
      success: true,
      data,
      cache,
      source: "fmp",
      timestamp: Date.now(),
    } as MarketMetricsResponse & { cache?: unknown });
  } catch (error) {
    console.error("Error in /api/market/metrics:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "error",
        timestamp: Date.now(),
      } as MarketMetricsResponse,
      { status: 500 }
    );
  }
}
