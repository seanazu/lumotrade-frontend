/**
 * Master Stock Analysis Hook
 * Orchestrates all data fetching for comprehensive stock analysis
 */

import { useQuery } from "@tanstack/react-query";

export interface StockAnalysisData {
  symbol: string;
  quote: {
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
    previousClose: number;
    marketCap?: number;
    pe?: number;
    eps?: number;
  };
  profile: {
    name: string;
    sector: string;
    industry: string;
    description?: string;
    website?: string;
    ceo?: string;
    employees?: number;
  };
  technicals: {
    rsi?: number;
    rsiInterpretation?: string;
    macd?: {
      value: number;
      signal: number;
      histogram: number;
      interpretation: string;
    };
    movingAverages: {
      sma20?: number;
      sma50?: number;
      sma200?: number;
      ema20?: number;
    };
    trend: "bullish" | "bearish" | "neutral";
    summary: string;
  };
  aiThesis?: {
    thesis: string;
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
    conviction: "HIGH" | "MEDIUM" | "LOW";
    timeframe: "SHORT" | "MEDIUM" | "LONG";
    keyDrivers: string[];
    risks: string[];
    shouldTrade: boolean;
    reasoning: string;
  };
  tradingSignal?: {
    signal: string;
    conviction: string;
    timeframe: string;
    entryZone: { min: number; max: number };
    target: { price: number; percentage: number };
    stopLoss: { price: number; percentage: number };
    riskReward: string;
  };
  keyLevels: {
    support1?: number;
    support2?: number;
    resistance1?: number;
    resistance2?: number;
  };
  catalysts: Array<{
    date: string;
    event: string;
    importance: "HIGH" | "MEDIUM" | "LOW";
    description?: string;
  }>;
  news: Array<{
    title: string;
    publishedDate: string;
    url: string;
    source?: string;
    sentiment?: string;
  }>;
  financials: {
    revenue?: number;
    revenueGrowth?: number;
    netIncome?: number;
    netIncomeGrowth?: number;
    eps?: number;
    epsGrowth?: number;
    grossMargin?: number;
    operatingMargin?: number;
  };
  earnings: {
    nextDate?: string;
    nextTiming?: string;
    estimate?: number;
    lastActual?: number;
    lastEstimate?: number;
    surprise?: number;
  };
  riskProfile: {
    beta?: number;
    volatility?: "HIGH" | "MEDIUM" | "LOW";
    shortInterest?: number;
    distance52WeekHigh?: number;
    distance52WeekLow?: number;
  };
}

interface StockAnalysisResponse {
  success: boolean;
  data?: StockAnalysisData;
  error?: string;
  timestamp: number;
}

/**
 * Fetch comprehensive stock analysis from API
 */
async function fetchStockAnalysis(symbol: string): Promise<StockAnalysisData> {
  if (!symbol) {
    throw new Error("Symbol is required");
  }

  const response = await fetch(`/api/stock/analyze/${symbol}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const json: StockAnalysisResponse = await response.json();
    throw new Error(json.error || `HTTP ${response.status}`);
  }

  const json: StockAnalysisResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch stock analysis");
  }

  return json.data;
}

/**
 * Master hook for comprehensive stock analysis
 *
 * Fetches all data needed for the analyzer page in one call:
 * - Real-time quote
 * - Company profile
 * - Technical indicators
 * - AI thesis
 * - Trading signals
 * - Key levels
 * - Catalysts
 * - News
 * - Financials
 * - Earnings
 * - Risk profile
 *
 * @param symbol - Stock symbol to analyze
 * @param options - Hook options
 * @returns Comprehensive stock analysis data
 */
export function useStockAnalysis(
  symbol: string,
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
  } = {}
) {
  // This endpoint is relatively heavy (multiple vendors). Keep it mostly “load once”
  // and refresh only if a caller explicitly opts in.
  const { enabled = true, refetchInterval = false } = options;

  return useQuery({
    queryKey: ["stock", "analysis", symbol],
    queryFn: () => fetchStockAnalysis(symbol),
    enabled: enabled && !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: enabled ? refetchInterval : false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
}
