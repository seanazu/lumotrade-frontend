"use client";

import { useState } from "react";
import { TradingChart } from "@/components/design-system/charts/TradingChart";
import { cn } from "@/lib/utils";

interface ChartPanelProps {
  data: any[];
}

export function ChartPanel({ data }: ChartPanelProps) {
  const [selectedView, setSelectedView] = useState("chart");
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState<"candles" | "indicators">(
    "candles"
  );

  const viewTabs = ["Chart", "Analysis", "Financials", "News", "Options"];
  const timeframes = ["1D", "1W", "1M", "3M", "1Y", "All"];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Top Controls */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {/* View Tabs */}
        <div className="flex gap-1">
          {viewTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedView(tab.toLowerCase())}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                selectedView === tab.toLowerCase()
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chart Type Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setChartType("candles")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
              chartType === "candles"
                ? "bg-muted text-foreground"
                : "text-muted-foreground"
            )}
          >
            Candles
          </button>
          <button
            onClick={() => setChartType("indicators")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
              chartType === "indicators"
                ? "bg-muted text-foreground"
                : "text-muted-foreground"
            )}
          >
            Indicators
          </button>
        </div>
      </div>

      {/* Timeframe Selector - Only show for Chart view */}
      {selectedView === "chart" && (
        <div className="flex gap-1 px-3 py-2 border-b border-border bg-muted/20">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium transition-colors",
                timeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="h-[450px] bg-background/50">
        {/* Chart View */}
        {selectedView === "chart" && (
          <TradingChart
            data={data}
            type="candlestick"
            height={450}
            showVolume={true}
            showGrid={true}
          />
        )}

        {/* Analysis View */}
        {selectedView === "analysis" && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <div>
              <h3 className="font-semibold text-sm mb-3">Technical Analysis</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Moving Averages</span>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                      BULLISH
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price above 20, 50, and 200-day moving averages. Strong
                    uptrend confirmed.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">RSI (14)</span>
                    <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold">
                      NEUTRAL
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    RSI at 62.4, indicating neither overbought nor oversold
                    conditions.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">MACD</span>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                      BULLISH
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MACD line above signal line with positive histogram. Bullish
                    momentum.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financials View */}
        {selectedView === "financials" && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <div>
              <h3 className="font-semibold text-sm mb-3">Financial Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">
                    Revenue (TTM)
                  </div>
                  <div className="text-lg font-bold">$13.5B</div>
                  <div className="text-xs text-emerald-500 font-medium">
                    +58.07% YoY
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">
                    Net Income
                  </div>
                  <div className="text-lg font-bold">$6.04B</div>
                  <div className="text-xs text-emerald-500 font-medium">
                    +66.09% YoY
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">EPS</div>
                  <div className="text-lg font-bold">$4.12</div>
                  <div className="text-xs text-emerald-500 font-medium">
                    +65.2% YoY
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">
                    P/E Ratio
                  </div>
                  <div className="text-lg font-bold">110.4</div>
                  <div className="text-xs text-muted-foreground">
                    Above sector avg
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">
                    Market Cap
                  </div>
                  <div className="text-lg font-bold">$1.14T</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">
                    Dividend Yield
                  </div>
                  <div className="text-lg font-bold">0.03%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News View */}
        {selectedView === "news" && (
          <div className="p-6 space-y-3 overflow-y-auto h-full">
            <h3 className="font-semibold text-sm mb-3">Latest News</h3>
            <div className="space-y-3">
              {[
                {
                  title: "NVIDIA announces breakthrough in AI chip performance",
                  time: "2 hours ago",
                  source: "Reuters",
                },
                {
                  title:
                    "Q4 earnings beat expectations with 58% revenue growth",
                  time: "1 day ago",
                  source: "Bloomberg",
                },
                {
                  title: "New data center contracts worth $2.5B signed",
                  time: "2 days ago",
                  source: "CNBC",
                },
                {
                  title: "Analyst upgrades price target to $600",
                  time: "3 days ago",
                  source: "Morgan Stanley",
                },
              ].map((news, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <h4 className="text-sm font-medium mb-1">{news.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options View */}
        {selectedView === "options" && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <div>
              <h3 className="font-semibold text-sm mb-3">Options Chain</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                  <div className="w-20">Strike</div>
                  <div className="w-20 text-right">Calls</div>
                  <div className="w-20 text-right">Puts</div>
                  <div className="w-20 text-right">IV</div>
                </div>
                {[
                  { strike: "450", calls: "12.50", puts: "3.20", iv: "32%" },
                  { strike: "460", calls: "8.30", puts: "5.80", iv: "35%" },
                  { strike: "470", calls: "4.90", puts: "9.10", iv: "38%" },
                  { strike: "480", calls: "2.40", puts: "14.50", iv: "42%" },
                ].map((option, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/30"
                  >
                    <div className="w-20 font-mono font-bold">
                      ${option.strike}
                    </div>
                    <div className="w-20 text-right text-emerald-500 font-mono">
                      ${option.calls}
                    </div>
                    <div className="w-20 text-right text-red-500 font-mono">
                      ${option.puts}
                    </div>
                    <div className="w-20 text-right text-muted-foreground font-mono text-xs">
                      {option.iv}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
