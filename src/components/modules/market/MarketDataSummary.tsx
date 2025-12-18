"use client";

import { type FC, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Gauge,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from "lucide-react";
import { GlassCard } from "@/components/design-system/atoms/GlassCard";
import { Badge } from "@/components/design-system/atoms/Badge";
import { IndexData, IndexAnalysis } from "@/resources/mock-data/indexes";
import { cn } from "@/lib/utils";

interface MarketDataSummaryProps {
  indexes: IndexData[];
  analysis: Record<string, IndexAnalysis>;
}

// Format large numbers (e.g., 5234000000 -> "5.23B")
function formatVolume(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toString();
}

// RSI interpretation
function getRSIStatus(rsi: number): { label: string; color: string; description: string } {
  if (rsi >= 70) return { label: "Overbought", color: "text-down", description: "Potential reversal down" };
  if (rsi <= 30) return { label: "Oversold", color: "text-up", description: "Potential reversal up" };
  if (rsi >= 60) return { label: "Strong", color: "text-up", description: "Bullish momentum" };
  if (rsi <= 40) return { label: "Weak", color: "text-down", description: "Bearish momentum" };
  return { label: "Neutral", color: "text-muted-foreground", description: "Balanced momentum" };
}

// Single metric card
const MetricCard: FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  highlight?: boolean;
  tooltip?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, highlight, tooltip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-card rounded-lg border p-4 transition-all",
        highlight ? "border-primary/50 bg-primary/5" : "border-border"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend === "up" ? "text-up" : trend === "down" ? "text-down" : "text-muted-foreground"
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
          </div>
        )}
        {tooltip && (
          <div className="group relative">
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            <div className="absolute right-0 top-5 w-48 p-2 bg-popover border border-border rounded-md text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold font-mono">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
      {subtitle && <p className="text-2xs text-muted-foreground mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// RSI Gauge visualization
const RSIGauge: FC<{ value: number }> = ({ value }) => {
  const status = getRSIStatus(value);
  const rotation = (value / 100) * 180 - 90; // Map 0-100 to -90 to 90 degrees

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-12 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <defs>
              <linearGradient id="rsiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="30%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#6b7280" />
                <stop offset="70%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="url(#rsiGradient)"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-10 bg-foreground origin-bottom transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground" />
      </div>
      <div className="text-center mt-2">
        <p className="text-lg font-bold font-mono">{value.toFixed(1)}</p>
        <p className={cn("text-xs font-medium", status.color)}>{status.label}</p>
      </div>
    </div>
  );
};

// MACD indicator display
const MACDIndicator: FC<{ macd: IndexAnalysis["macd"]; symbol: string }> = ({ macd }) => {
  const isBullish = macd.trend === "bullish";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">MACD Line</span>
        <span className={cn("text-sm font-mono font-medium", isBullish ? "text-up" : "text-down")}>
          {macd.value.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Signal Line</span>
        <span className="text-sm font-mono">{macd.signal.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Histogram</span>
        <div className="flex items-center gap-1">
          <div
            className={cn(
              "h-3 rounded-sm",
              macd.histogram > 0 ? "bg-up" : "bg-down"
            )}
            style={{ width: `${Math.min(Math.abs(macd.histogram) * 2, 40)}px` }}
          />
          <span className="text-sm font-mono">{macd.histogram.toFixed(2)}</span>
        </div>
      </div>
      <div className="pt-2 border-t border-border">
        <Badge variant={isBullish ? "bullish" : "bearish"} className="text-2xs">
          {isBullish ? "Bullish Crossover" : "Bearish Crossover"}
        </Badge>
      </div>
    </div>
  );
};

export const MarketDataSummary: FC<MarketDataSummaryProps> = ({ indexes, analysis }) => {
  // Aggregate market statistics
  const marketStats = useMemo(() => {
    const totalVolume = indexes.reduce((sum, idx) => sum + idx.volume, 0);
    const avgVolume = Object.values(analysis).reduce(
      (sum, a) => sum + a.volume.average,
      0
    );
    const volumeRatio = totalVolume / avgVolume;

    const bullishCount = Object.values(analysis).filter((a) => a.trend === "bullish").length;
    const bearishCount = Object.values(analysis).filter((a) => a.trend === "bearish").length;

    const avgRSI =
      Object.values(analysis).reduce((sum, a) => sum + a.rsi, 0) / Object.values(analysis).length;

    const volumeAnomalies = Object.values(analysis).filter((a) => a.volume.anomaly).length;

    return {
      totalVolume,
      avgVolume,
      volumeRatio,
      bullishCount,
      bearishCount,
      neutralCount: indexes.length - bullishCount - bearishCount,
      avgRSI,
      volumeAnomalies,
    };
  }, [indexes, analysis]);

  // Get primary index analysis (S&P 500)
  const spAnalysis = analysis["^GSPC"];

  return (
    <GlassCard className="p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Market Data Summary
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time volume and technical indicators across major indexes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {marketStats.volumeAnomalies > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {marketStats.volumeAnomalies} Volume Anomaly
            </Badge>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Volume"
          value={formatVolume(marketStats.totalVolume)}
          subtitle={`${(marketStats.volumeRatio * 100).toFixed(0)}% of average`}
          icon={BarChart3}
          trend={marketStats.volumeRatio > 1.1 ? "up" : marketStats.volumeRatio < 0.9 ? "down" : "neutral"}
          tooltip="Combined trading volume across all major indexes"
        />
        <MetricCard
          title="Market Trend"
          value={`${marketStats.bullishCount}/${indexes.length}`}
          subtitle="Indexes bullish"
          icon={TrendingUp}
          trend={marketStats.bullishCount > marketStats.bearishCount ? "up" : "down"}
          highlight={marketStats.bullishCount >= 3}
          tooltip="Number of indexes showing bullish trend signals"
        />
        <MetricCard
          title="Avg RSI"
          value={marketStats.avgRSI.toFixed(1)}
          subtitle={getRSIStatus(marketStats.avgRSI).label}
          icon={Gauge}
          trend={marketStats.avgRSI > 60 ? "up" : marketStats.avgRSI < 40 ? "down" : "neutral"}
          tooltip="Average Relative Strength Index across indexes (30-70 is neutral)"
        />
        <MetricCard
          title="Volume vs Avg"
          value={`${(marketStats.volumeRatio * 100).toFixed(0)}%`}
          subtitle={
            marketStats.volumeRatio > 1.2
              ? "High activity"
              : marketStats.volumeRatio < 0.8
              ? "Low activity"
              : "Normal"
          }
          icon={Activity}
          trend={marketStats.volumeRatio > 1 ? "up" : "down"}
          tooltip="Current volume compared to historical average"
        />
      </div>

      {/* Technical Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RSI Gauges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border border-border p-4"
        >
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            RSI Levels
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(analysis)
              .slice(0, 4)
              .map(([symbol, data]) => {
                const index = indexes.find((i) => i.symbol === symbol);
                return (
                  <div key={symbol} className="text-center">
                    <RSIGauge value={data.rsi} />
                    <p className="text-2xs text-muted-foreground mt-1 truncate">
                      {index?.name.split(" ")[0] || symbol}
                    </p>
                  </div>
                );
              })}
          </div>
        </motion.div>

        {/* MACD Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border border-border p-4"
        >
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            S&P 500 MACD
          </h3>
          {spAnalysis && <MACDIndicator macd={spAnalysis.macd} symbol="^GSPC" />}
        </motion.div>

        {/* Support & Resistance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg border border-border p-4"
        >
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            S&P 500 Levels
          </h3>
          {spAnalysis && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Resistance</p>
                <div className="flex gap-2">
                  {spAnalysis.resistance.map((level, i) => (
                    <span
                      key={i}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-mono",
                        i === 0
                          ? "bg-down/20 text-down font-medium"
                          : "bg-surface-2 text-muted-foreground"
                      )}
                    >
                      {level.toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="py-2 border-y border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Current</span>
                  <span className="text-sm font-bold font-mono">
                    {indexes.find((i) => i.symbol === "^GSPC")?.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Support</p>
                <div className="flex gap-2">
                  {spAnalysis.support.map((level, i) => (
                    <span
                      key={i}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-mono",
                        i === 0
                          ? "bg-up/20 text-up font-medium"
                          : "bg-surface-2 text-muted-foreground"
                      )}
                    >
                      {level.toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Volume Breakdown by Index */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 pt-6 border-t border-border"
      >
        <h3 className="font-semibold text-sm mb-3">Volume by Index</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {indexes.map((index) => {
            const indexAnalysis = analysis[index.symbol];
            const volumeRatio = indexAnalysis
              ? index.volume / indexAnalysis.volume.average
              : 1;
            const isAboveAvg = volumeRatio > 1;

            return (
              <div
                key={index.symbol}
                className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"
              >
                <div>
                  <p className="text-xs text-muted-foreground">{index.name.split(" ")[0]}</p>
                  <p className="font-mono font-medium">{formatVolume(index.volume)}</p>
                </div>
                <div
                  className={cn(
                    "text-xs font-medium",
                    isAboveAvg ? "text-up" : "text-down"
                  )}
                >
                  {isAboveAvg ? "+" : ""}
                  {((volumeRatio - 1) * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </GlassCard>
  );
};

