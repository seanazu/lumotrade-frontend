/**
 * Market History API Route
 * GET /api/market/history?symbol=SPY&days=30
 * Returns historical performance data for calculating timeframe returns
 */

import { NextRequest, NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change?: number;
  changePercent?: number;
}

interface PerformanceData {
  today: number;
  week: number;
  month: number;
  ytd: number;
  threeMonth: number;
  sixMonth: number;
  oneYear: number;
}

interface RecentSession {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  isUp: boolean;
}

interface HistoryResponse {
  success: boolean;
  symbol: string;
  performance: PerformanceData;
  recentSessions: RecentSession[];
  streak: {
    count: number;
    direction: "up" | "down" | "mixed";
    description: string;
  };
  timestamp: number;
  error?: string;
}

function calculatePerformance(bars: HistoricalBar[]): PerformanceData {
  if (!bars || bars.length === 0) {
    return {
      today: 0,
      week: 0,
      month: 0,
      ytd: 0,
      threeMonth: 0,
      sixMonth: 0,
      oneYear: 0,
    };
  }

  // Bars are typically in reverse chronological order (newest first)
  const sortedBars = [...bars].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestPrice = sortedBars[0]?.close || 0;
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Find prices at different timeframes
  const findPriceAtDaysAgo = (daysAgo: number): number => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);

    // Find the closest bar to target date
    const closest = sortedBars.reduce((prev, curr) => {
      const prevDiff = Math.abs(
        new Date(prev.date).getTime() - targetDate.getTime()
      );
      const currDiff = Math.abs(
        new Date(curr.date).getTime() - targetDate.getTime()
      );
      return currDiff < prevDiff ? curr : prev;
    });

    return closest?.close || latestPrice;
  };

  const findPriceAtDate = (targetDate: Date): number => {
    const closest = sortedBars.reduce((prev, curr) => {
      const prevDiff = Math.abs(
        new Date(prev.date).getTime() - targetDate.getTime()
      );
      const currDiff = Math.abs(
        new Date(curr.date).getTime() - targetDate.getTime()
      );
      return currDiff < prevDiff ? curr : prev;
    });

    return closest?.close || latestPrice;
  };

  const yesterdayPrice = sortedBars[1]?.close || latestPrice;
  const weekAgoPrice = findPriceAtDaysAgo(7);
  const monthAgoPrice = findPriceAtDaysAgo(30);
  const threeMonthAgoPrice = findPriceAtDaysAgo(90);
  const sixMonthAgoPrice = findPriceAtDaysAgo(180);
  const yearAgoPrice = findPriceAtDaysAgo(365);
  const ytdPrice = findPriceAtDate(startOfYear);

  const calcChange = (current: number, previous: number) =>
    previous ? ((current - previous) / previous) * 100 : 0;

  return {
    today: calcChange(latestPrice, yesterdayPrice),
    week: calcChange(latestPrice, weekAgoPrice),
    month: calcChange(latestPrice, monthAgoPrice),
    ytd: calcChange(latestPrice, ytdPrice),
    threeMonth: calcChange(latestPrice, threeMonthAgoPrice),
    sixMonth: calcChange(latestPrice, sixMonthAgoPrice),
    oneYear: calcChange(latestPrice, yearAgoPrice),
  };
}

function getRecentSessions(
  bars: HistoricalBar[],
  count: number = 5
): RecentSession[] {
  const sortedBars = [...bars].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sortedBars.slice(0, count).map((bar, index) => {
    const previousBar = sortedBars[index + 1];
    const change = previousBar ? bar.close - previousBar.close : 0;
    const changePercent = previousBar ? (change / previousBar.close) * 100 : 0;

    return {
      date: bar.date,
      open: bar.open,
      close: bar.close,
      high: bar.high,
      low: bar.low,
      change,
      changePercent,
      isUp: change >= 0,
    };
  });
}

function calculateStreak(sessions: RecentSession[]): {
  count: number;
  direction: "up" | "down" | "mixed";
  description: string;
} {
  if (sessions.length === 0) {
    return { count: 0, direction: "mixed", description: "No data available" };
  }

  let streakCount = 1;
  const firstDirection = sessions[0].isUp;

  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i].isUp === firstDirection) {
      streakCount++;
    } else {
      break;
    }
  }

  const direction = firstDirection ? "up" : "down";
  const upDays = sessions.filter((s) => s.isUp).length;
  const description =
    streakCount > 1
      ? `${streakCount} ${direction} days in a row`
      : `Up ${upDays} of the last ${sessions.length} days`;

  return { count: streakCount, direction, description };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol") || "SPY";
    const forceRefresh = searchParams.get("refresh") === "1";

    if (!fmpClient.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "FMP API is not configured",
          timestamp: Date.now(),
        },
        { status: 503 }
      );
    }

    const cacheKey = `market:history:${symbol.toUpperCase()}:v1`;

    const { data, cache } = await getOrComputeTtlCache({
      key: cacheKey,
      ttlSeconds: 6 * 60 * 60, // 6 hours (timeframe perf doesn't need minute-by-minute)
      forceRefresh,
      compute: async () => {
        const apiKey = process.env.FMP_API_KEY;
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${apiKey}&serietype=line`,
          { next: { revalidate: 300 } }
        );

        if (!response.ok) {
          throw new Error(`FMP API error: ${response.status}`);
        }

        const raw = await response.json();
        const historicalBars: HistoricalBar[] = raw.historical || [];

        const performance = calculatePerformance(historicalBars);
        const recentSessions = getRecentSessions(historicalBars, 5);
        const streak = calculateStreak(recentSessions);

        return { performance, recentSessions, streak };
      },
    });

    const result: HistoryResponse & { cache?: unknown } = {
      success: true,
      symbol,
      performance: data.performance,
      recentSessions: data.recentSessions,
      streak: data.streak,
      cache,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/market/history:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
