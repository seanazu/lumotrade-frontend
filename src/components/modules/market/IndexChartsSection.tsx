"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, BarChart3, Loader2, Activity, CandlestickChart, LineChart as LineChartIcon } from "lucide-react";
import {
  createChart,
  IChartApi,
  ColorType,
  CrosshairMode,
  Time,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { GlassCard } from "@/components/design-system/atoms/GlassCard";
import { IndexData } from "@/resources/mock-data/indexes";
import { MarketSession } from "@/lib/api/types";
import { useIndexIntraday } from "@/hooks/useIndexIntraday";
import { cn } from "@/lib/utils";

interface IndexChartsSectionProps {
  indexes: IndexData[];
}

type ChartType = "line" | "candlestick";

interface ProcessedPoint {
  time: Time;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  session: MarketSession;
}

interface SeriesChartMeta {
  points: ProcessedPoint[];
  sessionStart: number;
  regularStart: number;
  regularEnd: number;
  sessionEnd: number;
}

// Single index chart component using lightweight-charts
const IndexChart: FC<{
  symbol: string;
  name: string;
  meta: SeriesChartMeta | undefined;
  chartType: ChartType;
}> = ({ symbol, name, meta, chartType }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Create and update chart
  useEffect(() => {
    if (!chartContainerRef.current || !meta || !meta.points.length) return;

    // Theme colors
    const colors = {
      background: isDark ? "#0f1419" : "#f8fafc",
      text: isDark ? "#6b7280" : "#64748b",
      grid: isDark ? "#1f2937" : "#e2e8f0",
      upColor: isDark ? "#22c55e" : "#16a34a",
      downColor: isDark ? "#ef4444" : "#dc2626",
      primary: isDark ? "#6366f1" : "#4f46e5",
      preMarket: isDark ? "rgba(250, 204, 21, 0.3)" : "rgba(250, 204, 21, 0.2)",
      afterMarket: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)",
      crosshair: isDark ? "#6b7280" : "#64748b",
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: colors.grid, style: 1 },
        horzLines: { color: colors.grid, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Hidden, // Disable crosshair for view-only mode
      },
      rightPriceScale: {
        borderColor: colors.grid,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: Time) => {
          const date = new Date((time as number) * 1000);
          return new Intl.DateTimeFormat("he-IL", {
            timeZone: "Asia/Jerusalem",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(date);
        },
      },
      // Disable all interactivity - view only
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    // Add main series based on chart type
    if (chartType === "candlestick") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: colors.upColor,
        downColor: colors.downColor,
        borderUpColor: colors.upColor,
        borderDownColor: colors.downColor,
        wickUpColor: colors.upColor,
        wickDownColor: colors.downColor,
      });

      candleSeries.setData(
        meta.points.map((p) => ({
          time: p.time,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
        }))
      );
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: colors.primary,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: colors.primary,
        crosshairMarkerBackgroundColor: colors.background,
      });

      lineSeries.setData(
        meta.points.map((p) => ({
          time: p.time,
          value: p.close,
        }))
      );
    }

    // Add volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    volumeSeries.setData(
      meta.points.map((p) => ({
        time: p.time,
        value: p.volume,
        color:
          p.session === "pre"
            ? colors.preMarket
            : p.session === "after"
            ? colors.afterMarket
            : p.close >= p.open
            ? `${colors.upColor}60`
            : `${colors.downColor}60`,
      }))
    );

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
  }, [meta, chartType, isDark]);

  if (!meta || !meta.points.length) {
    return (
      <div className="p-6 border border-dashed border-border/60 rounded-xl text-sm text-muted-foreground h-[280px] flex items-center justify-center">
        No intraday data yet for {name}. Waiting for next market update...
      </div>
    );
  }

  const lastPoint = meta.points[meta.points.length - 1];
  const firstPoint = meta.points[0];
  const priceChange = lastPoint.close - firstPoint.close;
  const priceChangePercent = (priceChange / firstPoint.close) * 100;
  const isPositive = priceChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div>
          <h3 className="font-semibold text-sm">{name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold font-mono">
              ${lastPoint.close.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={cn(
                "text-xs font-medium font-mono",
                isPositive ? "text-up" : "text-down"
              )}
            >
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-2xs px-2 py-0.5 rounded-full font-medium",
              lastPoint.session === "pre"
                ? "bg-yellow-500/20 text-yellow-400"
                : lastPoint.session === "after"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-up/20 text-up"
            )}
          >
            {lastPoint.session === "pre"
              ? "Pre-Market"
              : lastPoint.session === "after"
              ? "After-Hours"
              : "Market Open"}
          </span>
        </div>
      </div>

      {/* Chart - View only, non-interactive */}
      <div ref={chartContainerRef} className="w-full pointer-events-none select-none" />
    </motion.div>
  );
};

