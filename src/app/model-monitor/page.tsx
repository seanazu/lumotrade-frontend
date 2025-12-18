"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  TrendingUpDown,
  BarChart3,
  RefreshCw,
  Brain,
  Award,
  CheckCircle2,
  XCircle,
  LineChart,
  Settings,
  Database,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
} from "lucide-react";

import { queryClient } from "@/lib/tanstack-query/queryClient";
import { AppShell } from "@/components/design-system/organisms/AppShell";
import { Button } from "@/components/design-system/atoms/Button";
import { Badge } from "@/components/design-system/atoms/Badge";
import {
  useModelAccuracyStats,
  useTrades,
  useTradingStatus,
  usePredictionHistory,
} from "@/hooks/useMLBackend";
import { cn } from "@/lib/utils";

// Tab navigation
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "predictions", label: "Predictions", icon: Target },
  { id: "trades", label: "Trades", icon: TrendingUpDown },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Filter Bar Component
function FilterBar({
  search,
  onSearchChange,
  filters,
  onClearAll,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filters: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
  }>;
  onClearAll: () => void;
}) {
  const hasActiveFilters = search || filters.some((f) => f.value !== "all");

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ticker or date..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.label} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filter.label}:
            </span>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-9 rounded-md border border-border/50 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onPageSizeChange?: (size: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-border/50 bg-card/30 px-4 py-3 rounded-b-lg">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{startItem}</span> to{" "}
          <span className="font-medium text-foreground">{endItem}</span> of{" "}
          <span className="font-medium text-foreground">{totalItems}</span>{" "}
          results
        </div>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // Reset to first page
              }}
              className="h-8 rounded-md border border-border/50 bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {trend && (
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                trend === "up"
                  ? "bg-up shadow-lg shadow-up/50"
                  : trend === "down"
                    ? "bg-down shadow-lg shadow-down/50"
                    : "bg-muted-foreground"
              )}
            />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Predictions Table
