/**
 * Research Insights Hook
 * Fetches technical analysis and market insights
 */

import { useQuery } from "@tanstack/react-query";

// ============ Types ============

export interface ResearchInsight {
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

// ============ API Functions ============

async function fetchResearchInsights(): Promise<ResearchInsight[]> {
  const response = await fetch("/api/market/research", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: ResearchResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch research insights");
  }

  return json.data;
}

// ============ Hooks ============

/**
 * Hook to fetch and manage research insights
 *
 * Features:
 * - Auto-refresh every 15 minutes
 * - Smart caching with React Query
 * - Automatic retry on failure
 * - Returns top 3 technical/fundamental insights
 *
 * @returns Research insights data with loading and error states
 */
export function useResearchInsights() {
  return useQuery({
    queryKey: ["market", "research"],
    queryFn: fetchResearchInsights,
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus (not time-critical)
    refetchOnMount: true,
    retry: 2,
    retryDelay: 3000,
  });
}
