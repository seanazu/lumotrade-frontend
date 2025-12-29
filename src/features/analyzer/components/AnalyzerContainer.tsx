"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StrategyDebugPanel } from "@/components/analyzer/StrategyDebugPanel";
import { useStockAnalysis } from "@/hooks/useStockAnalysis";
import { useStockChart } from "@/hooks/useStockChart";
import { useChartAnalysis } from "@/hooks/useChartAnalysis";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useTradingSignal } from "@/hooks/useTradingSignal";
import { useAIThesis } from "@/hooks/useAIThesis";
import { useResearch } from "@/hooks/useResearch";
import { useSelectedStrategy } from "@/hooks/useSelectedStrategy";
import { AnalyzerHeader } from "./AnalyzerHeader";
import { AnalyzerInfoCards } from "./AnalyzerInfoCards";
import { AnalyzerChartSection } from "./AnalyzerChartSection";
import { AnalyzerResearchSection } from "./AnalyzerResearchSection";
import { AnalyzerBottomSection } from "./AnalyzerBottomSection";
import type { TradingStrategy } from "@/types/strategies";

/**
 * Analyzer Container Component
 * Main container orchestrating the stock analyzer page
 */
export function AnalyzerContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get symbol from URL or use default
  const urlSymbol = searchParams.get("symbol");
  const [symbol, setSymbol] = useState(urlSymbol || "NVDA");

  // Update URL when symbol changes
  useEffect(() => {
    if (symbol !== urlSymbol) {
      router.push(`/analyzer?symbol=${symbol}`);
    }
  }, [symbol, urlSymbol, router]);

  // Persist last viewed symbol
  useEffect(() => {
    if (symbol) {
      localStorage.setItem("lastViewedSymbol", symbol);
    }
  }, [symbol]);

  // Load last viewed symbol on mount
  useEffect(() => {
    if (!urlSymbol) {
      const lastSymbol = localStorage.getItem("lastViewedSymbol");
      if (lastSymbol) {
        setSymbol(lastSymbol);
      }
    }
  }, [urlSymbol]);

  // Fetch comprehensive stock analysis
  const { data: analysis, error } = useStockAnalysis(symbol);

  // Fetch quote quickly so header can render immediately
  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);

  // Fetch chart data with selected timeframe
  const [timeframe, setTimeframe] = useState("1M");
  const interval = "1day";
  const {
    data: chartData,
    error: chartError,
    isLoading: chartLoading,
  } = useStockChart(symbol, timeframe, interval);

  // AI analysis is opt-in (button click)
  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<
    TradingStrategy | undefined
  >();

  useEffect(() => {
    setAiEnabled(false);
    setSelectedStrategy(undefined);
  }, [symbol, timeframe]);

  // Fetch and manage saved strategy
  const { savedStrategy, saveStrategy, isSaving } = useSelectedStrategy(symbol);

  // Handler to save a selected strategy
  const handleSaveStrategy = useCallback(
    (strategy: TradingStrategy) => {
      saveStrategy(strategy);
      setSelectedStrategy(strategy);
    },
    [saveStrategy]
  );

  // Fetch professional chart analysis with levels and trading plan
  const {
    data: chartAnalysis,
    error: chartAnalysisError,
    isLoading: chartAnalysisLoading,
  } = useChartAnalysis(symbol, timeframe, { enableAI: aiEnabled });

  // AI Thesis loads only when aiEnabled is true
  const { isLoading: aiThesisLoading } = useAIThesis(symbol, aiEnabled);

  // Comprehensive research (includes strategies when aiEnabled)
  const {
    data: research,
    isLoading: researchLoading,
    error: researchError,
  } = useResearch(symbol, timeframe, {
    includeStrategies: aiEnabled,
    enabled: aiEnabled,
  });

  // Trading signal is loaded separately so the page isn't blocked by it
  const { data: tradingSignal, isLoading: tradingSignalLoading } =
    useTradingSignal(symbol, !!symbol);

  // Error state - user-friendly error message
  if ((error && !analysis) || (!analysis && !quote && !quoteLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">
              Unable to Load Stock Data
            </h2>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error
                ? error.message
                : `We couldn't find data for ${symbol}. Please check the symbol and try again.`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setSymbol("NVDA")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try NVDA
            </button>
            <button
              onClick={() => setSymbol("AAPL")}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Try AAPL
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayChartData = chartData && chartData.length > 0 ? chartData : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Stock Header */}
      <AnalyzerHeader
        name={analysis?.profile.name || symbol}
        ticker={analysis?.symbol || symbol}
        industry={analysis?.profile.sector || "—"}
        price={quote?.price ?? analysis?.quote.price ?? 0}
        change={quote?.change ?? analysis?.quote.change ?? 0}
        changePercent={
          quote?.changePercent ?? analysis?.quote.changePercent ?? 0
        }
        onSymbolChange={setSymbol}
      />

      {/* Info Cards - Horizontal Scroll */}
      <AnalyzerInfoCards
        symbol={symbol}
        analysis={analysis}
        aiEnabled={aiEnabled}
      />

      {/* Main Content */}
      <div className="w-full px-6 py-6 space-y-6">
        {/* Top Row: Chart + Trading Plan Card */}
        <AnalyzerChartSection
          displayChartData={displayChartData}
          symbol={symbol}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          chartAnalysis={chartAnalysis}
          chartError={
            chartError instanceof Error
              ? chartError.message
              : chartAnalysisError instanceof Error
                ? chartAnalysisError.message
                : undefined
          }
          chartLoading={chartLoading || chartAnalysisLoading}
          onAnalyze={() => setAiEnabled(true)}
          analyzeLoading={aiThesisLoading || researchLoading}
          aiReady={aiEnabled && !aiThesisLoading && !researchLoading}
          selectedStrategy={selectedStrategy}
          savedStrategy={savedStrategy || undefined}
          quote={quote}
          chartAnalysisLoading={chartAnalysisLoading}
        />

        {/* AI Research Panel */}
        <AnalyzerResearchSection
          research={research}
          researchLoading={researchLoading}
          symbol={symbol}
          onSelectStrategy={setSelectedStrategy}
          onSaveStrategy={handleSaveStrategy}
          selectedStrategyId={selectedStrategy?.id}
          isSaving={isSaving}
        />

        {/* Bottom Section: Trading Signal, News, ML Model */}
        <AnalyzerBottomSection
          tradingSignal={tradingSignal}
          tradingSignalLoading={tradingSignalLoading}
          analysis={analysis}
          symbol={symbol}
        />
      </div>

      {/* Debug Panel - Remove in production */}
      <StrategyDebugPanel symbol={symbol} />
    </div>
  );
}

AnalyzerContainer.displayName = "AnalyzerContainer";
