/**
 * Comprehensive Research Hook
 * Fetches full multi-layer research analysis
 */

import { useQuery } from "@tanstack/react-query";
import type { FactorScores } from "@/lib/ai/multi-factor-scoring";
import type { TradingStrategy } from "@/types/strategies";

export interface ComprehensiveResearch {
  symbol: string;
  timestamp: number;
  currentPrice: number;

  profile: {
    name: string;
    sector: string;
    industry: string;
    description?: string;
    marketCap?: number;
    ceo?: string;
  };

  marketContext: {
    regime: any;
    spyPrice: number;
    spyChange: number;
    vix: number;
    breadth: any;
    sectorPerformance: any;
  };

  technicals: any;
  patterns: any[];
  sentiment: any;
  keyLevels: any;
  catalysts: any[];
  financials: any;
  scores: FactorScores;
  strategies: TradingStrategy[];
}

async function fetchResearch(
  symbol: string,
  timeframe: string,
  includeStrategies: boolean
): Promise<ComprehensiveResearch> {
  const params = new URLSearchParams({
    timeframe,
    ...(includeStrategies && { strategies: "1" }),
  });

  const res = await fetch(`/api/stock/research/${symbol}?${params}`);
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to fetch research");
  }

  return json.data;
}

export function useResearch(
  symbol: string,
  timeframe: string = "1M",
  options: {
    includeStrategies?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { includeStrategies = false, enabled = true } = options;

  return useQuery({
    queryKey: ["stock", "research", symbol, timeframe, includeStrategies],
    queryFn: () => fetchResearch(symbol, timeframe, includeStrategies),
    enabled: enabled && !!symbol,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
