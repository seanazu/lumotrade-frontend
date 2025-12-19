import { useQuery } from "@tanstack/react-query";

export interface TradingSignalData {
  signal: string;
  conviction: string;
  timeframe: string;
  entryZone: { min: number; max: number };
  target: { price: number; percentage: number };
  stopLoss: { price: number; percentage: number };
  riskReward: string;
}

interface TradingSignalResponse {
  success: boolean;
  data?: TradingSignalData;
  error?: string;
  timestamp?: number;
}

async function fetchTradingSignal(symbol: string): Promise<TradingSignalData> {
  const res = await fetch(`/api/stock/trading-signal/${symbol}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json: TradingSignalResponse = await res.json();

  if (!res.ok || !json.success || !json.data) {
    throw new Error(
      json.error || `Failed to fetch trading signal for ${symbol}`
    );
  }

  return json.data;
}

export function useTradingSignal(symbol: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["stock", "trading-signal", symbol],
    queryFn: () => fetchTradingSignal(symbol),
    enabled: enabled && !!symbol,
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

