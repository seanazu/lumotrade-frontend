"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ChartAnalysisData } from "@/hooks/useChartAnalysis";
import type { TradingStrategy } from "@/types/strategies";

interface TradingPlanCardProps {
  analysis?: ChartAnalysisData;
  strategy?: TradingStrategy;
  currentPrice?: number;
  timeframe?: string;
}

export function TradingPlanCard({
  analysis,
  strategy,
  currentPrice: priceOverride,
  timeframe: timeframeProp,
}: TradingPlanCardProps) {
  // Use strategy if provided, otherwise fall back to analysis
  if (strategy) {
    const entry = strategy.entries[0]?.price || 0;
    const stop = strategy.stopLoss.initial.price;
    const target1 = strategy.targets[0]?.price || entry * 1.05;
    const target2 = strategy.targets[1]?.price;

    const currentPrice = priceOverride || entry;
    const isUptrend = entry < target1; // Long if target is above entry
    const positionSide = isUptrend ? "LONG" : "SHORT";

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target1 - entry);
    const riskPercent = ((risk / entry) * 100).toFixed(1);
    const rewardPercent = ((reward / entry) * 100).toFixed(1);

    const keyLevels = {
      support: strategy.technicalBasis.keyLevels.filter(
        (l: number) => l < entry
      ),
      resistance: strategy.technicalBasis.keyLevels.filter(
        (l: number) => l > entry
      ),
    };

    const patterns = strategy.technicalBasis.patterns.map((p: string) => ({
      type: p,
      description: p,
      confidence: "HIGH" as const,
    }));

    return renderCard({
      isUptrend,
      positionSide,
      entry,
      stop,
      target1,
      target2,
      currentPrice,
      riskPercent,
      rewardPercent,
      keyLevels,
      patterns,
      setup: strategy.name,
      timeframe: strategy.timeframe,
      phase: strategy.type.toUpperCase(),
      trend: isUptrend ? "UPTREND" : "DOWNTREND",
      notes: [
        strategy.entries[0]?.rationale || "",
        strategy.stopLoss.rationale || "",
        ...strategy.thesis.catalysts.slice(0, 2),
      ].filter(Boolean),
      riskReward: strategy.riskReward,
      targets: strategy.targets.map((t) => ({ level: t.price })),
    });
  }

  if (!analysis) {
    return null;
  }

  const { marketStructure, patterns, tradingPlan, keyLevels, currentPrice } =
    analysis;

  const isUptrend = marketStructure.trend === "UPTREND";
  const positionSide = tradingPlan.entries[0]?.type || "LONG";

  const entry =
    tradingPlan.entries.length > 0
      ? tradingPlan.entries[0].price
      : currentPrice;
  const stop = tradingPlan.stopLoss.level;
  const target1 =
    tradingPlan.targets.length > 0
      ? tradingPlan.targets[0].level
      : entry * 1.05;

  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target1 - entry);
  const riskPercent = ((risk / entry) * 100).toFixed(1);
  const rewardPercent = ((reward / entry) * 100).toFixed(1);

  return renderCard({
    isUptrend,
    positionSide,
    entry,
    stop,
    target1,
    target2: tradingPlan.targets[1]?.level,
    currentPrice,
    riskPercent,
    rewardPercent,
    keyLevels,
    patterns,
    setup: tradingPlan.setup,
    timeframe: timeframeProp || "SWING",
    phase: marketStructure.phase,
    trend: marketStructure.trend,
    notes: tradingPlan.notes,
    riskReward: tradingPlan.riskReward,
    targets: tradingPlan.targets,
  });
}

