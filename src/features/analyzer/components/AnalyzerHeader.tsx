"use client";

import { StockHeader } from "@/components/analyzer/StockHeader";

interface AnalyzerHeaderProps {
  name: string;
  ticker: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  onSymbolChange: (symbol: string) => void;
}

/**
 * Analyzer Header Component
 * Displays stock symbol, price, and company info with symbol search
 */
export function AnalyzerHeader({
  name,
  ticker,
  industry,
  price,
  change,
  changePercent,
  onSymbolChange,
}: AnalyzerHeaderProps) {
  return (
    <StockHeader
      name={name}
      ticker={ticker}
      industry={industry}
      price={price}
      change={change}
      changePercent={changePercent}
      onSymbolChange={onSymbolChange}
    />
  );
}

AnalyzerHeader.displayName = "AnalyzerHeader";
