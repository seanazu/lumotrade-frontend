"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/design-system/atoms/Button";
import { GlassCard } from "@/components/design-system/atoms/GlassCard";
import { cn } from "@/lib/utils";
import { useModelHealth } from "@/hooks/useMLBackend";

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
      className="bg-surface-2 rounded-lg p-4 border border-border"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
      {subtitle && (
        <p className="text-2xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}

export function TradingStatusPanel() {
  const { data, isLoading } = useModelHealth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const health = data?.health;
  const account = data?.account;

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Live Trading Performance
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Current Balance"
            value={`$${(account?.balance || 10000).toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Total P&L"
            value={`$${(account?.total_pnl || 0).toFixed(2)}`}
            subtitle={`${((account?.total_pnl_pct || 0) * 100).toFixed(2)}%`}
            icon={TrendingUp}
            trend={(account?.total_pnl || 0) > 0 ? "up" : "down"}
          />
          <StatCard
            title="Model Accuracy"
            value={
              health?.accuracy
                ? `${(health.accuracy * 100).toFixed(1)}%`
                : "N/A"
            }
            icon={Target}
          />
          <StatCard
            title="Sharpe Ratio"
            value={health?.sharpe_ratio?.toFixed(2) || "N/A"}
            icon={Activity}
          />
        </div>
      </div>

      {/* Model Health Status */}
      {health && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            {health.status === "healthy" ? (
              <CheckCircle className="h-5 w-5 text-up" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning" />
            )}
            Model Health Status
          </h3>

          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                health.status === "healthy"
                  ? "bg-up/10 text-up"
                  : health.status === "degraded"
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive"
              )}
            >
              {health.status.toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground">
              Last checked: {new Date(health.check_date).toLocaleDateString()}
            </span>
          </div>

          {health.alerts && health.alerts.length > 0 && (
            <div className="space-y-2">
              {health.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-warning">
                      {alert.severity.toUpperCase()}
                    </div>
                    <div className="text-muted-foreground">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!health.alerts || health.alerts.length === 0) && (
            <div className="text-sm text-muted-foreground">
              All metrics within normal range ✓
            </div>
          )}
        </div>
      )}

      {/* Strategy Details */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-lg mb-4">Trading Strategy</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2 text-primary">
              Position Sizing
            </h4>
            <p className="text-sm text-muted-foreground">
              Risk-based: 5-20% of capital based on model confidence (60-90%)
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2 text-primary">
              Stop Loss / Take Profit
            </h4>
            <p className="text-sm text-muted-foreground">
              ATR-based dynamic stops: 2× ATR stop loss, 3× ATR take profit
              (1.5:1 R:R)
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2 text-primary">
              Trade Selection
            </h4>
            <p className="text-sm text-muted-foreground">
              Only trade when confidence ≥60% and prediction spread ≥1.5%
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2 text-primary">Execution</h4>
            <p className="text-sm text-muted-foreground">
              Daily at 9:29am ET, enter at market open, exit at market close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
