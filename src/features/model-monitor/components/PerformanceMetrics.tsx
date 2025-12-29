"use client";

import { motion } from "framer-motion";
import { LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TradingStats } from "../types";

interface PerformanceMetricsProps {
  stats?: TradingStats;
}

/**
 * PerformanceMetrics Component
 * Displays detailed trading performance metrics
 */
export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
  if (!stats) {
    return (
      <div className="col-span-6 text-center py-8 bg-card border border-border/50 rounded-lg">
        <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground">No performance data</p>
      </div>
    );
  }

  const metrics = [
    {
      label: "Avg Win",
      value: `$${stats.avg_win.toFixed(2)}`,
      color: "text-up",
    },
    {
      label: "Avg Loss",
      value: `$${Math.abs(stats.avg_loss).toFixed(2)}`,
      color: "text-down",
    },
    {
      label: "Profit Factor",
      value:
        stats.avg_loss !== 0
          ? (Math.abs(stats.avg_win) / Math.abs(stats.avg_loss)).toFixed(2)
          : "N/A",
      color: "text-foreground",
    },
    {
      label: "Total P&L",
      value: `${stats.total_pnl > 0 ? "+" : ""}$${stats.total_pnl.toFixed(2)}`,
      color: stats.total_pnl > 0 ? "text-up" : "text-down",
    },
    {
      label: "ROI",
      value: `${stats.roi > 0 ? "+" : ""}${stats.roi.toFixed(2)}%`,
      color: stats.roi > 0 ? "text-up" : "text-down",
    },
    {
      label: "Max DD",
      value: stats.max_drawdown ? `${stats.max_drawdown.toFixed(2)}%` : "N/A",
      color: "text-down",
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {metrics.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className="bg-card border border-border/50 rounded-lg p-3"
        >
          <p className="text-[10px] text-muted-foreground mb-1.5">{item.label}</p>
          <p className={cn("text-sm font-semibold font-mono", item.color)}>
            {item.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

PerformanceMetrics.displayName = "PerformanceMetrics";

