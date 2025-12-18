"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeframePerfornance {
  label: string;
  shortLabel: string;
  change: number;
  value?: number;
}

interface PerformanceTimelineProps {
  performances: TimeframePerfornance[];
  isLoading?: boolean;
  className?: string;
}

const PerformanceBar: FC<{
  perf: TimeframePerfornance;
  maxAbsChange: number;
  index: number;
}> = ({ perf, maxAbsChange, index }) => {
  const isPositive = perf.change >= 0;
  const barWidth = Math.min((Math.abs(perf.change) / maxAbsChange) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3"
    >
      {/* Label */}
      <div className="w-20 flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">
          {perf.label}
        </span>
      </div>

      {/* Bar container */}
      <div className="flex-1 relative h-8">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />

        {/* Bar */}
        <div className="absolute top-1 bottom-1 left-1/2 flex items-center">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-sm",
              isPositive ? "bg-up" : "bg-down",
              isPositive ? "origin-left ml-1" : "origin-right -translate-x-full mr-1"
            )}
            style={{
              maxWidth: "calc(50% - 4px)",
            }}
          />
        </div>

        {/* Percentage label - with overflow protection */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 whitespace-nowrap",
            isPositive ? "left-[52%]" : "right-[52%]"
          )}
          style={{
            [isPositive ? "left" : "right"]: `calc(50% + min(${barWidth * 0.5}%, 20%) + 8px)`,
            maxWidth: "calc(50% - 8px)"
          }}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-up flex-shrink-0" />
          ) : (
            <TrendingDown className="h-3 w-3 text-down flex-shrink-0" />
          )}
          <span
            className={cn(
              "text-xs font-bold font-mono truncate",
              isPositive ? "text-up" : "text-down"
            )}
          >
            {isPositive ? "+" : ""}
            {perf.change.toFixed(2)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const PerformanceTimeline: FC<PerformanceTimelineProps> = ({
  performances,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn("p-6 rounded-2xl bg-surface-2/50 border border-border", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const maxAbsChange = Math.max(
    ...performances.map((p) => Math.abs(p.change)),
    0.01
  );

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
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Performance Timeline</h3>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {performances.map((perf, index) => (
          <PerformanceBar
            key={perf.label}
            perf={perf}
            maxAbsChange={maxAbsChange}
            index={index}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-up" />
          <span>Gain</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-down" />
          <span>Loss</span>
        </div>
      </div>
    </motion.div>
  );
};

// Default export with real data from API
export const PerformanceTimelineWithData: FC<{ 
  className?: string;
  data?: {
    today: number;
    week: number;
    month: number;
    ytd: number;
  };
  isLoading?: boolean;
}> = ({ className, data, isLoading }) => {
  // Only show real data or loading state - no fake fallback data
  const performances: TimeframePerfornance[] = data
    ? [
        { label: "Today", shortLabel: "1D", change: data.today },
        { label: "This Week", shortLabel: "1W", change: data.week },
        { label: "This Month", shortLabel: "1M", change: data.month },
        { label: "Year to Date", shortLabel: "YTD", change: data.ytd },
      ]
    : [];

  // If no data and not loading, show empty state
  if (!isLoading && performances.length === 0) {
    return (
      <div className={cn("p-5 rounded-2xl bg-surface-2/50 border border-border", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Performance Timeline</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-muted-foreground">Performance data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <PerformanceTimeline
      performances={performances}
      isLoading={isLoading}
      className={className}
    />
  );
};

