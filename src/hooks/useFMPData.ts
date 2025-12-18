/**
 * Unified FMP Data Hook
 * Returns all market breadth data in one query
 */

import { useQuery } from "@tanstack/react-query";

export interface MarketMover {
  symbol: string;
  name: string;
  change: number;
  price: number;
  changesPercentage: number;
  volume?: number;
}

export interface FMPData {
  gainers: MarketMover[];
  losers: MarketMover[];
  actives: MarketMover[];
}

async function fetchFMPData(): Promise<FMPData> {
  const res = await fetch("/api/market/movers");
  if (!res.ok) {
    console.warn("Failed to fetch FMP data:", await res.text());
    return { gainers: [], losers: [], actives: [] };
  }
  const data = await res.json();
  return {
    gainers: data.gainers || [],
    losers: data.losers || [],
    actives: data.actives || [],
  };
}

export function useFMPData() {
  return useQuery({
    queryKey: ["fmp-data"],
    queryFn: fetchFMPData,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}
