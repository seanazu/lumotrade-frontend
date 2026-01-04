"use client";

import { Target, DollarSign, Award, TrendingUpDown } from "lucide-react";
import { StatCard } from "./StatCard";
import type { AccuracyStats, TradingStats, TradingStatus } from "../types";

interface DashboardStatsProps {
  accuracyStats?: AccuracyStats;
  accuracyLoading: boolean;
  statusData?: TradingStatus;
  tradingStats?: TradingStats;
}

/**
 * DashboardStats Component
 * Displays key performance metrics in a grid
 */
export function DashboardStats({
  accuracyStats,
  accuracyLoading,
  statusData,
  tradingStats,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        title="Model Accuracy"
        value={
          accuracyLoading
            ? "..."
            : accuracyStats && accuracyStats.total_predictions > 0
              ? `${(accuracyStats.accuracy * 100).toFixed(1)}%`
              : tradingStats
                ? `${tradingStats.win_rate.toFixed(1)}%`
                : "..."
        }
        subtitle={
          accuracyStats && accuracyStats.total_predictions > 0
            ? `${accuracyStats.total_predictions} trade signals`
            : tradingStats
              ? `${tradingStats.total_trades} trade signals`
              : "0 trade signals"
        }
        icon={Target}
        trend={
          (accuracyStats?.accuracy && accuracyStats.accuracy > 0.7) ||
          (tradingStats?.win_rate && tradingStats.win_rate > 70)
            ? "up"
            : "neutral"
        }
      />
      <StatCard
        title="Account Balance"
        value={`$${(statusData?.balance || 10000).toLocaleString()}`}
        subtitle={
          tradingStats ? `${tradingStats.roi.toFixed(1)}% ROI` : "Starting"
        }
        icon={DollarSign}
        trend={
          tradingStats && tradingStats.total_pnl > 0
            ? "up"
            : tradingStats && tradingStats.total_pnl < 0
              ? "down"
              : "neutral"
        }
      />
      <StatCard
        title="Win Rate"
        value={tradingStats ? `${tradingStats.win_rate.toFixed(1)}%` : "..."}
        subtitle={
          tradingStats
            ? `${tradingStats.winning_trades}W / ${tradingStats.losing_trades}L`
            : "No trades"
        }
        icon={Award}
        trend={tradingStats && tradingStats.win_rate > 50 ? "up" : "neutral"}
      />
      <StatCard
        title="Sharpe Ratio"
        value={
          tradingStats?.sharpe_ratio !== null &&
          tradingStats?.sharpe_ratio !== undefined
            ? tradingStats.sharpe_ratio.toFixed(2)
            : "..."
        }
        subtitle="Risk-adjusted"
        icon={TrendingUpDown}
        trend={
          tradingStats?.sharpe_ratio && tradingStats.sharpe_ratio > 2
            ? "up"
            : "neutral"
        }
      />
    </div>
  );
}

DashboardStats.displayName = "DashboardStats";

