"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentGaugeCompactProps {
  rsi?: number;
  macd?: number;
  newsSentiment?: number; // 0-100
  marketChange?: number;
  className?: string;
}

export const SentimentGaugeCompact: FC<SentimentGaugeCompactProps> = ({
  rsi = 50,
  macd = 0,
  newsSentiment = 50,
  marketChange = 0,
  className,
}) => {
  // Calculate composite sentiment (0-100)
  const rsiScore = rsi / 100; // Higher RSI = more bullish (but overbought)
  const macdScore = macd > 0 ? 0.7 : 0.3; // Bullish/bearish
  const newsScore = newsSentiment / 100;
  const marketScore = marketChange > 0 ? 0.7 : marketChange < 0 ? 0.3 : 0.5;

  const sentiment = Math.round(
    ((rsiScore + macdScore + newsScore + marketScore) / 4) * 100
  );

  const getSentimentLabel = (value: number) => {
    if (value <= 20) return { label: "Extreme Fear", color: "text-red-500", bg: "bg-red-500/10" };
    if (value <= 40) return { label: "Fear", color: "text-orange-500", bg: "bg-orange-500/10" };
    if (value <= 60) return { label: "Neutral", color: "text-muted-foreground", bg: "bg-muted/20" };
    if (value <= 80) return { label: "Greed", color: "text-green-500", bg: "bg-green-500/10" };
    return { label: "Extreme Greed", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  };

  const config = getSentimentLabel(sentiment);

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4 shadow-sm h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Market Sentiment</h3>
        </div>
      </div>

      {/* Sentiment Score */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0">
          <div className={cn("text-4xl font-bold font-mono", config.color)}>
            {sentiment}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-1",
              config.bg,
              config.color
            )}
          >
            {config.label}
          </div>
          <p className="text-xs text-muted-foreground">Composite score from 4 indicators</p>
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sentiment}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              sentiment <= 20
                ? "bg-red-500"
                : sentiment <= 40
                ? "bg-orange-500"
                : sentiment <= 60
                ? "bg-muted-foreground"
                : sentiment <= 80
                ? "bg-green-500"
                : "bg-emerald-500"
            )}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>Fear</span>
          <span>Neutral</span>
          <span>Greed</span>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* RSI */}
        <div className="p-2 rounded-lg bg-muted/20">
          <div className="text-[10px] text-muted-foreground mb-0.5">RSI</div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-lg font-bold font-mono", rsi >= 70 ? "text-down" : rsi <= 30 ? "text-up" : "text-foreground")}>
              {rsi.toFixed(0)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {rsi >= 70 ? "Overbought" : rsi <= 30 ? "Oversold" : "Neutral"}
            </span>
          </div>
        </div>

        {/* MACD */}
        <div className="p-2 rounded-lg bg-muted/20">
          <div className="text-[10px] text-muted-foreground mb-0.5">MACD</div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-lg font-bold font-mono", macd > 0 ? "text-up" : "text-down")}>
              {macd > 0 ? "+" : ""}
              {macd.toFixed(2)}
            </span>
            <span className={cn("text-[10px]", macd > 0 ? "text-up" : "text-down")}>
              {macd > 0 ? "Bullish" : "Bearish"}
            </span>
          </div>
        </div>

        {/* News Sentiment */}
        <div className="p-2 rounded-lg bg-muted/20">
          <div className="text-[10px] text-muted-foreground mb-0.5">News</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-foreground">
              {newsSentiment}%
            </span>
            <span className="text-[10px] text-muted-foreground">Bullish</span>
          </div>
        </div>

        {/* Market Change */}
        <div className="p-2 rounded-lg bg-muted/20">
          <div className="text-[10px] text-muted-foreground mb-0.5">Market</div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-lg font-bold font-mono", marketChange >= 0 ? "text-up" : "text-down")}>
              {marketChange >= 0 ? "+" : ""}
              {marketChange.toFixed(2)}%
            </span>
            {marketChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-up" />
            ) : (
              <TrendingDown className="h-3 w-3 text-down" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper with data fetching
interface SentimentGaugeWithDataProps {
  rsi?: number;
  macd?: number;
  newsSentiment?: number;
  marketChange?: number;
}

export const SentimentGaugeWithData: FC<SentimentGaugeWithDataProps> = (props) => {
  return <SentimentGaugeCompact {...props} />;
};

