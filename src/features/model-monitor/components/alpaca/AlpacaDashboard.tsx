"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  History,
  Briefcase,
  PowerOff,
  RefreshCw,
  Zap,
  Power,
  Check as CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

import { useUser } from "@/contexts/UserContext";
import { useAlpaca } from "@/hooks/useAlpaca";
import { Card } from "@/components/design-system/atoms/Card";
import { Button } from "@/components/design-system/atoms/Button";
import { Badge } from "@/components/design-system/atoms/Badge";
import { Skeleton } from "@/components/design-system/atoms/Skeleton";
import { cn } from "@/lib/utils";

// Helper to format currency
const formatCurrency = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};

// Helper to format percentage
const formatPercent = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num); // Ensure this is decimal (0.05) not (5) if passing raw
};

export function AlpacaDashboard() {
  const { user } = useUser();
  const {
    account,
    positions,
    orders,
    isLoadingAccount,
    isLoadingPositions,
    isLoadingOrders,
    disconnect,
    isDisconnecting,
  } = useAlpaca(user?.id || "");

  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [isTogglingAutoTrading, setIsTogglingAutoTrading] = useState(false);
  const [isLoadingAutoTrading, setIsLoadingAutoTrading] = useState(true);

  // Fetch auto-trading status on mount
  useEffect(() => {
    if (!user?.id) return;

    fetch(`/api/broker/auto-trading?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setAutoTradingEnabled(data.enabled || false);
        setIsLoadingAutoTrading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch auto-trading status:", err);
        setIsLoadingAutoTrading(false);
      });
  }, [user?.id]);

  const handleToggleAutoTrading = async () => {
    if (!user?.id) return;

    setIsTogglingAutoTrading(true);
    try {
      const res = await fetch("/api/broker/auto-trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          enabled: !autoTradingEnabled,
        }),
      });

      if (!res.ok) throw new Error("Failed to toggle auto-trading");

      setAutoTradingEnabled(!autoTradingEnabled);
    } catch (err) {
      console.error("Auto-trading toggle error:", err);
      alert("Failed to toggle auto-trading");
    } finally {
      setIsTogglingAutoTrading(false);
    }
  };

  // Calculate daily P&L from equity - last_equity
  const dailyPnL = useMemo(() => {
    if (!account) return 0;
    return account.equity - account.last_equity;
  }, [account]);

  const dailyPnLPct = useMemo(() => {
    if (!account) return 0;
    if (account.last_equity === 0) return 0;
    return dailyPnL / account.last_equity;
  }, [account, dailyPnL]);

  if (isLoadingAccount) {
    return <DashboardSkeleton />;
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Failed to load account data</h3>
        <p className="mb-4">Your API keys may be invalid or expired.</p>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await disconnect();
              window.location.reload();
            } catch (err) {
              console.error("Disconnect failed:", err);
            }
          }}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect & Reconnect"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Account Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Equity
            </h3>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {formatCurrency(account.equity)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                dailyPnL >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {dailyPnL >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatCurrency(dailyPnL)} ({formatPercent(dailyPnLPct)})
            </span>
            <span className="text-muted-foreground">Today</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Buying Power
            </h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {formatCurrency(account.buyingPower)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Cash: {formatCurrency(account.cash)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Day Trades
            </h3>
            <ActivityIcon count={account.daytradeCount} />
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {account.daytradeCount} / 3
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            {account.pattern_day_trader ? (
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                PDT Flagged
              </span>
            ) : (
              <span className="text-green-500 flex items-center gap-1">
                <CheckIcon />
                Good Standing
              </span>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Account Status
            </h3>
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                account.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"
              )}
            />
          </div>
          <div className="text-lg font-bold tracking-tight capitalize">
            {account.status}
          </div>
          <div className="mt-auto pt-2">
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2 opacity-80 hover:opacity-100"
              onClick={() => disconnect()}
              disabled={isDisconnecting}
            >
              <PowerOff className="h-3 w-3" />
              Disconnect
            </Button>
          </div>
        </Card>
      </div>

      {/* Auto-Trading Toggle */}
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Automated Trading</h3>
                <p className="text-sm text-muted-foreground">
                  Execute model predictions automatically on your Alpaca account
                </p>
              </div>
            </div>
            <div className="pl-13 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                <span>
                  This will execute real trades based on AI model decisions
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                <span>Trades are executed when model confidence is high</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              variant={autoTradingEnabled ? "destructive" : "default"}
              size="lg"
              className="gap-2"
              onClick={handleToggleAutoTrading}
              disabled={isTogglingAutoTrading}
            >
              <Power className="h-4 w-4" />
              {isTogglingAutoTrading
                ? "Updating..."
                : autoTradingEnabled
                  ? "Disable Auto-Trading"
                  : "Enable Auto-Trading"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Currently:{" "}
              <strong
                className={
                  autoTradingEnabled ? "text-green-500" : "text-destructive"
                }
              >
                {autoTradingEnabled ? "Enabled" : "Disabled"}
              </strong>
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Positions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Active Positions
            </h2>
            <Badge variant="outline" className="font-mono">
              {positions.length} Open
            </Badge>
          </div>

          <Card className="overflow-hidden border-border/50">
            {isLoadingPositions ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : positions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No active positions found.</p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-medium">
                    <tr>
                      <th className="px-6 py-3">Asset</th>
                      <th className="px-6 py-3 text-right">Qty</th>
                      <th className="px-6 py-3 text-right">Avg Price</th>
                      <th className="px-6 py-3 text-right">Market Val</th>
                      <th className="px-6 py-3 text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {positions.map((position, idx) => (
                      <tr
                        key={`${position.symbol}-${idx}`}
                        className="bg-background hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">
                          {position.symbol}
                          <span className="block text-xs text-muted-foreground font-normal">
                            {position.side}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">{position.qty}</td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(position.cost_basis / position.qty)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(position.market_value)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className={cn(
                              "font-medium",
                              position.unrealized_pl >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            )}
                          >
                            {formatCurrency(position.unrealized_pl)}
                            <span className="block text-xs opacity-80">
                              {formatPercent(position.unrealized_plpc)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Orders
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <Card className="overflow-hidden border-border/50 max-h-[600px] overflow-y-auto">
            {isLoadingOrders ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No recent orders.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {orders.slice(0, 10).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{order.symbol}</span>
                      <Badge
                        variant={
                          order.status === "filled"
                            ? "default"
                            : order.status === "canceled" ||
                                order.status === "rejected"
                              ? "warning"
                              : "neutral"
                        }
                        className="text-[10px] px-1.5 py-0 h-5"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="uppercase">
                        {order.side} • {order.type}
                      </span>
                      <span>
                        {format(new Date(order.submitted_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        {order.filled_qty} / {order.qty} shares
                      </span>
                      <span className="font-medium text-foreground">
                        {order.filled_avg_price
                          ? formatCurrency(order.filled_avg_price)
                          : "Market"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ count }: { count: number }) {
  if (count >= 3) return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (count >= 2) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <TrendingUp className="h-4 w-4 text-green-500" />;
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
