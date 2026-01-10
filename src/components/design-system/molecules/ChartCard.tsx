"use client";

import { TradingViewWidget } from "@/components/design-system/charts";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  changePercent: number;
  chartType?: "line" | "candles";
}

/**
 * Chart Card Component
 * Displays a trading chart with header showing current price and change
 */
export function ChartCard({
  symbol,
  name,
  icon,
  price,
  changePercent,
  chartType = "line",
}: ChartCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{icon}</span>
            <h3 className="text-xs font-bold text-foreground">{name}</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">{symbol}</span>
        </div>
      </div>
      <div className="h-64 sm:h-72">
        <TradingViewWidget symbol={symbol} chartType={chartType} />
      </div>
    </div>
  );
}
