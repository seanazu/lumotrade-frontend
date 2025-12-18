"use client";

import { type FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentGaugeProps {
  value: number; // 0-100, where 0 = extreme fear, 100 = extreme greed
  previousValue?: number;
  className?: string;
}

// Sentiment zones
const ZONES = [
  { min: 0, max: 20, label: "Extreme Fear", color: "#dc2626", description: "Investors are very worried" },
  { min: 20, max: 40, label: "Fear", color: "#f97316", description: "Caution in the market" },
  { min: 40, max: 60, label: "Neutral", color: "#6366f1", description: "Balanced sentiment" },
  { min: 60, max: 80, label: "Greed", color: "#84cc16", description: "Optimism building" },
  { min: 80, max: 100, label: "Extreme Greed", color: "#22c55e", description: "Maximum optimism" },
];

function getZone(value: number) {
  return ZONES.find((z) => value >= z.min && value < z.max) || ZONES[2];
}

export const SentimentGauge: FC<SentimentGaugeProps> = ({
  value,
  previousValue,
  className,
}) => {
  const [animatedValue, setAnimatedValue] = useState(50);
  const zone = getZone(value);
  const change = previousValue !== undefined ? value - previousValue : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 200);
    return () => clearTimeout(timer);
  }, [value]);

  // Calculate needle rotation (180 degrees = full sweep from left to right)
  const needleRotation = -90 + (animatedValue / 100) * 180;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-2xl bg-surface-2/50 border border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Market Sentiment</h3>
        </div>
        {change !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded",
              change > 0 ? "bg-up/10 text-up" : "bg-down/10 text-down"
            )}
          >
            {change > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change > 0 ? "+" : ""}
            {change.toFixed(0)} from last week
          </div>
        )}
      </div>

      {/* Gauge */}
      <div className="relative flex flex-col items-center">
        {/* Semi-circular gauge */}
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Background arc segments */}
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            style={{ transform: "rotate(0deg)" }}
          >
            {/* Gradient background arc */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="75%" stopColor="#84cc16" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Track overlay for depth */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              strokeLinecap="round"
              className="text-background/30"
            />
          </svg>

          {/* Needle */}
          <motion.div
            className="absolute bottom-0 left-1/2 origin-bottom"
            style={{ width: 4, height: 70 }}
            initial={{ rotate: -90 }}
            animate={{ rotate: needleRotation }}
            transition={{ type: "spring", stiffness: 60, damping: 12 }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `linear-gradient(to top, ${zone.color}, ${zone.color}88)`,
                boxShadow: `0 0 10px ${zone.color}66`,
              }}
            />
          </motion.div>

          {/* Center pivot */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2"
            style={{
              backgroundColor: zone.color,
              borderColor: zone.color,
              boxShadow: `0 0 15px ${zone.color}88`,
            }}
          />
        </div>

        {/* Value display */}
        <div className="mt-4 text-center">
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold font-mono"
            style={{ color: zone.color }}
          >
            {animatedValue.toFixed(0)}
          </motion.div>
          <div
            className="text-sm font-semibold mt-1 px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${zone.color}20`,
              color: zone.color,
            }}
          >
            {zone.label}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{zone.description}</p>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between w-48 mt-3 text-2xs text-muted-foreground">
          <span>Fear</span>
          <span>Neutral</span>
          <span>Greed</span>
        </div>
      </div>

      {/* What this means */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-start gap-2">
          <Activity className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {value < 30
              ? "High fear often signals buying opportunities as markets may be oversold."
              : value > 70
              ? "Extreme greed suggests caution - markets may be overbought and due for a pullback."
              : "Balanced sentiment indicates a stable market environment."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// With calculated value based on market data
export const SentimentGaugeWithData: FC<{
  className?: string;
  rsi?: number;
  macd?: number;
  newsSentiment?: number;
  marketChange?: number; // SPY daily change %
}> = ({ className, rsi = 55, macd = 0.5, newsSentiment = 60, marketChange = 0 }) => {
  // Calculate composite sentiment score with proper normalization
  
  // RSI: 0-100 scale, already normalized
  const rsiScore = rsi;

  // MACD: normalize histogram value (-2 to +2 typical range)
  const macdScore = Math.max(0, Math.min(100, 50 + (macd || 0) * 25));

  // Market change: normalize daily % change (-5% to +5% typical)
  const marketScore = Math.max(0, Math.min(100, 50 + (marketChange || 0) * 10));

  // News sentiment: already 0-100

  // Weighted average: RSI (35%), Market Change (30%), News (20%), MACD (15%)
  const sentimentValue = Math.round(
    rsiScore * 0.35 + marketScore * 0.30 + newsSentiment * 0.20 + macdScore * 0.15
  );

  // Calculate previous value for trend indicator
  const previousValue = sentimentValue - Math.round((marketChange || 0) * 2);

  return (
    <SentimentGauge
      value={sentimentValue}
      previousValue={previousValue}
      className={className}
    />
  );
};

