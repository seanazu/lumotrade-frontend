"use client";

import { useState } from "react";
import { ChartCard } from "@/components/design-system/molecules/ChartCard";
import { useMarketIndexes } from "@/hooks/useMarketIndexes";
import { MAJOR_INDEXES } from "@/constants/market";
import { cn } from "@/lib/utils";

/**
 * Charts Section Component
 * Displays a grid of market index charts with type toggle
 * Manages its own state and data fetching
 */
export function ChartsSection() {
  const [chartType, setChartType] = useState<"line" | "candles">("line");
  const { data: indexes } = useMarketIndexes();

  // Prepare chart data with live prices
  const charts = MAJOR_INDEXES.map((index) => {
    const liveData = indexes?.find((idx) => idx.symbol === index.symbol);
    return {
      symbol: index.symbol,
      name: index.name,
      icon: index.icon,
      price: liveData?.price || 0,
      changePercent: liveData?.changePercent || 0,
    };
  });
  return (
    <div className="flex-1 lg:flex-[2] space-y-3">
      {/* Chart Type Toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">Chart Type:</span>
        <div className="flex bg-muted/50 rounded-lg p-0.5">
          <button
            onClick={() => setChartType("line")}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-all",
              chartType === "line"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Line
          </button>
          <button
            onClick={() => setChartType("candles")}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-all",
              chartType === "candles"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Candles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {charts.map((chart) => (
          <ChartCard key={chart.symbol} {...chart} chartType={chartType} />
        ))}
      </div>
    </div>
  );
}
