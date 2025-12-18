"use client";

import { type FC, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { useMarketBreadth } from "@/hooks/useFMPData";
import { cn } from "@/lib/utils";

type TabType = "gainers" | "losers" | "actives";

export const MarketBreadthPanel: FC = () => {
  const { data, isLoading } = useMarketBreadth();
  const [activeTab, setActiveTab] = useState<TabType>("gainers");

  const tabs = [
    { id: "gainers" as TabType, label: "Top Gainers", icon: ArrowUpCircle, color: "text-up" },
    { id: "losers" as TabType, label: "Top Losers", icon: ArrowDownCircle, color: "text-down" },
    { id: "actives" as TabType, label: "Most Active", icon: Flame, color: "text-primary" },
  ];

  const currentData = data
    ? activeTab === "gainers"
      ? data.gainers
      : activeTab === "losers"
      ? data.losers
      : data.actives
    : [];

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Market Breadth</h3>
        </div>
        {data && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 p-1 bg-muted/30 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                activeTab === tab.id
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", activeTab === tab.id && tab.color)} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      )}

      {/* Data Grid */}
      {!isLoading && currentData && (
        <div className="space-y-1.5">
          {currentData.slice(0, 5).map((stock, index) => {
            const isPositive = stock.changesPercentage >= 0;
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold",
                      isPositive ? "bg-up/10 text-up" : "bg-down/10 text-down"
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-foreground truncate">
                      {stock.symbol}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {stock.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-foreground">
                      ${stock.price?.toFixed(2)}
                    </div>
                    <div
                      className={cn(
                        "text-[11px] font-bold font-mono flex items-center gap-0.5",
                        isPositive ? "text-up" : "text-down"
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {isPositive ? "+" : ""}
                      {stock.changesPercentage?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!currentData || currentData.length === 0) && (
        <div className="text-center py-6">
          <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
          <p className="text-xs text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
};

