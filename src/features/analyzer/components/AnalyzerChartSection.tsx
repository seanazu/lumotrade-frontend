'use client';

import { ChartPanel } from '@/components/analyzer/ChartPanel';
import { TradingPlanCard } from '@/components/analyzer/TradingPlanCard';
import { Skeleton } from '@/components/design-system/atoms/Skeleton';
import type { ChartDataPoint } from '@/types/chart';
import type { TradingStrategy } from '@/types/strategies';

interface AnalyzerChartSectionProps {
  displayChartData: ChartDataPoint[];
  symbol: string;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  chartAnalysis: any;
  chartError: string | undefined;
  chartLoading: boolean;
  onAnalyze: () => void;
  analyzeLoading: boolean;
  aiReady: boolean;
  selectedStrategy: TradingStrategy | undefined;
  savedStrategy: TradingStrategy | undefined;
  quote: any;
  chartAnalysisLoading: boolean;
}

/**
 * Analyzer Chart Section Component
 * Displays the chart panel and trading plan side by side
 */
export function AnalyzerChartSection({
  displayChartData,
  symbol,
  timeframe,
  onTimeframeChange,
  chartAnalysis,
  chartError,
  chartLoading,
  onAnalyze,
  analyzeLoading,
  aiReady,
  selectedStrategy,
  savedStrategy,
  quote,
  chartAnalysisLoading,
}: AnalyzerChartSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Left: Chart (2/3 width) */}
      <div className="lg:col-span-2 min-h-[400px] sm:min-h-[500px]">
        <ChartPanel
          data={displayChartData}
          symbol={symbol}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          chartAnalysis={chartAnalysis}
          chartError={chartError}
          chartLoading={chartLoading}
          onAnalyze={onAnalyze}
          analyzeLoading={analyzeLoading}
          aiReady={aiReady}
          selectedStrategy={selectedStrategy}
        />
      </div>

      {/* Right: Trading Plan Card (1/3 width) - matches chart height */}
      <div className="lg:col-span-1">
        {savedStrategy ? (
          <TradingPlanCard
            strategy={savedStrategy}
            currentPrice={quote?.price || chartAnalysis?.currentPrice}
            timeframe={timeframe}
          />
        ) : chartAnalysis ? (
          <TradingPlanCard analysis={chartAnalysis} timeframe={timeframe} />
        ) : chartAnalysisLoading ? (
          <Skeleton className="h-full min-h-[400px] rounded-xl" />
        ) : null}
      </div>
    </div>
  );
}

AnalyzerChartSection.displayName = 'AnalyzerChartSection';

