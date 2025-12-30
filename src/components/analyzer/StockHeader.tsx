"use client";

import { useState } from "react";
import { Eye, Bell, TrendingUp, TrendingDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockHeaderProps {
  name: string;
  ticker: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  onSymbolChange?: (symbol: string) => void;
}

export function StockHeader({
  name,
  ticker,
  industry,
  price,
  change,
  changePercent,
  onSymbolChange,
}: StockHeaderProps) {
  const isPositive = change >= 0;
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() && onSymbolChange) {
      onSymbolChange(searchValue.trim().toUpperCase());
      setShowSearch(false);
      setSearchValue("");
    }
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Logo + Info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg sm:text-xl">
                {ticker.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold truncate">{name}</h1>
                <span className="text-xs text-muted-foreground">{ticker}</span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">
                  {industry}
                </span>
                {onSymbolChange && (
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Change symbol"
                  >
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-bold">${price.toFixed(2)}</span>
                <div
                  className={cn(
                    "flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium",
                    isPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)} ({isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%)
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Today</span>
              </div>
            </div>
          </div>

          {/* Symbol Search */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter symbol..."
                className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 whitespace-nowrap"
              >
                Go
              </button>
            </form>
          )}

          {/* Right: Action Buttons */}
          {!showSearch && (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0">
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Watch</span>
              </button>
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Alert</span>
              </button>
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs sm:text-sm text-red-500 font-medium whitespace-nowrap flex-shrink-0">
                Sell
              </button>
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors text-xs sm:text-sm text-white font-medium whitespace-nowrap flex-shrink-0">
                Buy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
