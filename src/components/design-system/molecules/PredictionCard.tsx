"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTickerInfo, getPredictionSentiment } from "@/utils/market/tickers";

interface PredictionCardProps {
  prediction: {
    ticker: string;
    direction: "UP" | "DOWN" | "HOLD";
    confidence?: number;
    magnitude?: number;
    should_trade?: boolean;
    // ML diagnostics (optional, but present from backend)
    p_up?: number;
    q10?: number;
    q50?: number;
    q90?: number;
    spread?: number;
    overnight_gap?: number;
    date: string;
    actual_return?: number | null;
    was_correct?: boolean | null;
  };
  index?: number;
}

/**
 * Prediction Card Component
 * Displays AI model prediction with confidence, sentiment, and forecast
 * Shows active trade badge if there's an open position
 */
export function PredictionCard({ prediction, index = 0 }: PredictionCardProps) {
  const tickerInfo = getTickerInfo(prediction.ticker);
  const isPositive = prediction.direction === "UP";
  const confidence = (prediction.confidence || 0) * 100;
  const magnitude = prediction.magnitude || 0;
  const sentiment = getPredictionSentiment(
    magnitude,
    prediction.should_trade || false,
    isPositive,
    prediction.was_correct,
    prediction.actual_return
  );

  const hasActualReturn =
    prediction.actual_return !== null && prediction.actual_return !== undefined;
  const showTradePnl = (prediction.should_trade || false) && hasActualReturn;

  // Explain "NO TRADE" when confidence looks high
  const noTradeReason = (() => {
    if (prediction.should_trade) return null;

    const conf = prediction.confidence ?? 0;
    const spread =
      typeof prediction.spread === "number" ? prediction.spread : null;
    const minConf = 0.6;
    const minSpread = 0.015;

    if (conf < minConf) {
      return `Confidence ${(conf * 100).toFixed(0)}% < ${(
        minConf * 100
      ).toFixed(0)}% threshold`;
    }

    // Most common case: model is confident on direction but expects a small move
    if (spread !== null && spread < minSpread) {
      return `Spread ${(spread * 100).toFixed(2)}% < ${(
        minSpread * 100
      ).toFixed(2)}% (not enough edge)`;
    }

    // Fallback
    return "Trade filters blocked execution (range/edge filters)";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.15 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "bg-card border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden",
        "border-border"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                tickerInfo.color === "orange" && "bg-orange-500",
                tickerInfo.color === "blue" && "bg-blue-500/10",
                tickerInfo.color === "amber" && "bg-amber-500",
                tickerInfo.color === "purple" && "bg-purple-500/10",
                tickerInfo.color === "green" && "bg-green-500/10",
                tickerInfo.color === "gray" && "bg-gray-500/10",
                tickerInfo.color === "yellow" && "bg-yellow-500/10"
              )}
            >
              {tickerInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                {tickerInfo.name}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {tickerInfo.symbol}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground uppercase mb-0.5">
              Confidence
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-500">
                {confidence.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Sentiment Badge & Trade Result */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
              sentiment.color === "emerald" &&
                "bg-emerald-500/10 text-emerald-500",
              sentiment.color === "red" && "bg-red-500/10 text-red-500",
              sentiment.color === "amber" && "bg-amber-500/10 text-amber-500",
              sentiment.color === "gray" && "bg-gray-500/10 text-gray-500"
            )}
          >
            {sentiment.label}
          </span>
          {showTradePnl && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold",
                (prediction.actual_return || 0) >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              P/L {(prediction.actual_return || 0) >= 0 ? "+" : ""}
              {((prediction.actual_return || 0) * 100).toFixed(2)}%
            </span>
          )}
        </div>

        {/* No-trade reason (no mock; explain the rule) */}
        {!prediction.should_trade && (
          <div className="mb-3">
            <div className="text-[9px] text-muted-foreground uppercase mb-1">
              Why no trade
            </div>
            <div className="text-[11px] text-muted-foreground">
              {noTradeReason || "—"}
            </div>
            {(typeof prediction.p_up === "number" ||
              typeof prediction.spread === "number") && (
              <div className="mt-1 text-[10px] text-muted-foreground font-mono">
                {typeof prediction.p_up === "number" &&
                  `p_up=${prediction.p_up.toFixed(3)} `}
                {typeof prediction.spread === "number" &&
                  `spread=${prediction.spread.toFixed(4)}`}
              </div>
            )}
          </div>
        )}

        {/* Direction & Magnitude */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[9px] text-muted-foreground uppercase mb-1">
              Direction
            </div>
            <div className="flex items-center gap-1">
              {prediction.direction === "UP" ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : prediction.direction === "DOWN" ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-sm font-bold",
                  prediction.direction === "UP"
                    ? "text-emerald-500"
                    : prediction.direction === "DOWN"
                      ? "text-red-500"
                      : "text-muted-foreground"
                )}
              >
                {prediction.direction}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground uppercase mb-1">
              Expected
            </div>
            <div
              className={cn(
                "text-lg font-bold",
                prediction.direction === "UP"
                  ? "text-emerald-500"
                  : prediction.direction === "DOWN"
                    ? "text-red-500"
                    : "text-muted-foreground"
              )}
            >
              {prediction.direction === "UP" ? "+" : ""}
              {(magnitude * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-16 relative">
          <svg
            className="w-full h-full"
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
          >
            {/* Historical line (gray) */}
            <path
              d="M 0 35 Q 30 32 60 30 T 120 25"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
            />
            {/* Forecast line (colored dashed) */}
            <path
              d={
                isPositive
                  ? "M 120 25 Q 140 22 160 18 T 200 12"
                  : "M 120 25 Q 140 28 160 34 T 200 42"
              }
              fill="none"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {/* Dot at transition */}
            <circle cx="120" cy="25" r="3" fill="#6b7280" />
          </svg>
          <div className="absolute bottom-0 left-0 text-[8px] text-muted-foreground">
            Today
          </div>
          <div className="absolute bottom-0 right-0 text-[8px] text-muted-foreground">
            {new Date(prediction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
