"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/tanstack-query/queryClient";
import { AppShell } from "@/components/design-system/organisms/AppShell";
import { StockHeader } from "@/components/analyzer/StockHeader";
import { ChartPanel } from "@/components/analyzer/ChartPanel";
import { TradingSignal } from "@/components/analyzer/TradingSignal";
import { KeyIndicators } from "@/components/analyzer/KeyIndicators";
import { FinancialsCard } from "@/components/analyzer/FinancialsCard";
import { EarningsCard } from "@/components/analyzer/EarningsCard";
import { AIInput } from "@/components/analyzer/AIInput";
import { NewsSection } from "@/components/analyzer/NewsSection";
import { RoadmapSection } from "@/components/analyzer/RoadmapSection";
import { InfoCards } from "@/components/analyzer/InfoCards";

// Generate mock OHLC data
const generateOHLCData = (basePrice: number, days: number = 90) => {
  const data = [];
  let price = basePrice * 0.85;
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const volatility = basePrice * 0.02;
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(1000000 + Math.random() * 5000000);

    data.push({
      time: date.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
  }
  return data;
};

function StockAnalyzer() {
  // Mock data - matches Figma design
  const stockData = {
    name: "NVIDIA Corp",
    ticker: "NVDA",
    industry: "TECHNOLOGY",
    price: 460.12,
    change: 11.24,
    changePercent: 2.5,
  };

  const indicators = [
    {
      label: "RSI (14)",
      value: "62.4",
      percentage: 62,
      color: "indigo" as const,
    },
    {
      label: "MACD",
      value: "+1.26",
      percentage: 75,
      color: "emerald" as const,
    },
    {
      label: "MACD Hi",
      value: "78.0",
      percentage: 78,
      color: "amber" as const,
    },
  ];

  const newsItems = [
    {
      text: "New partnership with Asian data centers confirmed for Q4",
      time: "1h ago",
    },
    { text: "Q4 2024 estimates upgraded, citing demand", time: "2h ago" },
    {
      text: "Analyst upgrades price target to $600 citing demand",
      time: "3h ago",
    },
    {
      text: "Sector rotation into semi-conductors observed this week",
      time: "4h ago",
    },
  ];

  const roadmapItems = [
    {
      quarter: "Q4 2025",
      event: "Launch of new AI chips in response to enterprise",
    },
    { quarter: "Q1 2024", event: "Datacenters ecosystem: Damascus" },
    { quarter: "Q2 2024", event: "New supply partnership reveal" },
  ];

  const chartData = generateOHLCData(stockData.price);

  return (
    <div className="min-h-screen bg-background">
      {/* Stock Header */}
      <StockHeader
        name={stockData.name}
        ticker={stockData.ticker}
        industry={stockData.industry}
        price={stockData.price}
        change={stockData.change}
        changePercent={stockData.changePercent}
      />

      {/* Info Cards - Horizontal Scroll */}
      <InfoCards />

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart */}
            <ChartPanel data={chartData} />

            {/* Trading Signal */}
            <TradingSignal
              signal="Bullish Trend Continuation"
              conviction="High Conviction"
              timeframe="+87 Timeframe"
              riskReward="Risk: 1.8x"
              entryZone="$468 - $462"
              takeProfit="$485.00"
              stopLoss="$452.00"
              rrRatio="1 : 3.2"
            />

            {/* News */}
            <NewsSection news={newsItems} />

            {/* Roadmap */}
            <RoadmapSection roadmap={roadmapItems} />
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-4">
            {/* Key Indicators */}
            <KeyIndicators indicators={indicators} />

            {/* Financials */}
            <FinancialsCard
              revenue="$13.5B"
              revenueChange="+58.07%"
              eps="$6.04B"
              epsChange="+66.09%"
            />

            {/* Upcoming Earnings */}
            <EarningsCard
              date="Nov 21"
              timing="After Market Close"
              estimate="$2.38"
              actual="$2.70"
            />

            {/* AI Input */}
            <AIInput />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzerPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell alertCount={0} userEmail="user@example.com">
        <StockAnalyzer />
      </AppShell>
    </QueryClientProvider>
  );
}
