"use client";

import { useEffect, useState } from "react";
import { TradingChart } from "@/components/design-system/charts/TradingChart";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

import type { ChartAnalysisData } from "@/hooks/useChartAnalysis";
import type { TradingStrategy } from "@/types/strategies";
import type { StrategyZone } from "@/components/design-system/charts/TradingChart";

interface ChartPanelProps {
  data: any[];
  symbol?: string;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  chartAnalysis?: ChartAnalysisData;
  chartError?: string;
  chartLoading?: boolean;
  onAnalyze?: () => void;
  analyzeLoading?: boolean;
  aiReady?: boolean;
  selectedStrategy?: TradingStrategy;
}

export function ChartPanel({
  data,
  symbol,
  timeframe: externalTimeframe,
  onTimeframeChange,
  chartAnalysis,
  chartError,
  chartLoading,
  onAnalyze,
  analyzeLoading,
  aiReady,
  selectedStrategy,
}: ChartPanelProps) {
  const [selectedView, setSelectedView] = useState("chart");
  const [internalTimeframe, setInternalTimeframe] = useState("1M");
  const [chartType, setChartType] = useState<"candles" | "indicators">(
    "candles"
  );
  const [showPaywallHint, setShowPaywallHint] = useState(false);
  const [showLevels, setShowLevels] = useState(true);
  const [showSMAs, setShowSMAs] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const timeframe = externalTimeframe || internalTimeframe;
  const handleTimeframeChange = (tf: string) => {
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    } else {
      setInternalTimeframe(tf);
    }
  };

  const viewTabs = ["Chart", "Analysis"];
  const timeframes: Array<{ label: string; locked: boolean }> = [
    { label: "1M", locked: false },
    { label: "3M", locked: true },
    { label: "6M", locked: true },
    { label: "1Y", locked: true },
    { label: "5Y", locked: true },
  ];

  useEffect(() => {
    if (!showPaywallHint) return;
    const t = setTimeout(() => setShowPaywallHint(false), 3500);
    return () => clearTimeout(t);
  }, [showPaywallHint]);

  // Build price lines: supports, resistances, and pattern targets
  const priceLines = (() => {
    if (!chartAnalysis) return [];

    const current = chartAnalysis.currentPrice ?? 0;
    const supports = [...chartAnalysis.keyLevels.support]
      .filter((x) => Number.isFinite(x))
      .sort((a, b) => a - b);
    const resistances = [...chartAnalysis.keyLevels.resistance]
      .filter((x) => Number.isFinite(x))
      .sort((a, b) => a - b);

    const nearestSupports = supports
      .filter((s) => s <= current)
      .slice(-3)
      .reverse();
    const nearestResistances = resistances
      .filter((r) => r >= current)
      .slice(0, 3);

    const lines = [
      ...nearestResistances.map((p, idx) => ({
        price: p,
        color: "#ef4444",
        title: `R${idx + 1}`,
        lineStyle: 2,
        lineWidth: 1,
      })),
      ...nearestSupports.map((p, idx) => ({
        price: p,
        color: "#22c55e",
        title: `S${idx + 1}`,
        lineStyle: 2,
        lineWidth: 1,
      })),
    ];

    // Add pattern targets for high-confidence patterns
    const highConfPatterns = chartAnalysis.patterns.filter(
      (p) => p.confidence === "HIGH"
    );
    highConfPatterns.slice(0, 2).forEach((pattern, idx) => {
      lines.push({
        price: pattern.target,
        color: "#a855f7",
        title: `${pattern.type} Target`,
        lineStyle: 3,
        lineWidth: 1,
      });
    });

    // Add trading plan entry and targets
    if (chartAnalysis.tradingPlan.entries.length > 0) {
      const mainEntry = chartAnalysis.tradingPlan.entries[0];
      lines.push({
        price: mainEntry.price,
        color: "#3b82f6",
        title: "Entry",
        lineStyle: 0,
        lineWidth: 2,
      });
    }

    if (chartAnalysis.tradingPlan.targets.length > 0) {
      chartAnalysis.tradingPlan.targets.slice(0, 2).forEach((target, idx) => {
        lines.push({
          price: target.level,
          color: "#10b981",
          title: `TP${idx + 1}`,
          lineStyle: 2,
          lineWidth: 1,
        });
      });
    }

    // Add stop loss
    lines.push({
      price: chartAnalysis.tradingPlan.stopLoss.level,
      color: "#f59e0b",
      title: "Stop Loss",
      lineStyle: 2,
      lineWidth: 1,
    });

    return lines;
  })();

  // Build strategy zones from selected strategy
  const strategyZones: StrategyZone[] = (() => {
    if (!selectedStrategy) return [];

    const zones: StrategyZone[] = [];

    // Entry zone
    if (selectedStrategy.entries && selectedStrategy.entries.length > 0) {
      selectedStrategy.entries.forEach((entry, idx) => {
        zones.push({
          type: "entry",
          price: entry.price,
          label: `Entry ${idx + 1}`,
          color: "#6366f1", // Indigo
        });
      });
    }

    // Targets
    if (selectedStrategy.targets && selectedStrategy.targets.length > 0) {
      selectedStrategy.targets.forEach((target, idx) => {
        zones.push({
          type: "target",
          price: target.price,
          label: `TP${idx + 1}`,
          color: "#10b981", // Emerald
        });
      });
    }

    // Stop Loss
    if (selectedStrategy.stopLoss) {
      zones.push({
        type: "stop",
        price: selectedStrategy.stopLoss.initial.price,
        label: "Stop",
        color: "#f59e0b", // Amber
      });
    }

    return zones;
  })();

  const computeSMA = (period: number) => {
    if (!data || data.length < period) return [];
    const out: Array<{ time: string | number; value: number }> = [];
    const closes = data.map((d) => d.close);
    let sum = 0;
    for (let i = 0; i < closes.length; i++) {
      sum += closes[i];
      if (i >= period) sum -= closes[i - period];
      if (i >= period - 1) {
        out.push({ time: data[i].time, value: sum / period });
      }
    }
    return out;
  };

  const overlays =
    data && data.length > 0 && showSMAs
      ? [
          {
            id: "sma20",
            title: "SMA 20",
            color: "#60a5fa",
            lineWidth: 2,
            data: computeSMA(20),
          },
          {
            id: "sma50",
            title: "SMA 50",
            color: "#f59e0b",
            lineWidth: 2,
            data: computeSMA(50),
          },
        ].filter((o) => o.data && o.data.length > 0)
      : [];

  return (
    <div className="bg-card h-full rounded-xl border border-border overflow-hidden flex flex-col">
      {/* Top Controls */}
      <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
        {/* View Tabs */}
        <div className="flex gap-1">
          {viewTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedView(tab.toLowerCase())}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                selectedView === tab.toLowerCase()
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex gap-2 items-center">
          {/* Chart Controls */}
          <div className="flex gap-1 border-r border-border pr-2">
            <button
              onClick={() => setShowLevels(!showLevels)}
              className={cn(
                "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                showLevels
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle key levels"
            >
              Levels
            </button>
            <button
              onClick={() => setShowSMAs(!showSMAs)}
              className={cn(
                "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                showSMAs
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle moving averages"
            >
              SMAs
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={cn(
                "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                showVolume
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle volume"
            >
              Volume
            </button>
          </div>

          {onAnalyze && (
            <button
              onClick={onAnalyze}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                aiReady
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/15"
              )}
              disabled={analyzeLoading}
              title="Run AI analysis (cached after first run)"
            >
              {analyzeLoading ? "Analyzing…" : aiReady ? "Analyzed" : "Analyze"}
            </button>
          )}
        </div>
      </div>

      {/* Timeframe Selector - Only show for Chart view */}
      {selectedView === "chart" && (
        <div className="px-3 py-2 border-b border-border bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {timeframes.map((tf) => {
                const isActive = timeframe === tf.label;
                const isLocked = tf.locked;
                return (
                  <button
                    key={tf.label}
                    onClick={() => {
                      if (isLocked) {
                        setShowPaywallHint(true);
                        return;
                      }
                      handleTimeframeChange(tf.label);
                    }}
                    disabled={isLocked}
                    className={cn(
                      "px-3 py-1 rounded text-xs font-medium transition-colors inline-flex items-center gap-1",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      isLocked &&
                        "opacity-60 hover:text-muted-foreground cursor-not-allowed"
                    )}
                    title={
                      isLocked ? "Upgrade to Pro to unlock this timeframe" : ""
                    }
                  >
                    {tf.label}
                    {isLocked && <Lock className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                💡 Chart loads 2 years • Zoom changes visible range
              </span>
            </div>
          </div>

          {showPaywallHint && (
            <div className="mt-2 text-xs text-muted-foreground">
              Only <span className="font-semibold text-foreground">1M</span>{" "}
              timeframe is available. Upgrade to{" "}
              <span className="font-semibold text-foreground">Pro</span> to
              unlock 3M/6M/1Y/5Y zoom levels for deeper analysis.
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 bg-background/50 relative overflow-hidden">
        {/* Chart View */}
        {selectedView === "chart" && (
          <>
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Loading chart…
              </div>
            ) : data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground px-6 text-center">
                {chartError
                  ? `Chart unavailable: ${chartError}`
                  : "No chart data available."}
              </div>
            ) : (
              <TradingChart
                data={data}
                type="candlestick"
                height={600}
                showVolume={showVolume}
                showGrid={true}
                overlays={overlays}
                priceLines={showLevels ? priceLines : []}
                strategyZones={strategyZones}
                visibleRange={(() => {
                  if (!data || data.length === 0) return undefined;

                  const now = data[data.length - 1]?.time;
                  if (!now) return undefined;

                  const nowTimestamp =
                    typeof now === "string"
                      ? new Date(now).getTime() / 1000
                      : now;

                  // Calculate how far back to show based on timeframe
                  let daysBack: number;
                  switch (timeframe) {
                    case "1M":
                      daysBack = 30;
                      break;
                    case "3M":
                      daysBack = 90;
                      break;
                    case "6M":
                      daysBack = 180;
                      break;
                    case "1Y":
                      daysBack = 365;
                      break;
                    case "5Y":
                      daysBack = 5 * 365;
                      break;
                    default:
                      return undefined; // Let chart auto-fit
                  }

                  const fromTimestamp = nowTimestamp - daysBack * 24 * 60 * 60;

                  return {
                    from: fromTimestamp as any,
                    to: nowTimestamp as any,
                  };
                })()}
              />
            )}
          </>
        )}

        {/* Analysis View */}
        {selectedView === "analysis" && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <div>
              <h3 className="font-semibold text-sm mb-3">Technical Analysis</h3>
              {!chartAnalysis ? (
                <div className="text-sm text-muted-foreground">
                  No chart analysis available.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Market Structure
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded font-bold uppercase",
                          chartAnalysis.marketStructure.trend === "UPTREND" &&
                            "bg-emerald-500/10 text-emerald-500",
                          chartAnalysis.marketStructure.trend === "DOWNTREND" &&
                            "bg-red-500/10 text-red-500",
                          chartAnalysis.marketStructure.trend === "SIDEWAYS" &&
                            "bg-amber-500/10 text-amber-500"
                        )}
                      >
                        {chartAnalysis.marketStructure.trend}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {chartAnalysis.marketStructure.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Key Levels</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">
                          Support
                        </div>
                        {chartAnalysis.keyLevels.support.length > 0 ? (
                          chartAnalysis.keyLevels.support.map((s, i) => (
                            <div key={i} className="font-mono text-green-500">
                              S{i + 1}: ${s.toFixed(2)}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground">N/A</div>
                        )}
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">
                          Resistance
                        </div>
                        {chartAnalysis.keyLevels.resistance.length > 0 ? (
                          chartAnalysis.keyLevels.resistance.map((r, i) => (
                            <div key={i} className="font-mono text-red-500">
                              R{i + 1}: ${r.toFixed(2)}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground">N/A</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {chartAnalysis.patterns.length > 0 ? (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Patterns</span>
                      </div>
                      <div className="space-y-2">
                        {chartAnalysis.patterns.slice(0, 3).map((p, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{p.type}</span>
                              <span className="text-muted-foreground">
                                {p.confidence}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Target: ${p.target.toFixed(2)} • Invalidation: $
                              {p.invalidation.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="text-sm font-medium mb-1">Patterns</div>
                      <div className="text-xs text-muted-foreground">
                        No high-confidence patterns detected on this timeframe.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financials View */}
        {selectedView === "financials" && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <div>
              <h3 className="font-semibold text-sm mb-2">Financial Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Financials are shown in the right panel. (No mock financial data
                is displayed inside the chart.)
              </p>
            </div>
          </div>
        )}

        {/* News View */}
        {selectedView === "news" && (
          <div className="p-6 space-y-3 overflow-y-auto h-full">
            <h3 className="font-semibold text-sm mb-3">Latest News</h3>
            <p className="text-sm text-muted-foreground">
              News is shown in the main News section below. (No mock news is
              displayed inside the chart.)
            </p>
          </div>
        )}

        {/* Options View */}
        {selectedView === "options" && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <div>
              <h3 className="font-semibold text-sm mb-2">Options Chain</h3>
              <p className="text-sm text-muted-foreground">
                Options data is not loaded here yet. (No mock options chain is
                displayed.)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
