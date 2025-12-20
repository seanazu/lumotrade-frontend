"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/tanstack-query/queryClient";
import { AppShell } from "@/components/design-system/organisms/AppShell";
import { Skeleton } from "@/components/design-system/atoms/Skeleton";
import { StockHeader } from "@/components/analyzer/StockHeader";
import { ChartPanel } from "@/components/analyzer/ChartPanel";
import { TradingSignal } from "@/components/analyzer/TradingSignal";
import { NewsSection } from "@/components/analyzer/NewsSection";
import { InfoCards } from "@/components/analyzer/InfoCards";
import { MLModelTrainingPrompt } from "@/components/analyzer/MLModelTrainingPrompt";
import { useStockAnalysis } from "@/hooks/useStockAnalysis";
import { useStockChart } from "@/hooks/useStockChart";
import { useChartAnalysis } from "@/hooks/useChartAnalysis";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useTradingSignal } from "@/hooks/useTradingSignal";
import { useAIThesis } from "@/hooks/useAIThesis";
import { useResearch } from "@/hooks/useResearch";
import { useSelectedStrategy } from "@/hooks/useSelectedStrategy";
import { TradingPlanCard } from "@/components/analyzer/TradingPlanCard";
import { ResearchPanel } from "@/components/analyzer/ResearchPanel";
import { StrategyDebugPanel } from "@/components/analyzer/StrategyDebugPanel";
import type { TradingStrategy } from "@/types/strategies";

function StockAnalyzer() {
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
  }, []);

  // Fetch comprehensive stock analysis
  const { data: analysis, error } = useStockAnalysis(symbol);

  // Fetch quote quickly so header can render immediately
  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);

  // Fetch chart data with selected timeframe
  // MVP: only 1M (1 month of daily candles) is unlocked. Other timeframes are paywalled in UI.
  const [timeframe, setTimeframe] = useState("1M");
  const interval = "1day"; // Always daily candles
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

  // Handler to save a selected strategy
  const handleSaveStrategy = (strategy: TradingStrategy) => {
    saveStrategy(strategy);
    setSelectedStrategy(strategy);
  };

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

  // Fetch and manage saved strategy
  const { savedStrategy, saveStrategy, isSaving } = useSelectedStrategy(symbol);

  // Error state - user-friendly error message
  // Only show full-page error if we have *nothing* to show.
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

  // No mock/fallback chart data: show empty + error UI if API fails
  const displayChartData = chartData && chartData.length > 0 ? chartData : [];

  // Prepare indicators for KeyIndicators component
  const indicators = analysis
    ? [
        {
          label: "RSI (14)",
          value: analysis.technicals.rsi?.toFixed(1) || "N/A",
          percentage: analysis.technicals.rsi || 50,
          color: "indigo" as const,
        },
        {
          label: "MACD",
          value: analysis.technicals.macd?.value.toFixed(2) || "N/A",
          percentage: 75,
          color: "emerald" as const,
        },
        {
          label: "MACD Histogram",
          value: analysis.technicals.macd?.histogram.toFixed(2) || "N/A",
          percentage: 78,
          color: "amber" as const,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Stock Header */}
      <StockHeader
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
      {analysis ? (
        <InfoCards symbol={symbol} analysis={analysis} aiEnabled={aiEnabled} />
      ) : (
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
      )}

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* Top Row: Chart + Trading Plan Card (same height) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart (2/3 width) */}
          <div className="lg:col-span-2">
            <ChartPanel
              data={displayChartData}
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
              <Skeleton className="h-full rounded-xl" />
            ) : null}
          </div>
        </div>

        {/* AI Research Panel - Full width below chart and trading plan */}
        {research ? (
          <ResearchPanel
            research={research}
            onSelectStrategy={setSelectedStrategy}
            onSaveStrategy={handleSaveStrategy}
            selectedStrategyId={selectedStrategy?.id}
            isSaving={isSaving}
          />
        ) : researchLoading ? (
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                🤖 AI is analyzing {symbol}...
              </div>
              <div className="flex justify-center gap-1 mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
              <div className="text-xs text-muted-foreground">
                Generating 5 distinct strategies based on comprehensive
                analysis...
              </div>
            </div>
          </div>
        ) : null}

        {/* Bottom Section: Trading Signal, News, ML Model */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                news={analysis.news.map((n) => ({
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
      </div>

      {/* Debug Panel - Remove in production */}
      <StrategyDebugPanel symbol={symbol} />
    </div>
  );
}

export default function AnalyzerPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell alertCount={0} userEmail="user@example.com">
        <StockAnalyzer />
      </AppShell>
    </QueryClientProvider>
  );
}
