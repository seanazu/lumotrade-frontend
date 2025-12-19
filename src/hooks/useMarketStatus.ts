/**
 * Market Status Hook
 * Fetches dynamic market status for page header
 */

import { useQuery } from "@tanstack/react-query";

// ============ Types ============

export interface MarketStatus {
  isOpen: boolean;
  session: "pre" | "regular" | "after" | "closed";
  subtitle: string;
}

interface MarketStatusResponse {
  success: boolean;
  data?: MarketStatus;
  error?: string;
  source: string;
  timestamp: number;
}

// ============ API Functions ============

async function fetchMarketStatus(): Promise<MarketStatus> {
  const response = await fetch("/api/market/status", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: MarketStatusResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch market status");
  }

  return json.data;
}

// ============ Hooks ============

/**
 * Hook to fetch and manage market status
 *
 * Features:
 * - Auto-refresh every 60 seconds
 * - Smart caching with React Query
 * - Automatic retry on failure
 * - Returns dynamic subtitle for page header
 *
 * @returns Market status data with loading and error states
 */
export function useMarketStatus() {
  return useQuery({
    queryKey: ["market", "status"],
    queryFn: fetchMarketStatus,
    staleTime: 45 * 1000, // Consider data stale after 45 seconds
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 2000,
  });
}
