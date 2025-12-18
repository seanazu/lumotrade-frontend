"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTickerInfo, getPredictionSentiment } from "@/utils/market/tickers";

interface PredictionCardProps {
  prediction: {
    ticker: string;
    direction: "UP" | "DOWN";
    confidence?: number;
    magnitude?: number;
    should_trade?: boolean;
    date: string;
  };
  index?: number;
}

/**
 * Prediction Card Component
 * Displays AI model prediction with confidence, sentiment, and forecast
 */
export function PredictionCard({ prediction, index = 0 }: PredictionCardProps) {
  const tickerInfo = getTickerInfo(prediction.ticker);
  const isPositive = prediction.direction === "UP";
  const confidence = (prediction.confidence || 0) * 100;
  const magnitude = prediction.magnitude || 0;
  const sentiment = getPredictionSentiment(
    magnitude,
    prediction.should_trade || false,
    isPositive
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.15 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden"
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

        {/* Sentiment Badge */}
        <div className="mb-3">
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
        </div>

        {/* Direction & Magnitude */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[9px] text-muted-foreground uppercase mb-1">
              Direction
            </div>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-bold",
                  isPositive ? "text-emerald-500" : "text-red-500"
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
                isPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              {isPositive ? "+" : ""}
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

