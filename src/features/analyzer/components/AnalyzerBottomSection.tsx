"use client";

import { TradingSignal } from "@/components/analyzer/TradingSignal";
import { NewsSection } from "@/components/analyzer/NewsSection";
import { MLModelTrainingPrompt } from "@/components/analyzer/MLModelTrainingPrompt";
import { Skeleton } from "@/components/design-system/atoms/Skeleton";
import type { StockAnalysisData } from "@/hooks/useStockAnalysis";

interface AnalyzerBottomSectionProps {
  tradingSignal: any;
  tradingSignalLoading: boolean;
  analysis: StockAnalysisData | undefined;
  symbol: string;
}

/**
 * Analyzer Bottom Section Component
 * Displays trading signals, news, and ML model training prompt
 */
export function AnalyzerBottomSection({
  tradingSignal,
  tradingSignalLoading,
  analysis,
  symbol,
}: AnalyzerBottomSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* Trading Signal */}
        {tradingSignal ? (
          <TradingSignal
            signal={tradingSignal.signal}
            conviction={tradingSignal.conviction}
            timeframe={tradingSignal.timeframe}
            riskReward={tradingSignal.riskReward}
            entryZone={`$${tradingSignal.entryZone.min.toFixed(2)} - $${tradingSignal.entryZone.max.toFixed(2)}`}
            takeProfit={`$${tradingSignal.target.price.toFixed(2)}`}
            stopLoss={`$${tradingSignal.stopLoss.price.toFixed(2)}`}
            rrRatio={tradingSignal.riskReward}
          />
        ) : tradingSignalLoading ? (
          <Skeleton className="h-32 rounded-xl" />
        ) : null}

        {/* News */}
        {analysis ? (
          <NewsSection
            news={analysis.news.map((n: any) => ({
              text: n.title,
              time: new Date(n.publishedDate).toLocaleDateString(),
            }))}
          />
        ) : (
          <Skeleton className="h-48 rounded-xl" />
        )}
      </div>

      <div className="lg:col-span-1">
        {/* ML Model Training Prompt */}
        <MLModelTrainingPrompt symbol={symbol} />
      </div>
    </div>
  );
}

AnalyzerBottomSection.displayName = "AnalyzerBottomSection";
