"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface MomentumGaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  zones?: { start: number; end: number; label: string; color: string }[];
  description?: string;
}

const MomentumGauge: FC<MomentumGaugeProps> = ({
  label,
  value,
  min,
  max,
  zones = [],
  description,
}) => {
  const normalizedValue = ((value - min) / (max - min)) * 100;
  const clampedValue = Math.max(0, Math.min(100, normalizedValue));

  // Find current zone
  const currentZone = zones.find((z) => value >= z.start && value <= z.end);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-bold font-mono">{value.toFixed(1)}</span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-3 rounded-full bg-surface-3 overflow-hidden">
        {/* Zone backgrounds */}
        {zones.map((zone, i) => {
          const start = ((zone.start - min) / (max - min)) * 100;
          const width = ((zone.end - zone.start) / (max - min)) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 opacity-30"
              style={{
                left: `${start}%`,
                width: `${width}%`,
                backgroundColor: zone.color,
              }}
            />
          );
        })}

        {/* Value indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 bottom-0 left-0"
          style={{
            backgroundColor: currentZone?.color || "hsl(var(--primary))",
          }}
        />

        {/* Needle marker */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 bottom-0 w-0.5 bg-foreground -translate-x-1/2"
        />
      </div>

      {/* Zone label and description */}
      <div className="flex items-center justify-between text-2xs">
        {currentZone && (
          <span
            className="font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${currentZone.color}20`, color: currentZone.color }}
          >
            {currentZone.label}
          </span>
        )}
        {description && (
          <span className="text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );
};

interface MomentumDashboardProps {
  rsi?: number;
  macdHistogram?: number;
  trendStrength?: "weak" | "moderate" | "strong";
  className?: string;
}

export const MomentumDashboard: FC<MomentumDashboardProps> = ({
  rsi = 55,
  macdHistogram = 0.5,
  trendStrength = "moderate",
  className,
}) => {
  const rsiZones = [
    { start: 0, end: 30, label: "Oversold", color: "#22c55e" },
    { start: 30, end: 70, label: "Neutral", color: "#6366f1" },
    { start: 70, end: 100, label: "Overbought", color: "#ef4444" },
  ];

  const macdNormalized = Math.max(-5, Math.min(5, macdHistogram));
  const macdZones = [
    { start: -5, end: -1, label: "Strong Bearish", color: "#ef4444" },
    { start: -1, end: -0.1, label: "Bearish", color: "#f97316" },
    { start: -0.1, end: 0.1, label: "Neutral", color: "#6366f1" },
    { start: 0.1, end: 1, label: "Bullish", color: "#84cc16" },
    { start: 1, end: 5, label: "Strong Bullish", color: "#22c55e" },
  ];

  const trendValue =
    trendStrength === "weak" ? 25 : trendStrength === "moderate" ? 55 : 85;
  const trendZones = [
    { start: 0, end: 33, label: "Weak", color: "#f97316" },
    { start: 33, end: 66, label: "Moderate", color: "#6366f1" },
    { start: 66, end: 100, label: "Strong", color: "#22c55e" },
  ];

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
      <div className="flex items-center gap-2 mb-5">
        <Gauge className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Momentum Indicators</h3>
      </div>

      {/* Gauges */}
      <div className="space-y-5">
        <MomentumGauge
          label="RSI (14)"
          value={rsi}
          min={0}
          max={100}
          zones={rsiZones}
          description={
            rsi > 70
              ? "Consider taking profits"
              : rsi < 30
              ? "Potential buying opportunity"
              : "Normal range"
          }
        />

        <MomentumGauge
          label="MACD Histogram"
          value={macdNormalized}
          min={-5}
          max={5}
          zones={macdZones}
          description={
            macdHistogram > 0
              ? "Momentum is bullish"
              : macdHistogram < 0
              ? "Momentum is bearish"
              : "Momentum is neutral"
          }
        />

        <MomentumGauge
          label="Trend Strength"
          value={trendValue}
          min={0}
          max={100}
          zones={trendZones}
          description={
            trendStrength === "strong"
              ? "Clear directional move"
              : trendStrength === "weak"
              ? "Choppy, no clear trend"
              : "Developing trend"
          }
        />
      </div>

      {/* Summary */}
      <div className="mt-5 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          {macdHistogram > 0 && rsi < 70 ? (
            <>
              <TrendingUp className="h-4 w-4 text-up" />
              <span className="text-sm text-up font-medium">
                Bullish momentum with room to run
              </span>
            </>
          ) : macdHistogram < 0 && rsi > 30 ? (
            <>
              <TrendingDown className="h-4 w-4 text-down" />
              <span className="text-sm text-down font-medium">
                Bearish momentum continues
              </span>
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                Mixed signals - wait for clarity
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

