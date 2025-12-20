"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TradingStrategy } from "@/types/strategies";
import { Target, TrendingUp, AlertTriangle, Clock } from "lucide-react";

interface StrategyMatrixProps {
  strategies: TradingStrategy[];
  currentPrice: number;
  onSelectStrategy: (strategy: TradingStrategy) => void;
  selectedStrategyId?: string;
}

export function StrategyMatrix({
  strategies,
  currentPrice,
  onSelectStrategy,
  selectedStrategyId,
}: StrategyMatrixProps) {
  const [sortBy, setSortBy] = useState<
    "confidence" | "riskReward" | "timeframe"
  >("confidence");

  if (!strategies || strategies.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">
          No strategies available. Click "Analyze" to generate AI-powered
          strategies.
        </p>
      </div>
    );
  }

  const sortedStrategies = [...strategies].sort((a, b) => {
    if (sortBy === "confidence") return b.confidence - a.confidence;
    if (sortBy === "riskReward") {
      const aRR = parseFloat(a.riskReward.split(":")[0]);
      const bRR = parseFloat(b.riskReward.split(":")[0]);
      return bRR - aRR;
    }
    return 0;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conservative":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "moderate":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "aggressive":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "swing":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "position":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Trading Strategies</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {strategies.length} AI-generated strategies • Select one to
              visualize on chart
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("confidence")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                sortBy === "confidence"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Confidence
            </button>
            <button
              onClick={() => setSortBy("riskReward")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                sortBy === "riskReward"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Risk:Reward
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedStrategies.map((strategy) => {
          const isSelected = strategy.id === selectedStrategyId;
          const entry = strategy.entries[0]?.price || currentPrice;
          const target1 = strategy.targets[0]?.price || currentPrice * 1.05;
          const stop = strategy.stopLoss.initial.price;

          return (
            <button
              key={strategy.id}
              onClick={() => onSelectStrategy(strategy)}
              className={cn(
                "text-left bg-background rounded-lg border-2 p-4 transition-all hover:shadow-lg",
                isSelected
                  ? "border-primary shadow-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-sm mb-1">{strategy.name}</h4>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                      getTypeColor(strategy.type)
                    )}
                  >
                    {strategy.type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Confidence
                  </div>
                  <div
                    className={cn(
                      "text-lg font-bold",
                      strategy.confidence >= 70
                        ? "text-emerald-400"
                        : strategy.confidence >= 50
                          ? "text-amber-400"
                          : "text-red-400"
                    )}
                  >
                    {strategy.confidence}%
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-muted/30 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Entry
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold">
                    ${entry.toFixed(2)}
                  </div>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Target
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    ${target1.toFixed(2)}
                  </div>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Stop
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-red-400">
                    ${stop.toFixed(2)}
                  </div>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] text-muted-foreground uppercase">
                      R:R
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-blue-400">
                    {strategy.riskReward}
                  </div>
                </div>
              </div>

              {/* Timeframe */}
              <div className="text-xs text-muted-foreground mb-2">
                <span className="font-semibold">Timeframe:</span>{" "}
                {strategy.timeframe}
              </div>

              {/* Thesis Preview */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {strategy.thesis.bullCase}
              </p>

              {isSelected && (
                <div className="mt-2 text-xs text-primary font-semibold">
                  ✓ Displayed on chart
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
