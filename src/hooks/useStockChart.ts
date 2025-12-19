/**
 * Stock Chart Data Hook
 * Fetches historical OHLC data for charting
 */

import { useQuery } from "@tanstack/react-query";

export interface ChartBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartDataResponse {
  success: boolean;
  data: ChartBar[];
  symbol: string;
  timeframe: string;
  interval: string;
  fallback?: boolean;
  error?: string;
  timestamp: number;
}

/**
 * Fetch chart data from API
 */
async function fetchChartData(
  symbol: string,
  timeframe: string,
  interval: string
): Promise<ChartBar[]> {
  if (!symbol) {
    throw new Error("Symbol is required");
  }

  const params = new URLSearchParams({
    timeframe,
    interval,
  });

  const response = await fetch(`/api/stock/chart/${symbol}?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json: ChartDataResponse = await response
    .json()
    .catch(
      () =>
        ({ success: false, data: [], error: `HTTP ${response.status}` }) as any
    );

  if (!response.ok) {
    throw new Error(json.error || `HTTP ${response.status}`);
  }

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch chart data");
  }

  return json.data;
}

/**
 * Hook to fetch stock chart data
 *
 * @param symbol - Stock symbol
 * @param timeframe - Chart timeframe (1D, 1W, 1M, 3M, 1Y, All)
 * @param interval - Data interval (1min, 5min, 1hour, 1day)
 * @returns Chart data with loading and error states
 */
export function useStockChart(
  symbol: string,
  timeframe: string = "1M",
  interval: string = "1day"
) {
  return useQuery({
    queryKey: ["stock", "chart", symbol, timeframe, interval],
    queryFn: () => fetchChartData(symbol, timeframe, interval),
    enabled: !!symbol,
    // Server-side DB cache handles freshness; avoid background polling.
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });
}
