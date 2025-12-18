"use client";

import { type FC, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Zap,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";
import { Badge } from "@/components/design-system/atoms/Badge";
import {
  useTodayPrediction,
  useModelAccuracyStats,
} from "@/hooks/useMLBackend";
import { cn } from "@/lib/utils";

// ACTUAL MODEL TICKERS
const INDEX_ETF_MAP = {
  SPY: {
    bull: "SPXL",
    bear: "SPXS",
    name: "S&P 500",
    category: "Equity",
    leverage: "3x",
  },
  QQQ: {
    bull: "TQQQ",
    bear: "SQQQ",
    name: "Nasdaq-100",
    category: "Equity",
    leverage: "3x",
  },
  IWM: {
    bull: "TNA",
    bear: "TZA",
    name: "Russell 2000",
    category: "Equity",
    leverage: "3x",
  },
  GLD: {
    bull: "NUGT",
    bear: "DUST",
    name: "Gold",
    category: "Commodity",
    leverage: "3x",
  },
  HYG: {
    bull: "None",
    bear: "None",
    name: "High Yield Bonds",
    category: "Fixed Income",
    leverage: "1x",
  },
  TLT: {
    bull: "TMF",
    bear: "TMV",
    name: "20Y Treasury",
    category: "Fixed Income",
    leverage: "3x",
  },
  XLF: {
    bull: "FAS",
    bear: "FAZ",
    name: "Financial Sector",
    category: "Sector",
    leverage: "3x",
  },
  XLK: {
    bull: "TECL",
    bear: "TECS",
    name: "Technology Sector",
    category: "Sector",
    leverage: "3x",
  },
};

interface PredictionCardProps {
  ticker: string;
  direction: "UP" | "DOWN";
  confidence: number;
  expectedReturn?: number; // q50 median expected return
  index: number;
}

const PredictionCard: FC<PredictionCardProps> = ({
  ticker,
  direction,
  confidence,
  expectedReturn,
  index,
}) => {
  const info = INDEX_ETF_MAP[ticker as keyof typeof INDEX_ETF_MAP];
  if (!info) return null;

  const isUp = direction === "UP";
  const recommendedETF = isUp ? info.bull : info.bear;
  const confidencePercent = Math.round(confidence * 100);
  const hasLeveragedETF = recommendedETF !== "None";

  // Flip expected return sign to match direction for visual consistency
  // DOWN predictions = negative, UP predictions = positive
  let expectedReturnPercent: string | null = null;
  if (expectedReturn !== undefined && expectedReturn !== null) {
    const absReturn = Math.abs(expectedReturn * 100);
    const sign = isUp ? "+" : "-";
    expectedReturnPercent = `${sign}${absReturn.toFixed(2)}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.2,
      }}
      whileHover={{ y: -1, transition: { duration: 0.1 } }}
      className="group relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/40 transition-all duration-150 shadow-sm"
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-semibold text-sm text-foreground">
                {ticker}
              </span>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground">
                {info.category}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{info.name}</p>
          </div>
          <Badge
            variant={isUp ? "bullish" : "bearish"}
            className="text-[10px] font-semibold px-1.5 py-0.5"
          >
            {direction}
          </Badge>
        </div>

        {/* Confidence & Expected Return */}
        <div className="mb-2 space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Confidence
              </span>
              <span
                className={cn(
                  "text-sm font-bold font-mono",
                  isUp ? "text-up" : "text-down"
                )}
              >
                {confidencePercent}%
              </span>
            </div>
            <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercent}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.03 + 0.1,
                }}
                className={cn(
                  "h-full rounded-full",
                  isUp ? "bg-up" : "bg-down"
                )}
              />
            </div>
          </div>
          {expectedReturnPercent !== null && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                Expected
              </span>
              <span
                className={cn(
                  "text-xs font-bold font-mono",
                  isUp ? "text-up" : "text-down"
                )}
              >
                {expectedReturnPercent}%
              </span>
            </div>
          )}
        </div>

        {/* ETF */}
        {hasLeveragedETF && (
          <div
            className={cn(
              "flex items-center justify-between px-2 py-1.5 rounded-md border text-xs",
              isUp ? "bg-up/5 border-up/20" : "bg-down/5 border-down/20"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">
                {info.leverage} Leveraged
              </p>
              <p
                className={cn(
                  "font-bold font-mono text-sm",
                  isUp ? "text-up" : "text-down"
                )}
              >
                ${recommendedETF}
              </p>
            </div>
            {isUp ? (
              <TrendingUp className="h-3.5 w-3.5 text-up flex-shrink-0" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-down flex-shrink-0" />
            )}
          </div>
        )}
        {!hasLeveragedETF && (
          <div className="px-2 py-1.5 rounded-md bg-muted/20 border border-border">
            <p className="text-[10px] text-muted-foreground">Trade Directly</p>
            <p className="font-bold font-mono text-sm text-foreground">
              ${ticker}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const MultiIndexPredictionCard: FC = () => {
  const { data: todayPredictions, isLoading } = useTodayPrediction();
  const { data: accuracyStats } = useModelAccuracyStats();
  const [showAll, setShowAll] = useState(false);

  const predictions = useMemo(() => {
    if (!todayPredictions || !Array.isArray(todayPredictions)) return [];

    // Filter to only the 8 model tickers and exclude HOLD (internal use only)
    const modelTickers = Object.keys(INDEX_ETF_MAP);
    return todayPredictions
      .filter(
        (pred) =>
          modelTickers.includes(pred.ticker) && pred.direction !== "HOLD" // HOLD is for internal trade logic, not for display
      )
      .map((pred) => ({
        ticker: pred.ticker,
        direction: pred.direction,
        confidence: pred.confidence || 0.5,
        expectedReturn: (pred as any).q50, // median expected return
      }))
      .sort((a, b) => b.confidence - a.confidence); // Sort by confidence descending
  }, [todayPredictions]);

  const bestOpportunity = useMemo(() => {
    if (predictions.length === 0) return null;
    return predictions.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }, [predictions]);

  const displayedPredictions = showAll ? predictions : predictions.slice(0, 6);
  const hasMore = predictions.length > 6;

  if (isLoading) {
    return (
      <div className="min-h-[280px] bg-card border border-border rounded-lg p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
            <Brain className="h-6 w-6 text-primary absolute inset-0 m-auto" />
          </div>
          <p className="text-sm text-muted-foreground">Analyzing markets...</p>
        </div>
      </div>
    );
  }

  if (!todayPredictions || predictions.length === 0) {
    return (
      <div className="min-h-[280px] bg-card border border-border rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-sm font-medium text-foreground mb-1">
            No Predictions Available
          </p>
          <p className="text-xs text-muted-foreground">
            Check back on the next trading day at 9:30 AM ET
          </p>
        </div>
      </div>
    );
  }

  const bestETF = bestOpportunity
    ? INDEX_ETF_MAP[bestOpportunity.ticker as keyof typeof INDEX_ETF_MAP]
    : null;
  const bestETFSymbol = bestOpportunity
    ? bestOpportunity.direction === "UP"
      ? bestETF?.bull
      : bestETF?.bear
    : null;

  return (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                AI Market Predictions
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full text-[10px] font-medium text-primary">
                  <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                8 tickers • Equity, Commodity & Fixed Income
              </p>
            </div>
          </div>

          {/* Stats */}
          {accuracyStats && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground">Accuracy</p>
                  <p className="text-sm font-bold font-mono text-primary">
                    {(accuracyStats.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Win Rate</p>
                  <p className="text-sm font-bold font-mono text-up">
                    {(accuracyStats.win_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <Link href="/model-monitor">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 group h-8 text-xs"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Dashboard
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Top Opportunity */}
        {bestOpportunity && bestETFSymbol && bestETFSymbol !== "None" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "mb-4 p-3 rounded-lg border flex items-center justify-between",
              bestOpportunity.direction === "UP"
                ? "bg-up/5 border-up/20"
                : "bg-down/5 border-down/20"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "p-1.5 rounded-md",
                  bestOpportunity.direction === "UP" ? "bg-up/15" : "bg-down/15"
                )}
              >
                <Zap
                  className={cn(
                    "h-4 w-4",
                    bestOpportunity.direction === "UP" ? "text-up" : "text-down"
                  )}
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                  Top Opportunity
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {bestETF?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold font-mono text-foreground">
                ${bestETFSymbol}
              </p>
              <Badge
                variant={
                  bestOpportunity.direction === "UP" ? "bullish" : "bearish"
                }
                className="text-[10px] px-2 py-0.5"
              >
                {bestOpportunity.direction}{" "}
                {Math.round(bestOpportunity.confidence * 100)}%
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-3">
          <AnimatePresence mode="sync">
            {displayedPredictions.map((pred, i) => (
              <PredictionCard
                key={pred.ticker}
                ticker={pred.ticker}
                direction={pred.direction}
                confidence={pred.confidence}
                expectedReturn={pred.expectedReturn}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Show More */}
        {hasMore && (
          <div className="flex justify-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="gap-1 text-xs h-7"
            >
              {showAll ? "Show Less" : `Show All ${predictions.length}`}
              <Sparkles className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground text-center">
            Updated daily at 9:29 AM ET • Fully automated
          </p>
        </div>
      </div>
    </div>
  );
};
