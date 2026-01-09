import { useQuery } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

export interface TradingOpportunity {
  symbol: string;
  name: string;
  setupType?:
    | "momentum_breakout"
    | "mean_reversion"
    | "options_play"
    | "swing_trade";
  entry: {
    price: number;
    range: { min: number; max: number };
  };
  target: {
    price: number;
    percentage: number;
  };
  stopLoss: {
    price: number;
    percentage: number;
  };
  riskReward: number;
  winRate: number;
  timeframe: string;
  reasoning: string;
  probability: number;
  confidence: number;
}

export interface MarketContext {
  regime: string;
  sentiment: string;
  vixLevel: number;
  spyPerformance: number;
  topSectors: string[];
}

interface TradingOpportunitiesResponse {
  opportunities: TradingOpportunity[];
  marketContext: MarketContext | null;
  updatedAt: string;
  message?: string;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetch AI-powered trading opportunities
 * Returns 1-2 best trading setups with entry, exit, and risk parameters
 */
export function useTradingOpportunities() {
  return useQuery<TradingOpportunitiesResponse>({
    queryKey: ["trading-opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/trading/opportunities");
      if (!response.ok) {
        throw new Error("Failed to fetch trading opportunities");
      }
      return response.json();
    },
    // Refresh more frequently during trading hours to get new picks
    refetchInterval: 5 * 60 * 1000, // 5 minutes during active use
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    staleTime: 10 * 60 * 1000, // 10 minutes (picks are daily but we want fresh data)
    retry: 2,
  });
}
