import { useQuery } from "@tanstack/react-query";

export interface AIThesisData {
  thesis: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  conviction: "HIGH" | "MEDIUM" | "LOW";
  timeframe: "SHORT" | "MEDIUM" | "LONG";
  keyDrivers: string[];
  risks: string[];
  shouldTrade: boolean;
  reasoning: string;
}

interface AIThesisResponse {
  success: boolean;
  data?: AIThesisData;
  error?: string;
  timestamp: number;
}

async function fetchAIThesis(symbol: string): Promise<AIThesisData> {
  const res = await fetch(`/api/stock/ai-thesis/${symbol}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json: AIThesisResponse = await res.json();

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || `Failed to fetch AI thesis for ${symbol}`);
  }

  return json.data;
}

export function useAIThesis(symbol: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ["stock", "ai-thesis", symbol],
    queryFn: () => fetchAIThesis(symbol),
    enabled: enabled && !!symbol,
    // Server caches per ET day; avoid refetching constantly
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

