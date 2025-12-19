/**
 * AI Brief Hook
 * Fetches AI-generated market summary with sentiment and sector performance
 */

import { useQuery } from "@tanstack/react-query";

// ============ Types ============

export interface SectorDriver {
  name: string;
  symbol: string;
  change: number;
  reason: string;
  icon: string;
}

export interface AIBriefData {
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

// ============ API Functions ============

async function fetchAIBrief(): Promise<AIBriefData> {
  const response = await fetch("/api/market/ai-brief", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: AIBriefResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch AI brief");
  }

  return json.data;
}

// ============ Hooks ============

/**
 * Hook to fetch and manage AI brief data
 *
 * Features:
 * - Auto-refresh every 2 minutes during market hours
 * - Auto-refresh every 10 minutes outside market hours
 * - Smart caching with React Query
 * - Automatic retry on failure
 * - Returns sentiment score and sector drivers
 *
 * @returns AI brief data with loading and error states
 */
export function useAIBrief() {
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

  const refetchInterval = isMarketHours() ? 2 * 60 * 1000 : 10 * 60 * 1000;

  return useQuery({
    queryKey: ["market", "ai-brief"],
    queryFn: fetchAIBrief,
    staleTime: 90 * 1000, // Consider data stale after 90 seconds
    gcTime: 20 * 60 * 1000, // Keep in cache for 20 minutes
    refetchInterval, // Auto-refresh
    refetchOnWindowFocus: false, // Don't refetch on focus (expensive calculation)
    refetchOnMount: true,
    retry: 2,
    retryDelay: 3000,
  });
}