function PredictionsTable({ predictions }: { predictions: any[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Ticker
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Direction
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Expected (p50)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {predictions.length > 0 ? (
              predictions.map((pred, i) => {
                const isUp = pred.direction === "UP";
                const confidence = Math.round(pred.confidence * 100);

                return (
                  <motion.tr
                    key={pred.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(pred.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold font-mono">
                        {pred.ticker}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={isUp ? "bullish" : "bearish"}
                        className="text-xs"
                      >
                        {pred.direction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence}%` }}
                            transition={{ duration: 0.5, delay: i * 0.02 }}
                            className={cn("h-full", isUp ? "bg-up" : "bg-down")}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium">
                          {confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {pred.q50 !== null &&
                      pred.q50 !== undefined &&
                      !isNaN(pred.q50) ? (
                        <span
                          className={cn(
                            "text-xs font-mono font-semibold",
                            pred.q50 > 0 ? "text-up" : "text-down"
                          )}
                        >
                          {pred.q50 > 0 ? "+" : ""}
                          {(pred.q50 * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pred.was_correct === null ||
                      pred.was_correct === undefined ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : pred.was_correct === true ? (
                        <CheckCircle2 className="h-4 w-4 text-up" />
                      ) : (
                        <XCircle className="h-4 w-4 text-down" />
                      )}
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Target className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">
                      No predictions yet
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Trades Table
function TradesTable({ trades }: { trades: any[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Ticker
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Side
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Entry
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Exit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                P&L
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trades.length > 0 ? (
              trades.map((trade, i) => {
                const isLong = trade.direction === "LONG";
                const isProfitable = (trade.profit_loss || 0) > 0;
                const isOpen = trade.status === "OPEN";

                return (
                  <motion.tr
                    key={trade.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(trade.entry_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold font-mono">
                        {trade.ticker}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={isLong ? "bullish" : "bearish"}
                        className="text-xs"
                      >
                        {trade.direction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono">
                        ${trade.entry_price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono">
                        ${(trade.exit_price || trade.entry_price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono">
                        $
                        {trade.position_size?.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }) || "0"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isOpen && trade.profit_loss !== null ? (
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-xs font-mono font-semibold",
                              isProfitable ? "text-up" : "text-down"
                            )}
                          >
                            {isProfitable ? "+" : ""}$
                            {trade.profit_loss.toFixed(2)}
                          </span>
                          {trade.profit_loss_pct && (
                            <span
                              className={cn(
                                "text-xs font-mono",
                                isProfitable ? "text-up/70" : "text-down/70"
                              )}
                            >
                              {isProfitable ? "+" : ""}
                              {trade.profit_loss_pct.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          isOpen
                            ? "default"
                            : isProfitable
                              ? "bullish"
                              : "bearish"
                        }
                        className="text-xs"
                      >
                        {trade.status}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUpDown className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">
                      No trades yet
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Dashboard Component
function ModelDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [tradesPage, setTradesPage] = useState(1);
  const [predictionsPage, setPredictionsPage] = useState(1);
  const [predictionsPageSize, setPredictionsPageSize] = useState(50);
  const [tradesPageSize, setTradesPageSize] = useState(50);

  // Predictions filters
  const [predSearch, setPredSearch] = useState("");
  const [predDirection, setPredDirection] = useState<string>("all");
  const [predShouldTrade, setPredShouldTrade] = useState<string>("all");
  const [predResult, setPredResult] = useState<string>("all");

  // Trades filters
  const [tradeSearch, setTradeSearch] = useState("");
  const [tradeStatus, setTradeStatus] = useState<string>("all");
  const [tradeDirection, setTradeDirection] = useState<string>("all");

  const { data: accuracyStats, isLoading: accuracyLoading } =
    useModelAccuracyStats();
  const { data: statusData } = useTradingStatus();

  // Fetch predictions with filters
  const { data: historyData, isLoading: historyLoading } = usePredictionHistory(
    30,
    predictionsPage,
    predictionsPageSize,
    predSearch,
    predDirection,
    predShouldTrade,
    predResult
  );

  // Fetch trades with filters
  const { data: tradesData, isLoading: tradesLoading } = useTrades(
    30,
    tradesPage,
    tradesPageSize,
    tradeSearch,
    tradeStatus,
    tradeDirection
  );

  const predictions = historyData?.predictions || [];
  const trades = tradesData?.trades || [];
  const stats = tradesData?.stats;
  const predictionsPagination = historyData?.pagination;
  const tradesPagination = tradesData?.pagination;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-xl blur-xl opacity-20" />
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  AI Trading System
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 bg-up rounded-full animate-pulse" />
                    <span>Live</span>
                  </div>
                  <span>•</span>
                  <span>72-73% Accuracy</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Key Metrics - Top Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  title="Model Accuracy"
                  value={
                    accuracyLoading
                      ? "..."
                      : accuracyStats?.accuracy
                        ? `${(accuracyStats.accuracy * 100).toFixed(1)}%`
                        : "..."
                  }
                  subtitle={`${accuracyStats?.total_predictions || 0} predictions`}
                  icon={Target}
                  trend={
                    accuracyStats?.accuracy && accuracyStats.accuracy > 0.7
                      ? "up"
                      : "neutral"
                  }
                />
                <StatCard
                  title="Account Balance"
                  value={`$${(statusData?.balance || 10000).toLocaleString()}`}
                  subtitle={stats ? `${stats.roi.toFixed(1)}% ROI` : "Starting"}
                  icon={DollarSign}
                  trend={
                    stats && stats.total_pnl > 0
                      ? "up"
                      : stats && stats.total_pnl < 0
                        ? "down"
                        : "neutral"
                  }
                />
                <StatCard
                  title="Win Rate"
                  value={stats ? `${stats.win_rate.toFixed(1)}%` : "..."}
                  subtitle={
                    stats
                      ? `${stats.winning_trades}W / ${stats.losing_trades}L`
                      : "No trades"
                  }
                  icon={Award}
                  trend={stats && stats.win_rate > 50 ? "up" : "neutral"}
                />
                <StatCard
                  title="Sharpe Ratio"
                  value={
                    stats?.sharpe_ratio !== null &&
                    stats?.sharpe_ratio !== undefined
                      ? stats.sharpe_ratio.toFixed(2)
                      : "..."
                  }
                  subtitle="Risk-adjusted"
                  icon={TrendingUpDown}
                  trend={
                    stats?.sharpe_ratio && stats.sharpe_ratio > 2
                      ? "up"
                      : "neutral"
                  }
                />
              </div>

              {/* Performance Metrics - Compact Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {stats ? (
                  <>
                    {[
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
                            ? (
                                Math.abs(stats.avg_win) /
                                Math.abs(stats.avg_loss)
                              ).toFixed(2)
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
                        value: stats.max_drawdown
                          ? `${stats.max_drawdown.toFixed(2)}%`
                          : "N/A",
                        color: "text-down",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-card border border-border/50 rounded-lg p-3"
                      >
                        <p className="text-[10px] text-muted-foreground mb-1.5">
                          {item.label}
                        </p>
                        <p
                          className={cn(
                            "text-sm font-semibold font-mono",
                            item.color
                          )}
                        >
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div className="col-span-6 text-center py-8 bg-card border border-border/50 rounded-lg">
                    <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground">
                      No performance data
                    </p>
                  </div>
                )}
              </div>

              {/* System & Configuration - 3 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Model Configuration */}
                <div className="bg-card border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs font-semibold">Configuration</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Model", value: "Ensemble LGB+CAT+XGB" },
                      { label: "Training Period", value: "10.9 Years" },
                      { label: "Features", value: "50 Optimized" },
                      { label: "Min Confidence", value: "60%" },
                      { label: "Position Sizing", value: "Kelly 48%" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-1.5"
                      >
                        <span className="text-[10px] text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Data */}
                <div className="bg-card border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs font-semibold">Training Data</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Total Samples", value: "22,033" },
                      { label: "Date Range", value: "2015-2025" },
                      { label: "Duration", value: "10.9 Years" },
                      { label: "Data Quality", value: "80.2%" },
                      { label: "Tickers", value: "25 ETFs" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-1.5"
                      >
                        <span className="text-[10px] text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium font-mono">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-card border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs font-semibold">System Health</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Model Status",
                        value: "Operational",
                        status: "up",
                      },
                      { label: "Database", value: "Connected", status: "up" },
                      {
                        label: "Last Training",
                        value: accuracyStats?.last_updated
                          ? new Date(
                              accuracyStats.last_updated
                            ).toLocaleDateString()
                          : "N/A",
                        status: "neutral",
                      },
                      {
                        label: "Avg Confidence",
                        value: accuracyStats?.avg_confidence
                          ? `${(accuracyStats.avg_confidence * 100).toFixed(1)}%`
                          : "N/A",
                        status: "neutral",
                      },
                      {
                        label: "Total Trades",
                        value: stats?.total_trades || 0,
                        status: "neutral",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          {item.status === "up" && (
                            <div className="h-1.5 w-1.5 bg-up rounded-full" />
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Predictions Tab */}
          {activeTab === "predictions" && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-semibold mb-1">All Predictions</h2>
                <p className="text-sm text-muted-foreground">
                  {historyLoading
                    ? "Loading..."
                    : `${predictionsPagination?.total_items || 0} predictions`}
                </p>
              </div>

              {/* Filters */}
              <FilterBar
                search={predSearch}
                onSearchChange={(val) => {
                  setPredSearch(val);
                  setPredictionsPage(1);
                }}
                filters={[
                  {
                    label: "Direction",
                    value: predDirection,
                    onChange: (val) => {
                      setPredDirection(val);
                      setPredictionsPage(1);
                    },
                    options: [
                      { value: "all", label: "All" },
                      { value: "UP", label: "Up" },
                      { value: "DOWN", label: "Down" },
                    ],
                  },
                  {
                    label: "Signal",
                    value: predShouldTrade,
                    onChange: (val) => {
                      setPredShouldTrade(val);
                      setPredictionsPage(1);
                    },
                    options: [
                      { value: "all", label: "All" },
                      { value: "trade", label: "Trade Signal" },
                      { value: "no-trade", label: "No Trade" },
                    ],
                  },
                  {
                    label: "Result",
                    value: predResult,
                    onChange: (val) => {
                      setPredResult(val);
                      setPredictionsPage(1);
                    },
                    options: [
                      { value: "all", label: "All" },
                      { value: "correct", label: "Correct" },
                      { value: "wrong", label: "Wrong" },
                    ],
                  },
                ]}
                onClearAll={() => {
                  setPredSearch("");
                  setPredDirection("all");
                  setPredShouldTrade("all");
                  setPredResult("all");
                  setPredictionsPage(1);
                }}
              />

              {historyLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-0">
                  <PredictionsTable predictions={predictions} />
                  {predictionsPagination && (
                    <Pagination
                      currentPage={predictionsPagination.page}
                      totalPages={predictionsPagination.total_pages}
                      totalItems={predictionsPagination.total_items}
                      onPageChange={setPredictionsPage}
                      itemsPerPage={predictionsPagination.page_size}
                      onPageSizeChange={(newSize) => {
                        setPredictionsPageSize(newSize);
                        setPredictionsPage(1);
                      }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Trades Tab */}
          {activeTab === "trades" && (
            <motion.div
              key="trades"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-semibold mb-1">Trade History</h2>
                <p className="text-sm text-muted-foreground">
                  {tradesLoading
                    ? "Loading..."
                    : `${tradesPagination?.total_items || 0} trades`}
                </p>
              </div>

              {/* Filters */}
              <FilterBar
                search={tradeSearch}
                onSearchChange={(val) => {
                  setTradeSearch(val);
                  setTradesPage(1);
                }}
                filters={[
                  {
                    label: "Status",
                    value: tradeStatus,
                    onChange: (val) => {
                      setTradeStatus(val);
                      setTradesPage(1);
                    },
                    options: [
                      { value: "all", label: "All" },
                      { value: "closed", label: "Closed" },
                      { value: "open", label: "Open" },
                    ],
                  },
                  {
                    label: "Direction",
                    value: tradeDirection,
                    onChange: (val) => {
                      setTradeDirection(val);
                      setTradesPage(1);
                    },
                    options: [
                      { value: "all", label: "All" },
                      { value: "UP", label: "Up" },
                      { value: "DOWN", label: "Down" },
                    ],
                  },
                ]}
                onClearAll={() => {
                  setTradeSearch("");
                  setTradeStatus("all");
                  setTradeDirection("all");
                  setTradesPage(1);
                }}
              />

              {tradesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-0">
                  <TradesTable trades={trades} />
                  {tradesPagination && (
                    <Pagination
                      currentPage={tradesPagination.page}
                      totalPages={tradesPagination.total_pages}
                      totalItems={tradesPagination.total_items}
                      onPageChange={setTradesPage}
                      itemsPerPage={tradesPagination.page_size}
                      onPageSizeChange={(newSize) => {
                        setTradesPageSize(newSize);
                        setTradesPage(1);
                      }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ModelMonitorPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell alertCount={0} userEmail="user@example.com">
        <ModelDashboard />
      </AppShell>
    </QueryClientProvider>
  );
}
