"use client";

import { type FC, useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Target, Maximize2, TrendingUp } from "lucide-react";
import {
  createChart,
  IChartApi,
  ColorType,
  CrosshairMode,
  Time,
  LineStyle,
  LineSeries,
} from "lightweight-charts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/design-system/atoms/Button";
import { useIndexIntraday } from "@/hooks/useIndexIntraday";

interface KeyLevel {
  price: number;
  label: string;
  type: "support" | "resistance" | "ma" | "current";
  description?: string;
}

interface KeyLevelsChartProps {
  ticker: string;
  currentPrice: number;
  levels: KeyLevel[];
  high52Week?: number;
  low52Week?: number;
  className?: string;
}

export const KeyLevelsChart: FC<KeyLevelsChartProps> = ({
  ticker,
  currentPrice,
  levels,
  high52Week,
  low52Week,
  className,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch real intraday data
  const { data: intradayData } = useIndexIntraday([ticker]);
  
  const chartData = useMemo(() => {
    if (!intradayData || intradayData.length === 0) return [];
    
    const series = intradayData[0];
    if (!series || !series.points) return [];
    
    // Convert to time-value pairs for line chart
    return series.points.map((point) => ({
      time: (new Date(point.timestamp).getTime() / 1000) as Time,
      value: point.price,
    }));
  }, [intradayData]);

  // Get theme colors
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
  const colors = useMemo(() => ({
    background: isDark ? "rgb(3, 7, 18)" : "rgb(255, 255, 255)",
    textColor: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
    gridColor: isDark ? "rgb(30, 41, 59, 0.3)" : "rgb(226, 232, 240, 0.5)",
    lineColor: "rgb(99, 102, 241)", // primary
    upColor: "rgb(16, 185, 129)", // emerald-500
    downColor: "rgb(239, 68, 68)", // red-500
    supportColor: "rgb(16, 185, 129)",
    resistanceColor: "rgb(239, 68, 68)",
    maColor: "rgb(59, 130, 246)", // blue-500
    currentColor: "rgb(99, 102, 241)", // primary
    rangeColor: "rgb(245, 158, 11)", // amber-500
  }), [isDark]);

  // Create chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: colors.gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: colors.gridColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 320,
    });

    chartRef.current = chart;

    // Add line series for price
    const lineSeries = chart.addSeries(LineSeries, {
      color: colors.lineColor,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceLineVisible: false, // Hide default price line
    });

    lineSeries.setData(chartData);

    // Add price lines for key levels
    levels.forEach((level) => {
      const color = 
        level.type === "current" ? colors.currentColor :
        level.type === "support" ? colors.supportColor :
        level.type === "resistance" ? colors.resistanceColor :
        colors.maColor;

      lineSeries.createPriceLine({
        price: level.price,
        color: color,
        lineWidth: level.type === "current" ? 2 : 1,
        lineStyle: level.type === "ma" ? LineStyle.Dashed : 
                   level.type === "current" ? LineStyle.Solid :
                   LineStyle.Dotted,
        axisLabelVisible: true,
        title: level.label,
      });
    });

    // Add 52-week high/low if provided
    if (high52Week) {
      lineSeries.createPriceLine({
        price: high52Week,
        color: colors.rangeColor,
        lineWidth: 1,
        lineStyle: LineStyle.SparseDotted,
        axisLabelVisible: true,
        title: "52W High",
      });
    }

    if (low52Week) {
      lineSeries.createPriceLine({
        price: low52Week,
        color: colors.rangeColor,
        lineWidth: 1,
        lineStyle: LineStyle.SparseDotted,
        axisLabelVisible: true,
        title: "52W Low",
      });
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [chartData, levels, high52Week, low52Week, colors]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-2xl bg-surface-2/50 border border-border backdrop-blur-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Key Price Levels</h3>
            <p className="text-xs text-muted-foreground">{ticker} • 30 Day View</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setIsExpanded(!isExpanded)}>
          <Maximize2 className="h-3 w-3" />
          <span className="text-xs">Expand</span>
        </Button>
      </div>

      {/* TradingView Chart */}
      <div 
        ref={chartContainerRef} 
        className="w-full rounded-xl overflow-hidden bg-background/40 border border-border/50"
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-primary" />
          <span className="text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px border-t-2 border-dotted border-emerald-500" />
          <span className="text-muted-foreground">Support</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px border-t-2 border-dotted border-red-500" />
          <span className="text-muted-foreground">Resistance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px border-t-2 border-dashed border-blue-500" />
          <span className="text-muted-foreground">Moving Avg</span>
        </div>
        {(high52Week || low52Week) && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-px border-t border-dotted border-amber-500" />
            <span className="text-muted-foreground">52W Range</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Current</p>
          <p className="text-sm font-mono font-semibold text-primary">${currentPrice.toFixed(2)}</p>
        </div>
        {high52Week && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">52W High</p>
            <p className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400">
              ${high52Week.toFixed(2)}
            </p>
          </div>
        )}
        {low52Week && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">52W Low</p>
            <p className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400">
              ${low52Week.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

