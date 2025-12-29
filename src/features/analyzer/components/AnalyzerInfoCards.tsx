"use client";

import { InfoCards } from "@/components/analyzer/InfoCards";
import { Skeleton } from "@/components/design-system/atoms/Skeleton";
import type { StockAnalysisData } from "@/hooks/useStockAnalysis";

interface AnalyzerInfoCardsProps {
  symbol: string;
  analysis: StockAnalysisData | undefined;
  aiEnabled: boolean;
}

/**
 * Analyzer Info Cards Component
 * Displays horizontal scrolling info cards with key metrics
 */
export function AnalyzerInfoCards({
  symbol,
  analysis,
  aiEnabled,
}: AnalyzerInfoCardsProps) {
  if (!analysis) {
    return (
      <div className="bg-card border-b border-border">
        <div className="px-6 py-4 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="w-64 h-32 rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <InfoCards symbol={symbol} analysis={analysis} aiEnabled={aiEnabled} />
  );
}

AnalyzerInfoCards.displayName = "AnalyzerInfoCards";
