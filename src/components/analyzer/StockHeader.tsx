"use client";

import { Eye, Bell, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockHeaderProps {
  name: string;
  ticker: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
}

export function StockHeader({
  name,
  ticker,
  industry,
  price,
  change,
  changePercent,
}: StockHeaderProps) {
  const isPositive = change >= 0;

  return (
    <div className="border-b border-border bg-card">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">
                {ticker.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{name}</h1>
                <span className="text-xs text-muted-foreground">{ticker}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wide">
                  {industry}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    isPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)} ({isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%)
                </div>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Watch
            </button>
            <button className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alert
            </button>
            <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm text-red-500 font-medium">
              Sell
            </button>
            <button className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors text-sm text-white font-medium">
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
