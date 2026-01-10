"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import type { TradingOpportunity } from "@/hooks/useTradingOpportunities";

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: TradingOpportunity;
  accountBalance?: number;
}

type OrderType = "market" | "limit" | "stop_limit";

export function TradingModal({
  isOpen,
  onClose,
  opportunity: opp,
  accountBalance = 10000,
}: TradingModalProps) {
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [positionSize, setPositionSize] = useState(500);
  const [customEntryPrice, setCustomEntryPrice] = useState(opp.entry?.price || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate position metrics with safe defaults
  const entryPrice = customEntryPrice || opp.entry?.price || 0;
  const stopPrice = opp.stopLoss?.price || 0;
  const targetPrice = opp.target?.price || 0;
  
  const shares = calculateShares(entryPrice, stopPrice, positionSize);
  const totalCost = shares * entryPrice;
  const potentialProfit = shares * (targetPrice - entryPrice);
  const potentialLoss = shares * (entryPrice - stopPrice);
  const remainingBalance = accountBalance - totalCost;
  const portfolioAllocation = (totalCost / accountBalance) * 100;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomEntryPrice(opp.entry?.price || 0);
      setIsSuccess(false);
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
          limit_price: orderType === "limit" ? customEntryPrice : undefined,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
                    <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Trade Submitted!
                  </h3>
                  <p className="text-muted-foreground">
                    {shares} shares of {opp.symbol}
                  </p>
                </motion.div>
              )}

              {/* Header */}
              <div className="relative border-b border-border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      Execute Trade
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-primary">
                        {opp.symbol}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {opp.setupType?.toUpperCase() || "SWING TRADE"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">
                      Win Rate
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      {opp.winRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
                {/* Order Type Selection */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Order Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["market", "limit", "stop_limit"] as OrderType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`px-4 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${
                          orderType === type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-border/80 text-muted-foreground"
                        }`}
                      >
                        {type === "market" && "Market"}
                        {type === "limit" && "Limit"}
                        {type === "stop_limit" && "Stop Limit"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Levels */}
                <div className="grid grid-cols-3 gap-3">
                  <PriceBox
                    icon={TrendingUp}
                    label="Entry"
                    price={entryPrice}
                    percentage={opp.entry?.percentage || 0}
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
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center justify-between">
                    <span>Position Size (Risk per Trade)</span>
                    <span className="text-primary">${positionSize}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={positionSize}
                    onChange={(e) => setPositionSize(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$100</span>
                    <span>$2000</span>
                  </div>
                </div>

                {/* Position Summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Position Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
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
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Account Balance
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      ${accountBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      After Trade
                    </span>
                    <span
                      className={`font-semibold ${
                        remainingBalance < 0 ? "text-red-500" : "text-foreground"
                      }`}
                    >
                      ${remainingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Risk Warning */}
                {portfolioAllocation > 20 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">
                      <span className="font-semibold">High Risk:</span> This trade
                      represents {portfolioAllocation.toFixed(1)}% of your portfolio.
                      Consider reducing position size.
                    </div>
                  </div>
                )}

                {/* Trade Reasoning */}
                <div className="border border-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Trade Thesis
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opp.reasoning}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Timeframe: <span className="text-foreground font-medium">{opp.timeframe}</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      Confidence: <span className="text-foreground font-medium">{opp.confidence || 0}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border p-6 bg-muted/30">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-border hover:bg-muted transition-all font-semibold text-foreground disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || remainingBalance < 0}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="w-5 h-5" />
                        </motion.div>
                        Executing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
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
}

// Helper Components
interface PriceBoxProps {
  icon: any;
  label: string;
  price: number;
  percentage: number;
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
    <div className="bg-muted/50 rounded-xl p-3 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
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
          className="w-full text-lg font-bold text-foreground bg-background rounded px-2 py-1 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <div className="text-lg font-bold text-foreground">
          ${safePrice.toFixed(2)}
        </div>
      )}
      <div className={`text-xs font-medium ${color} mt-1`}>
        {safePercentage > 0 ? "+" : ""}
        {safePercentage.toFixed(2)}%
      </div>
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

function calculateShares(
  entryPrice: number,
  stopPrice: number,
  riskAmount: number
): number {
  const riskPerShare = entryPrice - stopPrice;
  if (riskPerShare <= 0) return 0;
  return Math.floor(riskAmount / riskPerShare);
}
