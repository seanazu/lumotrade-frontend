/**
 * Technical Analysis Hook
 * Fetches technical indicators from Polygon + ML predictions
 */

import { useQuery } from "@tanstack/react-query";
import { CompleteTechnicalAnalysis } from "@/lib/api/clients/polygon-client";

interface MLPrediction {
  direction: "UP" | "DOWN";
  confidence: number;
  magnitude: number;
  trade_signal: string;
  signal_strength: string;
  recommendation: string;
}

interface TechnicalAnalysisResult {
  ticker: string;
  analysis: CompleteTechnicalAnalysis | null;
  prediction?: MLPrediction;
  marketSentiment: "bullish" | "bearish" | "neutral";
  plainEnglishSummary: string;
}

interface TechnicalSummary {
  headline: string;
  confidence: number | null;
  sentiment: "bullish" | "bearish" | "neutral";
  recommendation: string;
}

interface TechnicalAnalysisResponse {
  success: boolean;
  data: TechnicalAnalysisResult[];
  summary: TechnicalSummary;
  timestamp: number;
  error?: string;
}

/**
 * Fetch technical analysis from API
 */
async function fetchTechnicalAnalysis(
  symbols: string[]
): Promise<{ results: TechnicalAnalysisResult[]; summary: TechnicalSummary }> {
  const response = await fetch(
    `/api/market/technical?symbols=${symbols.join(",")}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: TechnicalAnalysisResponse = await response.json();

  if (!json.success) {
    throw new Error(json.error || "Failed to fetch technical analysis");
  }

  return {
    results: json.data,
    summary: json.summary,
  };
}

/**
 * Hook to fetch technical analysis for market indexes
 *
 * @param symbols - Array of ticker symbols (default: SPY for S&P 500)
 * @returns Technical analysis data with ML predictions
 */
export function useTechnicalAnalysis(symbols: string[] = ["SPY"]) {
  return useQuery({
    queryKey: ["market", "technical", ...symbols],
    queryFn: () => fetchTechnicalAnalysis(symbols),
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch technical analysis for a single ticker
 */
export function useTickerTechnicalAnalysis(ticker: string) {
  const { data, ...rest } = useTechnicalAnalysis([ticker]);

  return {
    data: data?.results?.[0] || null,
    summary: data?.summary || null,
    ...rest,
  };
}