export const IndexChartsSection: FC<IndexChartsSectionProps> = ({ indexes }) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const symbols = useMemo(() => indexes.map((idx) => idx.symbol), [indexes]);
  const { data: intradaySeries, isLoading, error, dataUpdatedAt } = useIndexIntraday(symbols);

  // Process intraday data into chart format
  const seriesMeta = useMemo(() => {
    const map = new Map<string, SeriesChartMeta>();

    intradaySeries?.forEach((series) => {
      const sessionStart = new Date(series.sessionStart).getTime();
      const regularStart = new Date(series.regularStart).getTime();
      const regularEnd = new Date(series.regularEnd).getTime();
      const sessionEnd = new Date(series.sessionEnd).getTime();

      // Group points into 5-minute candles for candlestick view
      const candleMap = new Map<number, ProcessedPoint>();
      const candleInterval = 5 * 60 * 1000; // 5 minutes

      series.points.forEach((point) => {
        const timestamp = new Date(point.timestamp).getTime();
        const candleTime = Math.floor(timestamp / candleInterval) * candleInterval;
        const timeAsSeconds = Math.floor(candleTime / 1000) as Time;

        const existing = candleMap.get(candleTime);
        if (existing) {
          existing.high = Math.max(existing.high, point.price);
          existing.low = Math.min(existing.low, point.price);
          existing.close = point.price;
          existing.volume += Math.floor(Math.random() * 10000) + 1000; // Synthetic volume
        } else {
          candleMap.set(candleTime, {
            time: timeAsSeconds,
            price: point.price,
            open: point.price,
            high: point.price,
            low: point.price,
            close: point.price,
            volume: Math.floor(Math.random() * 50000) + 5000,
            session: point.session,
          });
        }
      });

      // Sort by time
      const points = Array.from(candleMap.values()).sort(
        (a, b) => (a.time as number) - (b.time as number)
      );

      map.set(series.symbol, {
        points,
        sessionStart,
        regularStart,
        regularEnd,
        sessionEnd,
      });
    });

    return map;
  }, [intradaySeries]);

  // Format last update time
  const lastUpdateTime = dataUpdatedAt
    ? new Intl.DateTimeFormat("he-IL", {
        timeZone: "Asia/Jerusalem",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date(dataUpdatedAt))
    : null;

  return (
    <GlassCard className="p-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Intraday Performance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live charts with pre-market and after-hours data • Updates every ~4 seconds
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5">
            <button
              onClick={() => setChartType("line")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                chartType === "line"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-3"
              )}
            >
              <LineChartIcon className="h-3.5 w-3.5" />
              Line
            </button>
            <button
              onClick={() => setChartType("candlestick")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                chartType === "candlestick"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-3"
              )}
            >
              <CandlestickChart className="h-3.5 w-3.5" />
              Candle
            </button>
          </div>

          {/* Live indicator */}
          {lastUpdateTime && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-up animate-pulse" />
              <span>{lastUpdateTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-yellow-500/30 border border-yellow-500/50" />
          <span className="text-muted-foreground">Pre-Market (4:00-9:30 ET)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary/50" />
          <span className="text-muted-foreground">Regular (9:30-16:00 ET)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-500/50" />
          <span className="text-muted-foreground">After-Hours (16:00-20:00 ET)</span>
        </div>
      </div>

      {/* Error State */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-4 mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              Failed to load intraday charts:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">
            Fetching live charts...
          </span>
        </div>
      )}

      {/* Charts Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {indexes.map((index) => (
            <IndexChart
              key={index.symbol}
              symbol={index.symbol}
              name={index.name}
              meta={seriesMeta.get(index.symbol)}
              chartType={chartType}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
};
