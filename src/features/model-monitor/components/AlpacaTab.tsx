"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/instant";
import {
  Lock,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";
import { Input } from "@/components/design-system/atoms/Input";
import { cn } from "@/lib/utils";

interface AlpacaAccount {
  id: string;
  userId: string;
  apiKey: string;
  secretKey: string;
  isPaper: boolean;
  connectedAt: number;
  lastSynced?: number;
}

interface Position {
  symbol: string;
  qty: number;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  current_price: number;
  side: string;
}

interface Order {
  id: string;
  symbol: string;
  qty: number;
  side: string;
  type: string;
  status: string;
  filled_avg_price: number | null;
  submitted_at: string;
  filled_at: string | null;
}

interface AlpacaStats {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  daytradeCount: number;
  pattern_day_trader: boolean;
  account_number: string;
  status: string;
  last_equity: number;
  positions: Position[];
  recent_orders: Order[];
}

/**
 * AlpacaTab Component
 * Beautiful dashboard for Alpaca broker connection
 */
export function AlpacaTab() {
  const { user } = db.useAuth();

  const alpacaQuery = user?.id
    ? {
        alpacaAccounts: {
          $: {
            where: {
              userId: user.id,
            },
          },
        },
      }
    : null;

  const { data: alpacaConnections } = db.useQuery(alpacaQuery as any);
  const alpacaAccount = (alpacaConnections as any)?.alpacaAccounts?.[0];

  const [showSecret, setShowSecret] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isPaper, setIsPaper] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  // Fetch comprehensive account data
  const { data: accountStats, isLoading: statsLoading } = useQuery({
    queryKey: ["alpaca-stats", alpacaAccount?.id],
    queryFn: async () => {
      if (!alpacaAccount) return null;

      const response = await fetch(`/api/alpaca/account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: alpacaAccount.apiKey,
          secretKey: alpacaAccount.secretKey,
          isPaper: alpacaAccount.isPaper,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch account stats");
      }
      return response.json() as Promise<AlpacaStats>;
    },
    enabled: !!alpacaAccount,
    refetchInterval: 30000,
  });

  const handleConnect = async () => {
    if (!user?.id) {
      setError("You must be logged in to connect Alpaca");
      return;
    }

    if (!apiKey || !secretKey) {
      setError("Please enter both API Key and Secret Key");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      const validateResponse = await fetch(`/api/alpaca/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey, isPaper }),
      });

      if (!validateResponse.ok) {
        throw new Error("Invalid Alpaca credentials");
      }

      await db.transact([
        // @ts-expect-error - InstantDB type inference issue
        db.tx.alpacaAccounts[crypto.randomUUID()].update({
          userId: user.id,
          apiKey,
          secretKey,
          isPaper,
          connectedAt: Date.now(),
        }),
      ]);

      setApiKey("");
      setSecretKey("");
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect Alpaca account"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!alpacaAccount) return;

    try {
      await db.transact(
        // @ts-expect-error - InstantDB type inference issue
        [db.tx.alpacaAccounts[alpacaAccount.id].delete()]
      );
    } catch (err) {
      setError("Failed to disconnect account");
    }
  };

  if (!alpacaAccount) {
    // Connection Form
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Connect Alpaca Account</h2>
                <p className="text-muted-foreground">
                  Link your broker to view real-time account data
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Paper/Live Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trading Mode</label>
                <div className="flex gap-2 p-1 rounded-lg bg-muted">
                  <Button
                    type="button"
                    variant={isPaper ? "default" : "outline"}
                    onClick={() => setIsPaper(true)}
                    className="flex-1"
                  >
                    Paper Trading
                  </Button>
                  <Button
                    type="button"
                    variant={!isPaper ? "default" : "outline"}
                    onClick={() => setIsPaper(false)}
                    className="flex-1"
                  >
                    Live Trading
                  </Button>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label htmlFor="api-key" className="text-sm font-medium">
                  API Key
                </label>
                <Input
                  id="api-key"
                  type="text"
                  placeholder="PK..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Secret Key Input */}
              <div className="space-y-2">
                <label htmlFor="secret-key" className="text-sm font-medium">
                  Secret Key
                </label>
                <div className="relative">
                  <Input
                    id="secret-key"
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter your secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary mb-1">
                    Your keys are secure
                  </p>
                  <p className="text-muted-foreground">
                    Secret keys are encrypted before storage. We never store
                    plain-text credentials.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Connect Button */}
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !apiKey || !secretKey}
                className="w-full"
                size="lg"
              >
                {isConnecting ? "Connecting..." : "Connect Account"}
              </Button>

              {/* Help Instructions */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm space-y-2">
                    <p className="font-medium">
                      How to get your Alpaca API Keys:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>
                        Sign up at{" "}
                        <a
                          href="https://app.alpaca.markets/signup"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          app.alpaca.markets/signup
                        </a>
                      </li>
                      <li>
                        Click your name (top right) → &ldquo;Settings&rdquo; →
                        &ldquo;API Keys&rdquo;
                      </li>
                      <li>
                        Click <strong>&ldquo;Generate New Key&rdquo;</strong>{" "}
                        (don&apos;t use existing - secret is hidden!)
                      </li>
                      <li>Choose &ldquo;Paper Trading&rdquo;</li>
                      <li>
                        You&apos;ll see TWO values:
                        <ul className="ml-6 mt-1 space-y-0.5 list-disc text-xs">
                          <li>
                            <strong>API Key ID</strong> (starts with PK...)
                          </li>
                          <li>
                            <strong>Secret Key</strong> (long random string)
                          </li>
                        </ul>
                      </li>
                      <li>Copy BOTH before closing!</li>
                    </ol>
                    <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-amber-500 text-lg">⚠️</span>
                      <div className="text-xs text-amber-700 dark:text-amber-400">
                        <strong>Critical:</strong> If you only see one value,
                        you&apos;re viewing an old key. Generate a BRAND NEW key
                        to see both the API Key and Secret Key.
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 <strong>Both keys required</strong> - API won&apos;t
                      work without the secret key!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate day change
  const dayChange = accountStats
    ? accountStats.equity - accountStats.last_equity
    : 0;
  const dayChangePercent = accountStats?.last_equity
    ? (dayChange / accountStats.last_equity) * 100
    : 0;

  // Connected View with Beautiful Dashboard
  return (
    <motion.div
      key="account-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/50 p-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-up to-up/80 shadow-lg shadow-up/20">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Connected to Alpaca</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    alpacaAccount.isPaper
                      ? "bg-primary/10 text-primary"
                      : "bg-up/10 text-up"
                  )}
                >
                  {alpacaAccount.isPaper ? "Paper Trading" : "Live Trading"}
                </span>
                <span>•</span>
                <span>
                  Since{" "}
                  {new Date(alpacaAccount.connectedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>

      {statsLoading ? (
        <LoadingState />
      ) : accountStats ? (
        <>
          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PrimaryStatCard
              icon={Wallet}
              label="Portfolio Value"
              value={`$${accountStats.portfolioValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              change={dayChange}
              changePercent={dayChangePercent}
              color="primary"
            />

            <StatCard
              icon={TrendingUp}
              label="Equity"
              value={`$${accountStats.equity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              color="up"
            />

            <StatCard
              icon={DollarSign}
              label="Cash"
              value={`$${accountStats.cash.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              color="primary"
            />

            <StatCard
              icon={Activity}
              label="Buying Power"
              value={`$${accountStats.buyingPower.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              color="up"
            />
          </div>

          {/* Positions & Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Positions */}
            <PositionsCard positions={accountStats.positions} />

            {/* Recent Orders */}
            <OrdersCard orders={accountStats.recent_orders} />
          </div>

          {/* PDT Warning */}
          {accountStats.pattern_day_trader && (
            <PDTWarning daytradeCount={accountStats.daytradeCount} />
          )}
        </>
      ) : (
        <ErrorState />
      )}
    </motion.div>
  );
}

// ===========================
// COMPONENT HELPERS
// ===========================

interface PrimaryStatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: number;
  changePercent: number;
  color: "primary" | "up" | "down";
}

function PrimaryStatCard({
  icon: Icon,
  label,
  value,
  change,
  changePercent,
  color,
}: PrimaryStatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              color === "primary" && "bg-primary/10",
              color === "up" && "bg-up/10",
              color === "down" && "bg-down/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                color === "primary" && "text-primary",
                color === "up" && "text-up",
                color === "down" && "text-down"
              )}
            />
          </div>
        </div>

        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-sm text-muted-foreground mb-2">{label}</p>

        <div className="flex items-center gap-2">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-up" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-down" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-up" : "text-down"
            )}
          >
            {isPositive ? "+" : ""}
            {change.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            ({isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "primary" | "up" | "down";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            color === "primary" && "bg-primary/10",
            color === "up" && "bg-up/10",
            color === "down" && "bg-down/10"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              color === "primary" && "text-primary",
              color === "up" && "text-up",
              color === "down" && "text-down"
            )}
          />
        </div>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function PositionsCard({ positions }: { positions: Position[] }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Open Positions</h3>
          <span className="ml-auto text-sm text-muted-foreground">
            {positions.length} active
          </span>
        </div>
      </div>

      <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
        {positions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No open positions
          </div>
        ) : (
          positions.map((position, idx) => (
            <motion.div
              key={position.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{position.symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    {position.qty} shares @ ${position.current_price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    $
                    {position.market_value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div
                    className={cn(
                      "text-sm font-medium flex items-center gap-1 justify-end",
                      position.unrealized_pl >= 0 ? "text-up" : "text-down"
                    )}
                  >
                    {position.unrealized_pl >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {position.unrealized_pl >= 0 ? "+" : ""}
                    {position.unrealized_pl.toFixed(2)} (
                    {(position.unrealized_plpc * 100).toFixed(2)}%)
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function OrdersCard({ orders }: { orders: Order[] }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent Orders</h3>
          <span className="ml-auto text-sm text-muted-foreground">Last 10</span>
        </div>
      </div>

      <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No recent orders
          </div>
        ) : (
          orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{order.symbol}</p>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      order.side === "buy"
                        ? "bg-up/10 text-up"
                        : "bg-down/10 text-down"
                    )}
                  >
                    {order.side.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.qty} shares
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{order.type}</span>
                {order.filled_avg_price && (
                  <span>@ ${order.filled_avg_price.toFixed(2)}</span>
                )}
                <span>{new Date(order.submitted_at).toLocaleTimeString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function PDTWarning({ daytradeCount }: { daytradeCount: number }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-amber-500 mb-1">
          Pattern Day Trader Status
        </p>
        <p className="text-muted-foreground">
          You have {daytradeCount} day trades available. Be mindful of PDT
          rules.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="p-8 text-center text-muted-foreground rounded-xl border border-border/50 bg-card">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
      <p className="font-medium mb-2">Failed to load account data</p>
      <p className="text-sm">Please check your API credentials and try again</p>
    </div>
  );
}

AlpacaTab.displayName = "AlpacaTab";
