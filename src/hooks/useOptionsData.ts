/**
 * Unified Options Data Hook
 * Returns VIX, Put/Call Ratio, and IV Rank
 */

import { useQuery } from "@tanstack/react-query";

export interface OptionsData {
  vix: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  } | null;
  putCallRatio: number;
  ivRank: number;
  sentiment: "FEARFUL" | "NEUTRAL" | "GREEDY";
}

async function fetchOptionsData(): Promise<OptionsData> {
  // Try ORATS endpoint first
  try {
    const res = await fetch("/api/market/options-orats");
    if (res.ok) {
      const data = await res.json();
      return {
        vix: data.vix ? {
          symbol: "VIX",
          price: data.vix,
          change: 0,
          changePercent: 0,
        } : null,
        putCallRatio: data.putCallRatio || 0.9,
        ivRank: data.ivRank || 50,
        sentiment: data.sentiment || "NEUTRAL",
      };
    }
  } catch (error) {
    console.warn("ORATS endpoint failed, falling back to Finnhub");
  }

  // Fallback to Finnhub
  const res = await fetch("/api/market/options-sentiment");
  if (!res.ok) {
    console.warn("Failed to fetch options data:", await res.text());
    return {
      vix: null,
      putCallRatio: 0.9,
      ivRank: 50,
      sentiment: "NEUTRAL",
    };
  }
  const data = await res.json();
  return {
    vix: data.vix || null,
    putCallRatio: data.putCallRatio || 0.9,
    ivRank: data.ivRank || 50,
    sentiment: data.sentiment || "NEUTRAL",
  };
}

export function useOptionsData() {
  return useQuery({
    queryKey: ["options-data"],
    queryFn: fetchOptionsData,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}
