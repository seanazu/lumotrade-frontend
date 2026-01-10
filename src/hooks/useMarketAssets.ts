/**
 * Market Assets Hook
 * Fetches real-time prices for diverse assets (stocks, crypto, forex, commodities)
 */

import { useQuery } from "@tanstack/react-query";

// ============ Types ============

export interface AssetData {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  icon: string;
  type: "stock" | "crypto" | "forex" | "commodity";
  sparklineData?: number[]; // Historical price points for sparkline chart
}

interface AssetsResponse {
  success: boolean;
  data?: AssetData[];
  error?: string;
  source: string;
  timestamp: number;
}

// ============ API Functions ============

async function fetchMarketAssets(): Promise<AssetData[]> {
  const response = await fetch("/api/market/assets", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: AssetsResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch market assets");
  }

  return json.data;
}

// ============ Hooks ============

/**
 * Hook to fetch and manage market assets data
 *
 * Features:
 * - Auto-refresh every 30 seconds during market hours
 * - Auto-refresh every 2 minutes outside market hours
 * - Smart caching with React Query
 * - Automatic retry on failure
 * - Returns SPY, BTC, EUR/USD, and Crude Oil
 *
 * @returns Market assets data with loading and error states
 */
export function useMarketAssets() {
  // Simple market hours check
  const isMarketHours = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Rough market hours check (9 AM - 4 PM local as proxy)
    return hour >= 9 && hour < 16;
  };

  const refetchInterval = isMarketHours() ? 30 * 1000 : 2 * 60 * 1000;

  return useQuery({
    queryKey: ["market", "assets"],
    queryFn: fetchMarketAssets,
    staleTime: 20 * 1000, // Consider data stale after 20 seconds
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval, // Auto-refresh
    refetchOnWindowFocus: isMarketHours(),
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
