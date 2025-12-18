/**
 * Economic Calendar Hooks
 * Uses backend API route for economic calendar
 */

import { useQuery } from "@tanstack/react-query";

// ============ Types ============

export interface EconomicEvent {
  event: string;
  country: string;
  date: string; // ISO date string
  impact: "low" | "medium" | "high";
  estimate?: string;
  previous?: string;
  actual?: string;
  unit?: string;
}

// ============ API Functions ============

async function fetchEconomicCalendar(): Promise<EconomicEvent[]> {
  const res = await fetch("/api/market/economic-calendar");
  if (!res.ok) {
    throw new Error("Failed to fetch economic calendar");
  }
  const data = await res.json();
  return data.events || [];
}

// ============ Hooks ============

export function useEconomicCalendar() {
  return useQuery({
    queryKey: ["economic-calendar"],
    queryFn: async () => {
      const data = await fetchEconomicCalendar();
      
      // If empty (weekend), return sample upcoming events
      if (!data || data.length === 0) {
        const today = new Date();
        const isWeekend = today.getDay() === 0 || today.getDay() === 6;
        
        if (isWeekend) {
          // Return next week's likely events
          const monday = new Date(today);
          monday.setDate(today.getDate() + (8 - today.getDay()) % 7);
          
          return [
            {
              country: "US",
              event: "Jobless Claims",
              actual: null,
              estimate: null,
              previous: null,
              impact: "high" as const,
              date: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              country: "US",
              event: "CPI m/m",
              actual: null,
              estimate: null,
              previous: null,
              impact: "high" as const,
              date: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              country: "US",
              event: "Retail Sales m/m",
              actual: null,
              estimate: null,
              previous: null,
              impact: "medium" as const,
              date: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ];
        }
      }
      
      return data;
    },
    refetchInterval: 300000,
    staleTime: 120000,
  });
}

