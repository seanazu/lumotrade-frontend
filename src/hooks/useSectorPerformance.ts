/**
 * Sector Performance Hook
 * Fetches S&P 500 sector performance data
 */

import { useQuery } from "@tanstack/react-query";

interface SectorData {
  name: string;
  symbol: string;
  change: number;
}

interface BreadthResponse {
  success: boolean;
  sectors: SectorData[];
  summary: {
    upSectors: number;
    downSectors: number;
    averageChange: number;
  };
  timestamp: number;
}

async function fetchSectorPerformance(): Promise<BreadthResponse> {
  const response = await fetch("/api/market/breadth");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch sector performance");
  }

  return data;
}

export function useSectorPerformance() {
  return useQuery({
    queryKey: ["market", "sectors"],
    queryFn: fetchSectorPerformance,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export type { SectorData, BreadthResponse };

