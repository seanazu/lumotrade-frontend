"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  ColorType,
  CrosshairMode,
  Time,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
} from "lightweight-charts";

export interface CandleData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface LineDataPoint {
  time: string | number;
  value: number;
}

export interface TradingChartProps {
  data: CandleData[];
  type?: "candlestick" | "line" | "area";
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
  predictions?: LineDataPoint[];
  className?: string;
  onCrosshairMove?: (price: number | null, time: Time | null) => void;
}

export function TradingChart({
  data,
  type = "candlestick",
  height = 400,
  showVolume = true,
  showGrid = true,
  predictions,
  className = "",
  onCrosshairMove,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | null
  >(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const predictionSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
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
    if (!chartContainerRef.current) return;

    // Theme colors
    const colors = {
      background: isDark ? "#0f1419" : "#f8fafc",
      text: isDark ? "#6b7280" : "#64748b",
      grid: isDark ? "#1f2937" : "#e2e8f0",
      upColor: isDark ? "#22c55e" : "#16a34a",
      downColor: isDark ? "#ef4444" : "#dc2626",
      primary: isDark ? "#2dd4bf" : "#14b8a6",
      crosshair: isDark ? "#6b7280" : "#64748b",
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: {
          color: showGrid ? colors.grid : "transparent",
          style: 1,
        },
        horzLines: {
          color: showGrid ? colors.grid : "transparent",
          style: 1,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: colors.crosshair,
          width: 1,
          style: 2,
          labelBackgroundColor: colors.primary,
        },
        horzLine: {
          color: colors.crosshair,
          width: 1,
          style: 2,
          labelBackgroundColor: colors.primary,
        },
      },
      rightPriceScale: {
        borderColor: colors.grid,
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Create main series based on type
    if (type === "candlestick") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: colors.upColor,
        downColor: colors.downColor,
        borderUpColor: colors.upColor,
        borderDownColor: colors.downColor,
        wickUpColor: colors.upColor,
        wickDownColor: colors.downColor,
      });

      const candleData: CandlestickData[] = data.map((d) => ({
        time: (typeof d.time === "string"
          ? new Date(d.time).getTime() / 1000
          : d.time) as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candleSeries.setData(candleData);
      mainSeriesRef.current = candleSeries;
    } else if (type === "line") {
      const lineSeries = chart.addSeries(LineSeries, {
        color: colors.primary,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: colors.primary,
        crosshairMarkerBackgroundColor: colors.background,
      });

      const lineData: LineData[] = data.map((d) => ({
        time: (typeof d.time === "string"
          ? new Date(d.time).getTime() / 1000
          : d.time) as Time,
        value: d.close,
      }));

      lineSeries.setData(lineData);
      mainSeriesRef.current = lineSeries;
    } else if (type === "area") {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: colors.primary,
        topColor: `${colors.primary}40`,
        bottomColor: `${colors.primary}05`,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });

      const areaData: LineData[] = data.map((d) => ({
        time: (typeof d.time === "string"
          ? new Date(d.time).getTime() / 1000
          : d.time) as Time,
        value: d.close,
      }));

      areaSeries.setData(areaData);
      mainSeriesRef.current = areaSeries;
    }

    // Add volume histogram
    if (showVolume && data.some((d) => d.volume !== undefined)) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: colors.primary,
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData: HistogramData[] = data
        .filter((d) => d.volume !== undefined)
        .map((d) => ({
          time: (typeof d.time === "string"
            ? new Date(d.time).getTime() / 1000
            : d.time) as Time,
          value: d.volume!,
          color:
            d.close >= d.open ? `${colors.upColor}60` : `${colors.downColor}60`,
        }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Add prediction overlay
    if (predictions && predictions.length > 0) {
      const predictionSeries = chart.addSeries(LineSeries, {
        color: "#FFD700",
        lineWidth: 2,
        lineStyle: 2,
        crosshairMarkerVisible: false,
        title: "Prediction",
      });

      const predictionData: LineData[] = predictions.map((p) => ({
        time: (typeof p.time === "string"
          ? new Date(p.time).getTime() / 1000
          : p.time) as Time,
        value: p.value,
      }));

      predictionSeries.setData(predictionData);
      predictionSeriesRef.current = predictionSeries;
    }

    // Crosshair move handler
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (param.time && param.point) {
          const price = mainSeriesRef.current
            ? param.seriesData.get(mainSeriesRef.current)
            : null;
          const priceValue = price
            ? "close" in price
              ? (price as CandlestickData).close
              : (price as LineData).value
            : null;
          onCrosshairMove(priceValue, param.time);
        } else {
          onCrosshairMove(null, null);
        }
      });
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [
    data,
    type,
    height,
    showVolume,
    showGrid,
    predictions,
    isDark,
    onCrosshairMove,
  ]);

  return (
    <div
      ref={chartContainerRef}
      className={`w-full rounded-lg overflow-hidden ${className}`}
    />
  );
}

// Mini sparkline chart for cards
export interface MiniChartProps {
  data: { time: string | number; value: number }[];
  height?: number;
  color?: "primary" | "up" | "down";
  className?: string;
}

export function MiniChart({
  data,
  height = 60,
  color = "primary",
  className = "",
}: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const colorMap = {
      primary: isDark ? "#2dd4bf" : "#14b8a6",
      up: isDark ? "#22c55e" : "#16a34a",
      down: isDark ? "#ef4444" : "#dc2626",
    };

    const lineColor = colorMap[color];

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "transparent",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { mode: CrosshairMode.Hidden },
      handleScroll: false,
      handleScale: false,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: `${lineColor}30`,
      bottomColor: `${lineColor}05`,
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });

    const chartData: LineData[] = data.map((d) => ({
      time: (typeof d.time === "string"
        ? new Date(d.time).getTime() / 1000
        : d.time) as Time,
      value: d.value,
    }));

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height, color, isDark]);

  return <div ref={chartContainerRef} className={`w-full ${className}`} />;
}
