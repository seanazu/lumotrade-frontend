import { useQuery } from "@tanstack/react-query";

interface MarketInsight {
  summary: string;
  keyTakeaways: string[];
  suggestions: string[];
  risks: string[];
  rawAnalysis: string;
}

interface MarketInsightsResponse {
  success: boolean;
  data: MarketInsight;
  timestamp: number;
}

export function useMarketInsights(
  stories: any[],
  technicalData?: any,
  mlPrediction?: any
) {
  return useQuery<MarketInsight>({
    queryKey: [
      "market-insights",
      stories.length,
      technicalData?.rsi,
      mlPrediction?.direction,
    ],
    queryFn: async () => {
      const response = await fetch("/api/market/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stories: stories.slice(0, 10).map((s) => ({
            title: s.title,
            sentiment: s.sentiment,
            importance: s.importance,
          })),
          technicalData,
          mlPrediction,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch market insights");
      }

      const result: MarketInsightsResponse = await response.json();
      return result.data;
    },
    enabled: stories.length > 0,
    // Server-side (DB) cached by request inputs; avoid repeated paid calls
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}