function renderCard({
  isUptrend,
  positionSide,
  entry,
  stop,
  target1,
  target2,
  currentPrice,
  riskPercent,
  rewardPercent,
  keyLevels,
  patterns,
  setup,
  timeframe,
  phase,
  trend,
  notes,
  riskReward,
  targets,
}: {
  isUptrend: boolean;
  positionSide: string;
  entry: number;
  stop: number;
  target1: number;
  target2?: number;
  currentPrice: number;
  riskPercent: string;
  rewardPercent: string;
  keyLevels: { support: number[]; resistance: number[] };
  patterns: any[];
  setup: string;
  timeframe: string;
  phase: string;
  trend: string;
  notes: string[];
  riskReward: string;
  targets: any[];
}) {
  return (
    <div className="bg-white dark:bg-[#0d0f14] rounded-2xl border border-gray-200 dark:border-[#1f2329] overflow-hidden shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-[#1f2329] flex-shrink-0">
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-start gap-2">
            <div
              className={cn(
                "p-1.5 rounded-lg shrink-0",
                isUptrend
                  ? "bg-emerald-100 dark:bg-emerald-500/10"
                  : "bg-rose-100 dark:bg-rose-500/10"
              )}
            >
              {isUptrend ? (
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                  Trade Setup
                </h3>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide",
                    positionSide === "LONG"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                  )}
                >
                  {positionSide}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-[#9ca3af] leading-snug">
                {setup}
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-[#1c1e2b] border border-indigo-200 dark:border-[#2d3042] rounded-xl px-3 py-1.5 shrink-0 text-center">
            <div className="text-[9px] text-gray-600 dark:text-[#8b92a8] uppercase tracking-wide mb-0.5">
              R:R Ratio
            </div>
            <div className="text-base font-medium text-indigo-600 dark:text-[#8b9aff] font-mono leading-none">
              {riskReward}
            </div>
          </div>
        </div>

        {/* Market Context */}
        <div className="bg-gray-50 dark:bg-[#15171d] rounded-xl p-3 border border-gray-200 dark:border-[#1f2329] flex-shrink-0">
          <div className="text-[9px] text-gray-500 dark:text-[#6b7280] uppercase tracking-wide mb-2">
            Market Context
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <div className="text-[11px] text-gray-600 dark:text-[#9ca3af] mb-0.5">
                  Timeframe
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                  {timeframe}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-600 dark:text-[#9ca3af] mb-0.5">
                  Strength
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 rounded-sm",
                        i < 3
                          ? "h-2.5 bg-indigo-500 dark:bg-[#8b9aff]"
                          : "h-2 bg-gray-300 dark:bg-[#2d3042]"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-[11px] text-gray-600 dark:text-[#9ca3af] mb-0.5">
                  Phase
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                  {phase}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-600 dark:text-[#9ca3af] mb-0.5">
                  Trend
                </div>
                <div
                  className={cn(
                    "text-sm font-medium flex items-center gap-1 uppercase",
                    isUptrend
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {isUptrend ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{trend}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Levels */}
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Left: Key Levels */}
          <div>
            <div className="text-[9px] text-gray-500 dark:text-[#6b7280] uppercase tracking-wide mb-2">
              Key Levels
            </div>
            <div className="space-y-2.5">
              {/* Entry */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-10 bg-indigo-500 dark:bg-[#6c74ff] rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-600 dark:text-[#9ca3af] mb-0.5">
                    Entry
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white font-mono leading-tight">
                    ${entry.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Stop */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-10 bg-rose-500 dark:bg-[#ef4444] rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-[11px] text-gray-600 dark:text-[#9ca3af]">
                      Stop
                    </div>
                    <div className="text-[11px] text-rose-600 dark:text-[#f87171] font-normal">
                      -{riskPercent}%
                    </div>
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white font-mono leading-tight">
                    ${stop.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Target 1 */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-10 bg-emerald-500 dark:bg-[#34d399] rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-[11px] text-gray-600 dark:text-[#9ca3af]">
                      Target 1
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-[#6ee7b7] font-normal">
                      +{rewardPercent}%
                    </div>
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white font-mono leading-tight">
                    ${target1.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Price Ladder Visualization */}
          <div className="bg-gray-100 dark:bg-[#0a0b0f] rounded-xl p-3 border border-gray-200 dark:border-[#1a1d24]">
            <div className="flex items-center justify-end mb-2">
              <div className="text-[10px] text-gray-600 dark:text-[#6b7280]">
                Current:{" "}
                <span className="text-gray-900 dark:text-white font-mono font-normal">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {/* TP2 */}
              {target2 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-normal text-emerald-600 dark:text-[#34d399] uppercase tracking-wide">
                    TP2
                  </span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-[#34d399] font-mono">
                    ${target2.toFixed(2)}
                  </span>
                </div>
              )}

              {/* TP1 */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-normal text-emerald-600 dark:text-[#34d399] uppercase tracking-wide">
                  TP1
                </span>
                <span className="text-base font-medium text-emerald-600 dark:text-[#34d399] font-mono leading-tight">
                  ${target1.toFixed(2)}
                </span>
              </div>

              {/* Upside arrow */}
              <div className="flex items-center justify-center py-0.5">
                <ArrowUp className="w-3 h-3 text-gray-500 dark:text-[#6b7280] opacity-50" />
                <span className="text-[9px] text-gray-500 dark:text-[#6b7280] italic ml-1">
                  Upside
                </span>
              </div>

              {/* Entry */}
              <div className="bg-indigo-100 dark:bg-[#1c1e2b] border-2 border-indigo-300 dark:border-[#3c4052] rounded-lg px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-indigo-700 dark:text-[#8b9aff] uppercase tracking-wide">
                    ENT
                  </span>
                  <span className="text-base font-medium text-indigo-700 dark:text-[#8b9aff] font-mono leading-tight">
                    ${entry.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Risk arrow */}
              <div className="flex items-center justify-center py-0.5">
                <ArrowDown className="w-3 h-3 text-gray-500 dark:text-[#6b7280] opacity-50" />
                <span className="text-[9px] text-gray-500 dark:text-[#6b7280] italic ml-1">
                  Risk
                </span>
              </div>

              {/* Stop */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-normal text-rose-600 dark:text-[#ef4444] uppercase tracking-wide">
                  STP
                </span>
                <span className="text-sm font-medium text-rose-600 dark:text-[#ef4444] font-mono">
                  ${stop.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Levels */}
        <div className="mb-3">
          <div className="text-[9px] text-gray-500 dark:text-[#6b7280] uppercase tracking-wide mb-1.5">
            Technical Levels
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keyLevels.resistance.slice(0, 2).map((r, i) => (
              <span
                key={`r${i}`}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-[#15171d] border border-gray-300 dark:border-[#1f2329] text-gray-700 dark:text-[#c4cad8]"
              >
                R{i + 1}: {r.toFixed(2)}
              </span>
            ))}
            {keyLevels.support.slice(-2).map((s, i) => (
              <span
                key={`s${i}`}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-[#15171d] border border-gray-300 dark:border-[#1f2329] text-gray-700 dark:text-[#c4cad8]"
              >
                S{i + 1}: {s.toFixed(2)}
              </span>
            ))}
          </div>
        </div>

        {/* Pattern Detected */}
        {patterns.length > 0 && (
          <div className="mb-3">
            <div className="text-[9px] text-gray-500 dark:text-[#6b7280] uppercase tracking-wide mb-1.5">
              Pattern Detected
            </div>
            <div className="space-y-1.5">
              {patterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-[#15171d] rounded-lg p-2 border border-gray-200 dark:border-[#1f2329]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 bg-indigo-100 dark:bg-[#1c1e2b] rounded-lg flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-[#8b9aff]" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-medium text-gray-900 dark:text-white mb-0.5 leading-tight">
                          {pattern.type}
                        </h4>
                        <p className="text-[10px] text-gray-600 dark:text-[#9ca3af] leading-snug">
                          {pattern.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                        pattern.confidence === "HIGH" &&
                          "bg-indigo-100 text-indigo-700 dark:bg-[#8b9aff]/20 dark:text-[#8b9aff]",
                        pattern.confidence === "MEDIUM" &&
                          "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                        pattern.confidence === "LOW" &&
                          "bg-gray-100 text-gray-700 dark:bg-[#6b7280]/20 dark:text-[#9ca3af]"
                      )}
                    >
                      {pattern.confidence === "HIGH"
                        ? "85%"
                        : pattern.confidence === "MEDIUM"
                          ? "65%"
                          : "45%"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trading Notes */}
        {notes.length > 0 && (
          <div>
            <div className="text-[9px] text-gray-500 dark:text-[#6b7280] uppercase tracking-wide mb-1.5">
              Trading Notes
            </div>
            <ul className="space-y-1">
              {notes.map((note, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 text-[11px] text-gray-700 dark:text-[#c4cad8] leading-snug"
                >
                  <span className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-[#8b9aff] mt-1.5 shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
