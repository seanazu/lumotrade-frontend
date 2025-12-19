/**
 * Market Metrics Hook
 * Fetches real-time market health indicators for status bar
 */

import { useQuery } from "@tanstack/react-query";

// ============ Types ============

export interface MarketMetrics {
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

// ============ API Functions ============

async function fetchMarketMetrics(): Promise<MarketMetrics> {
  const response = await fetch("/api/market/metrics", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: MarketMetricsResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch market metrics");
  }

  return json.data;
}

// ============ Hooks ============

/**
 * Hook to fetch and manage market metrics data
 *
 * Features:
 * - Auto-refresh every 30 seconds during market hours
 * - Auto-refresh every 5 minutes outside market hours
 * - Smart caching with React Query
 * - Automatic retry on failure
 *
 * @returns Market metrics data with loading and error states
 */
export function useMarketMetrics() {
  return useQuery({
    queryKey: ["market", "metrics"],
    queryFn: fetchMarketMetrics,
    staleTime: 20 * 1000, // Consider data stale after 20 seconds
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval: (data) => {
      // Refetch every 30s if market is open, 5min if closed
      return data?.isMarketOpen ? 30 * 1000 : 5 * 60 * 1000;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
