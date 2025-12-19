/**
 * Chart Analysis Hook
 * Fetches professional chart analysis with levels, patterns, and trading plan
 */

import { useQuery } from "@tanstack/react-query";

export interface ChartAnalysisData {
  symbol: string;
  currentPrice: number;
  timestamp: number;

  keyLevels: {
    resistance: number[];
    support: number[];
    pivotPoint: number;
  };

  fibonacci: {
    high: number;
    low: number;
    levels: {
      "0%": number;
      "23.6%": number;
      "38.2%": number;
      "50%": number;
      "61.8%": number;
      "78.6%": number;
      "100%": number;
    };
  };

  trendLines: {
    uptrend: { start: number; end: number; slope: number } | null;
    downtrend: { start: number; end: number; slope: number } | null;
    channel: {
      upper: number;
      lower: number;
      width: number;
    };
  };

  patterns: Array<{
    type: string;
    confidence: string;
    target: number;
    invalidation: number;
    description: string;
  }>;

  marketStructure: {
    trend: "UPTREND" | "DOWNTREND" | "SIDEWAYS";
    phase: "ACCUMULATION" | "MARKUP" | "DISTRIBUTION" | "MARKDOWN";
    strength: "STRONG" | "MODERATE" | "WEAK";
    description: string;
  };

  tradingZones: {
    buyZone: {
      low: number;
      high: number;
      description: string;
    };
    sellZone: {
      low: number;
      high: number;
      description: string;
    };
    noTradeZone: {
      low: number;
      high: number;
      description: string;
    };
  };

  tradingPlan: {
    setup: string;
    entries: Array<{
      type: "LONG" | "SHORT";
      price: number;
      rationale: string;
    }>;
    targets: Array<{
      level: number;
      rationale: string;
    }>;
    stopLoss: {
      level: number;
      rationale: string;
    };
    riskReward: string;
    timeframe: "SWING" | "DAY" | "POSITION";
    notes: string[];
  };
}

interface ChartAnalysisResponse {
  success: boolean;
  data: ChartAnalysisData;
  error?: string;
  timestamp: number;
}

/**
 * Fetch chart analysis from API
 */
async function fetchChartAnalysis(
  symbol: string,
  timeframe: string,
  enableAI: boolean
): Promise<ChartAnalysisData> {
  if (!symbol) {
    throw new Error("Symbol is required");
  }

  const params = new URLSearchParams({ timeframe });
  if (enableAI) params.set("analyze", "1");

  const response = await fetch(
    `/api/stock/chart-analysis/${symbol}?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json: ChartAnalysisResponse = await response.json().catch(() => ({
    success: false,
    data: null as any,
    error: `HTTP ${response.status}`,
  }));

  if (!response.ok) {
    throw new Error(json.error || `HTTP ${response.status}`);
  }

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch chart analysis");
  }

  return json.data;
}

/**
 * Hook to fetch comprehensive chart analysis
 *
 * @param symbol - Stock symbol
 * @returns Chart analysis with key levels, patterns, and trading plan
 */
export function useChartAnalysis(
  symbol: string,
  timeframe: string = "1M",
  options: { enableAI?: boolean } = {}
) {
  const enableAI = Boolean(options.enableAI);
  return useQuery({
    queryKey: ["stock", "chart-analysis", symbol, timeframe, enableAI],
    queryFn: () => fetchChartAnalysis(symbol, timeframe, enableAI),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });
}
