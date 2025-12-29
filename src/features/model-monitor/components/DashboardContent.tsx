"use client";

import { motion } from "framer-motion";
import { DashboardStats } from "./DashboardStats";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { SystemInfo } from "./SystemInfo";
import type { AccuracyStats, TradingStats, TradingStatus } from "../types";

interface DashboardContentProps {
  accuracyStats?: AccuracyStats;
  accuracyLoading: boolean;
  statusData?: TradingStatus;
  tradingStats?: TradingStats;
}

/**
 * DashboardContent Component
 * Main dashboard view with stats, metrics, and system info
 */
export function DashboardContent({
  accuracyStats,
  accuracyLoading,
  statusData,
  tradingStats,
}: DashboardContentProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Key Metrics - Top Row */}
      <DashboardStats
        accuracyStats={accuracyStats}
        accuracyLoading={accuracyLoading}
        statusData={statusData}
        tradingStats={tradingStats}
      />

      {/* Performance Metrics - Compact Grid */}
      <PerformanceMetrics stats={tradingStats} />

      {/* System & Configuration - 3 Column Grid */}
      <SystemInfo accuracyStats={accuracyStats} tradingStats={tradingStats} />
    </motion.div>
  );
}

DashboardContent.displayName = "DashboardContent";

