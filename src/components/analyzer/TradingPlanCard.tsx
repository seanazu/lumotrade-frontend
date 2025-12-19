"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import type { ChartAnalysisData } from "@/hooks/useChartAnalysis";

interface TradingPlanCardProps {
  analysis: ChartAnalysisData;
}

export function TradingPlanCard({ analysis }: TradingPlanCardProps) {
  const { marketStructure, patterns, tradingPlan, keyLevels, currentPrice } =
    analysis;

  const isUptrend = marketStructure.trend === "UPTREND";
  const riskRewardRatio = parseFloat(tradingPlan.riskReward.split(":")[1]);
  const isGoodRR = riskRewardRatio >= 2;

  // Calculate distances for visual ladder
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
  const riskPercent = ((risk / entry) * 100).toFixed(2);
  const rewardPercent = ((reward / entry) * 100).toFixed(2);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b",
          isUptrend
            ? "bg-gradient-to-r from-emerald-500/10 to-green-600/10 border-emerald-500/20"
            : "bg-gradient-to-r from-red-500/10 to-rose-600/10 border-red-500/20"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                isUptrend ? "bg-emerald-500/20" : "bg-red-500/20"
              )}
            >
              {isUptrend ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base">Trade Setup</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tradingPlan.setup}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">
              Risk:Reward
            </div>
            <div
              className={cn(
                "text-2xl font-bold font-mono",
                isGoodRR ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {tradingPlan.riskReward}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Trade Levels - Cleaner Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Entry */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
                Entry Zone
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-200 mb-1">
              ${entry.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {tradingPlan.entries[0]?.type || "LONG"} Position
            </div>
          </div>

          {/* Stop Loss */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-300 uppercase tracking-wide">
                Stop Loss
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-red-200 mb-1">
              ${stop.toFixed(2)}
            </div>
            <div className="text-xs text-red-400 font-semibold">
              -{riskPercent}% Risk
            </div>
          </div>

          {/* Take Profit */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                Target 1
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-200 mb-1">
              ${target1.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-400 font-semibold">
              +{rewardPercent}% Gain
            </div>
          </div>
        </div>

        {/* Price Ladder Visualization */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Price Ladder
          </div>
          <div className="space-y-2">
            {/* Targets */}
            {tradingPlan.targets.map((target, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-semibold text-emerald-300">
                    TP{i + 1}
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-200">
                  ${target.level.toFixed(2)}
                </span>
              </div>
            ))}

            {/* Entry */}
            <div className="flex items-center justify-between py-2 px-3 rounded bg-indigo-500/10 border-2 border-indigo-500/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                <span className="text-xs font-bold text-indigo-300 uppercase">
                  Entry
                </span>
              </div>
              <span className="text-sm font-mono font-bold text-indigo-200">
                ${entry.toFixed(2)}
              </span>
            </div>

            {/* Stop Loss */}
            <div className="flex items-center justify-between py-2 px-3 rounded bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span className="text-xs font-semibold text-red-300">
                  Stop Loss
                </span>
              </div>
              <span className="text-sm font-mono font-bold text-red-200">
                ${stop.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Levels */}
        <div className="border-t border-border pt-4">
          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Key Technical Levels
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-emerald-400 font-semibold mb-2 uppercase">
                Support Levels
              </div>
              <div className="flex flex-wrap gap-2">
                {keyLevels.support
                  .slice(-4)
                  .reverse()
                  .map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                    >
                      ${s.toFixed(2)}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-red-400 font-semibold mb-2 uppercase">
                Resistance Levels
              </div>
              <div className="flex flex-wrap gap-2">
                {keyLevels.resistance.slice(0, 4).map((r, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-red-500/25 bg-red-500/10 text-red-300"
                  >
                    ${r.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Patterns (if any) */}
        {patterns.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Detected Pattern
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-purple-200">
                  {patterns[0].type}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    patterns[0].confidence === "HIGH" &&
                      "bg-emerald-500/20 text-emerald-300",
                    patterns[0].confidence === "MEDIUM" &&
                      "bg-amber-500/20 text-amber-300",
                    patterns[0].confidence === "LOW" &&
                      "bg-blue-500/20 text-blue-300"
                  )}
                >
                  {patterns[0].confidence}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {patterns[0].description}
              </p>
            </div>
          </div>
        )}

        {/* Trading Notes */}
        {tradingPlan.notes.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Trading Notes
            </div>
            <ul className="space-y-1.5">
              {tradingPlan.notes.slice(0, 3).map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground flex">
                  <span className="mr-2 text-primary">•</span>
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
