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
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">
                {ticker.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{name}</h1>
                <span className="text-xs text-muted-foreground">{ticker}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wide">
                  {industry}
                </span>
                {onSymbolChange && (
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="ml-2 p-1 rounded hover:bg-muted transition-colors"
                    title="Change symbol"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
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

          {/* Symbol Search */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter symbol..."
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
              >
                Go
              </button>
            </form>
          )}

          {/* Right: Action Buttons */}
          {!showSearch && (
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
          )}
        </div>
      </div>
    </div>
  );
}
