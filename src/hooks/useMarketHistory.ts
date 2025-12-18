/**
 * Market History Hook
 * Fetches historical performance data for market indexes
 */

import { useQuery } from "@tanstack/react-query";

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
}

async function fetchMarketHistory(symbol: string): Promise<HistoryResponse> {
  const response = await fetch(`/api/market/history?symbol=${symbol}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch market history");
  }

  return data;
}

export function useMarketHistory(symbol: string = "SPY") {
  return useQuery({
    queryKey: ["market", "history", symbol],
    queryFn: () => fetchMarketHistory(symbol),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export type { PerformanceData, RecentSession, HistoryResponse };

