"use client";

import { TrendingUp, Activity, Zap, ArrowUpRight } from "lucide-react";

interface MarketStatusBarProps {
  isMarketOpen?: boolean;
  sentiment?: string;
  volume?: string;
  volatility?: string;
  trend?: string;
}

/**
 * Market Status Bar Component
 * Displays key market indicators in a horizontal scrollable bar
 */
export function MarketStatusBar({
  isMarketOpen = true,
  sentiment = "Bullish",
  volume = "Above Avg",
  volatility = "Low",
  trend = "Upward",
}: MarketStatusBarProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {/* Market Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className={`w-2 h-2 rounded-full ${
              isMarketOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-xs font-medium text-foreground">
            Markets {isMarketOpen ? "Open" : "Closed"}
          </span>
        </div>

        <div className="w-px h-6 bg-border flex-shrink-0" />

        {/* Sentiment */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-muted-foreground">Sentiment:</span>
          <span className="text-xs font-bold text-emerald-500">
            {sentiment}
          </span>
        </div>

        <div className="w-px h-6 bg-border flex-shrink-0" />

        {/* Volume */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">Volume:</span>
          <span className="text-xs font-bold text-blue-500">{volume}</span>
        </div>

        <div className="w-px h-6 bg-border flex-shrink-0" />

        {/* Volatility */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-muted-foreground">Volatility:</span>
          <span className="text-xs font-bold text-amber-500">{volatility}</span>
        </div>

        <div className="w-px h-6 bg-border flex-shrink-0" />

        {/* Trending */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArrowUpRight className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Trend:</span>
          <span className="text-xs font-bold text-primary">{trend}</span>
        </div>
      </div>
    </div>
  );
}

