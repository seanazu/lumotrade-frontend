"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Zap, AlertTriangle } from "lucide-react";
import { useOptionsMarketSentiment } from "@/hooks/useOptionsData";
import { cn } from "@/lib/utils";

export const OptionsMarketSentiment: FC = () => {
  const { data, isLoading } = useOptionsMarketSentiment();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Options Market</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { vix, putCallRatio, sentiment, ivRank } = data;

  const sentimentConfig = {
    FEARFUL: {
      label: "Fearful",
      color: "text-down",
      bgColor: "bg-down/10",
      borderColor: "border-down/30",
      icon: AlertTriangle,
      description: "High volatility, defensive positioning",
    },
    NEUTRAL: {
      label: "Neutral",
      color: "text-muted-foreground",
      bgColor: "bg-muted/20",
      borderColor: "border-border",
      icon: Target,
      description: "Balanced market sentiment",
    },
    GREEDY: {
      label: "Greedy",
      color: "text-up",
      bgColor: "bg-up/10",
      borderColor: "border-up/30",
      icon: TrendingUp,
      description: "Low volatility, bullish positioning",
    },
  };

  const config = sentimentConfig[sentiment];
  const SentimentIcon = config.icon;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Options Market</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live
        </div>
      </div>

      {/* Sentiment Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "mb-3 p-3 rounded-lg border",
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <SentimentIcon className={cn("h-4 w-4", config.color)} />
          <span className={cn("text-sm font-bold", config.color)}>
            Market Sentiment: {config.label}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">{config.description}</p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* VIX */}
        {vix && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-2.5 rounded-lg bg-muted/20"
          >
            <div className="text-[10px] text-muted-foreground mb-1">VIX</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-foreground">
                {vix.price.toFixed(2)}
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold font-mono flex items-center gap-0.5",
                  vix.change >= 0 ? "text-down" : "text-up" // Higher VIX = bad (red)
                )}
              >
                {vix.change >= 0 ? "+" : ""}
                {vix.changePercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {vix.price < 15 ? "Low" : vix.price < 20 ? "Normal" : vix.price < 30 ? "Elevated" : "High"}
            </div>
          </motion.div>
        )}

        {/* Put/Call Ratio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-2.5 rounded-lg bg-muted/20"
        >
          <div className="text-[10px] text-muted-foreground mb-1">P/C Ratio</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-foreground">
              {putCallRatio.toFixed(2)}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {putCallRatio < 0.7
              ? "Very Bullish"
              : putCallRatio < 0.9
              ? "Bullish"
              : putCallRatio < 1.1
              ? "Neutral"
              : putCallRatio < 1.3
              ? "Bearish"
              : "Very Bearish"}
          </div>
        </motion.div>

        {/* IV Rank */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-2.5 rounded-lg bg-muted/20"
        >
          <div className="text-[10px] text-muted-foreground mb-1">IV Rank</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-foreground">
              {Math.round(ivRank)}
            </span>
            <span className="text-[11px] text-muted-foreground">/100</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {ivRank < 25 ? "Cheap" : ivRank < 50 ? "Fair" : ivRank < 75 ? "Expensive" : "Very Expensive"}
          </div>
        </motion.div>
      </div>

      {/* IV Rank Bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ivRank}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={cn(
              "h-full rounded-full",
              ivRank < 25
                ? "bg-up"
                : ivRank < 50
                ? "bg-primary"
                : ivRank < 75
                ? "bg-yellow-500"
                : "bg-down"
            )}
          />
        </div>
      </div>
    </div>
  );
};

