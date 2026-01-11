"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import {
  X,
  TrendingUp,
  Target,
  ShieldAlert,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import type { TradingOpportunity } from "@/hooks/useTradingOpportunities";

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: TradingOpportunity;
}

interface AlpacaAccount {
  balance: number;
  buying_power: number;
  portfolio_value: number;
  equity: number;
  status: string;
  currency: string;
}

interface AlpacaPosition {
  symbol: string;
  qty: number;
  market_value: number;
  current_price: number;
  avg_entry_price: number;
  unrealized_pl: number;
  unrealized_plpc: number;
}

type OrderType = "market" | "limit" | "stop_limit";

export function TradingModal({
  isOpen,
  onClose,
  opportunity: opp,
}: TradingModalProps) {
  const { user } = useUser();
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [numShares, setNumShares] = useState(10);
  const [customEntryPrice, setCustomEntryPrice] = useState(
    opp.entry?.price || 0
  );
  const [stopLimitPrice, setStopLimitPrice] = useState(opp.entry?.price || 0);
  const [stopTriggerPrice, setStopTriggerPrice] = useState(
    (opp.entry?.price || 0) * 0.98
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted (client-side only for portal)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch account data
  const fetchAccountData = async () => {
    if (!user?.id) {
      setAccountError("User not authenticated");
      return;
    }

    setIsLoadingAccount(true);
    setAccountError(null);

    try {
      const response = await fetch("/api/broker/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Account API error:", response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Account API response:", data);

      // Backend returns flat object with equity, cash, buyingPower, positions, etc.
      setAccount({
        balance: data.cash || 0,
        buying_power: data.buyingPower || 0,
        portfolio_value: data.portfolioValue || 0,
        equity: data.equity || 0,
        status: data.status || "UNKNOWN",
        currency: "USD",
      });
      setPositions(data.positions || []);
    } catch (error: any) {
      console.error("Failed to fetch account:", error);
      setAccountError(error.message);
      // Fallback to default values
      setAccount({
        balance: 10000,
        buying_power: 10000,
        portfolio_value: 10000,
        equity: 10000,
        status: "ACTIVE",
        currency: "USD",
      });
    } finally {
      setIsLoadingAccount(false);
    }
  };

  // Calculate position metrics with safe defaults
  const entryPrice = customEntryPrice || opp.entry?.price || 0;
  const stopPrice = opp.stopLoss?.price || 0;
  const targetPrice = opp.target?.price || 0;
  const accountBalance = account?.buying_power || 10000;

  const shares = numShares;
  const totalCost = shares * entryPrice;
  const potentialProfit = shares * (targetPrice - entryPrice);
  const potentialLoss = shares * (entryPrice - stopPrice);
  const remainingBalance = accountBalance - totalCost;
  const portfolioAllocation = account
    ? (totalCost / account.portfolio_value) * 100
    : 0;

  // Calculate max shares based on account balance
  const maxShares = Math.floor(accountBalance / entryPrice);

  // Check if user already has position in this symbol
  const existingPosition = positions.find((p) => p.symbol === opp.symbol);

  // Reset state when modal opens and fetch account data
  useEffect(() => {
    if (isOpen) {
      setCustomEntryPrice(opp.entry?.price || 0);
      setStopLimitPrice(opp.entry?.price || 0);
      setStopTriggerPrice((opp.entry?.price || 0) * 0.98);
      setIsSuccess(false);
      setNumShares(10);
      fetchAccountData();

      // Prevent scrolling and interaction with background
      const originalOverflow = document.body.style.overflow;
      const originalPointerEvents = document.body.style.pointerEvents;

      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";

      // Add a class to disable all transitions and animations on the body
      document.body.classList.add("modal-open");

      // Add style to disable hover effects globally AND force all elements behind modal
      const style = document.createElement("style");
      style.id = "disable-hover-style";
      style.textContent = `
        .modal-open * {
          pointer-events: none !important;
        }
        .modal-open .modal-content,
        .modal-open .modal-content * {
          pointer-events: auto !important;
        }
        /* Force all iframes, embeds, and potentially high z-index elements behind modal */
        .modal-open iframe,
        .modal-open embed,
        .modal-open object,
        .modal-open .tradingview-widget-container,
        .modal-open .tradingview-widget-container__widget {
          z-index: 0 !important;
          position: relative !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        // Cleanup
        document.body.style.overflow = originalOverflow;
        document.body.style.pointerEvents = originalPointerEvents;
        document.body.classList.remove("modal-open");
        const styleEl = document.getElementById("disable-hover-style");
        if (styleEl) styleEl.remove();
      };
    }
  }, [isOpen, opp.entry]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Call your Alpaca API endpoint
      const response = await fetch("/api/trading/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: opp.symbol,
          side: "buy",
          qty: shares,
          type: orderType,
          limit_price:
            orderType === "limit"
              ? customEntryPrice
              : orderType === "stop_limit"
                ? stopLimitPrice
                : undefined,
          stop_price: orderType === "stop_limit" ? stopTriggerPrice : undefined,
          stop_loss: stopPrice,
          take_profit: targetPrice,
        }),
      });

      if (!response.ok) throw new Error("Trade execution failed");

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Trade failed:", error);
      alert("Failed to execute trade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-content">
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden bg-[#0a0f1a]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success State */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-3" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Trade Submitted!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {shares} shares of {opp.symbol}
                  </p>
                </motion.div>
              )}

              {/* Header */}
              <div className="relative border-b border-border bg-gradient-to-br from-primary/10 to-primary/5 p-4 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-background/80 transition-colors z-10"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-3 pr-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      Execute Trade
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl font-bold text-primary">
                        {opp.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                        {opp.setupType?.toUpperCase() || "SWING TRADE"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Win Rate
                    </div>
                    <div className="text-lg font-bold text-green-500">
                      {opp.winRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                {/* Order Type Selection */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">
                    Order Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["market", "limit", "stop_limit"] as OrderType[]).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => setOrderType(type)}
                          className={`px-3 py-2 rounded-lg border transition-all font-medium text-xs ${
                            orderType === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-border/80 text-muted-foreground"
                          }`}
                        >
                          {type === "market" && "Market"}
                          {type === "limit" && "Limit"}
                          {type === "stop_limit" && "Stop Limit"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Stop Limit Inputs - only show when stop_limit is selected */}
                {orderType === "stop_limit" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-2 block">
                        Stop Price (Trigger)
                      </label>
                      <input
                        type="number"
                        value={stopTriggerPrice.toFixed(2)}
                        onChange={(e) =>
                          setStopTriggerPrice(Number(e.target.value))
                        }
                        step="0.01"
                        className="w-full text-sm font-bold text-foreground bg-background rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Order triggers at this price
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-2 block">
                        Limit Price
                      </label>
                      <input
                        type="number"
                        value={stopLimitPrice.toFixed(2)}
                        onChange={(e) =>
                          setStopLimitPrice(Number(e.target.value))
                        }
                        step="0.01"
                        className="w-full text-sm font-bold text-foreground bg-background rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Max price to pay
                      </p>
                    </div>
                  </div>
                )}

                {/* Price Levels */}
                <div className="grid grid-cols-3 gap-3">
                  <PriceBox
                    icon={TrendingUp}
                    label="Entry"
                    price={entryPrice}
                    color="text-blue-500"
                    editable={orderType === "limit"}
                    onEdit={setCustomEntryPrice}
                  />
                  <PriceBox
                    icon={Target}
                    label="Target"
                    price={targetPrice}
                    percentage={opp.target?.percentage || 0}
                    color="text-green-500"
                  />
                  <PriceBox
                    icon={ShieldAlert}
                    label="Stop Loss"
                    price={stopPrice}
                    percentage={opp.stopLoss?.percentage || 0}
                    color="text-red-500"
                  />
                </div>

                {/* Position Size Control */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
                    <span>Number of Shares</span>
                    <span className="text-primary">{numShares} shares</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={maxShares || 100}
                    step="1"
                    value={numShares}
                    onChange={(e) => setNumShares(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 share</span>
                    <span>{maxShares || 100} shares</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    Total: ${totalCost.toFixed(2)}
                  </div>
                </div>

                {/* Position Summary */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Position Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricRow label="Shares" value={shares.toString()} />
                    <MetricRow
                      label="Total Cost"
                      value={`$${totalCost.toFixed(2)}`}
                    />
                    <MetricRow
                      label="Potential Profit"
                      value={`+$${potentialProfit.toFixed(2)}`}
                      valueColor="text-green-500"
                    />
                    <MetricRow
                      label="Potential Loss"
                      value={`-$${potentialLoss.toFixed(2)}`}
                      valueColor="text-red-500"
                    />
                    <MetricRow
                      label="R:R Ratio"
                      value={`${(opp.riskReward || 0).toFixed(2)}:1`}
                    />
                    <MetricRow
                      label="Allocation"
                      value={`${portfolioAllocation.toFixed(1)}%`}
                    />
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      Account Balance
                      {accountError && (
                        <span className="text-[10px] text-yellow-500">
                          (Using fallback)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={fetchAccountData}
                      disabled={isLoadingAccount}
                      className="p-1 rounded hover:bg-background/50 transition-colors disabled:opacity-50"
                      title="Refresh account data"
                    >
                      <RefreshCw
                        className={`w-3 h-3 text-muted-foreground ${
                          isLoadingAccount ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {accountError && (
                    <div className="text-[10px] text-yellow-600 dark:text-yellow-400 mb-2">
                      Error: {accountError}. Check console for details.
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      Current
                    </span>
                    <span className="text-base font-bold text-foreground">
                      ${accountBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">After Trade</span>
                    <span
                      className={`font-semibold ${
                        remainingBalance < 0
                          ? "text-red-500"
                          : "text-foreground"
                      }`}
                    >
                      ${remainingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Risk Warning */}
                {portfolioAllocation > 20 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">
                      <span className="font-semibold">High Risk:</span> This
                      trade represents {portfolioAllocation.toFixed(1)}% of your
                      portfolio. Consider reducing position size.
                    </div>
                  </div>
                )}

                {/* Trade Reasoning */}
                <div className="border border-border rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    Trade Thesis
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {opp.reasoning}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Timeframe:{" "}
                      <span className="text-foreground font-medium">
                        {opp.timeframe}
                      </span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      Confidence:{" "}
                      <span className="text-foreground font-medium">
                        {opp.confidence || 0}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4 bg-muted/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-all font-medium text-sm text-foreground disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || remainingBalance < 0}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all font-semibold text-sm text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Activity className="w-4 h-4" />
                        </motion.div>
                        Executing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Execute Trade
                      </>
                    )}
                  </button>
                </div>
                {remainingBalance < 0 && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Insufficient funds for this trade
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

// Helper Components
interface PriceBoxProps {
  icon: any;
  label: string;
  price: number;
  percentage?: number;
  color: string;
  editable?: boolean;
  onEdit?: (price: number) => void;
}

function PriceBox({
  icon: Icon,
  label,
  price,
  percentage,
  color,
  editable,
  onEdit,
}: PriceBoxProps) {
  const safePrice = price || 0;
  const safePercentage = percentage || 0;

  return (
    <div className="bg-muted/50 rounded-lg p-2.5 border border-border">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      {editable && onEdit ? (
        <input
          type="number"
          value={safePrice.toFixed(2)}
          onChange={(e) => onEdit(Number(e.target.value))}
          step="0.01"
          className="w-full text-base font-bold text-foreground bg-background rounded px-2 py-1 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <div className="text-base font-bold text-foreground">
          ${safePrice.toFixed(2)}
        </div>
      )}
      {percentage !== undefined && (
        <div className={`text-xs font-medium ${color} mt-0.5`}>
          {safePercentage > 0 ? "+" : ""}
          {safePercentage.toFixed(2)}%
        </div>
      )}
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueColor = "text-foreground",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}
