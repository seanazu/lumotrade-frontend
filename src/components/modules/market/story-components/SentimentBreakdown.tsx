"use client";

import { useMemo, memo, type FC } from "react";
import { motion } from "framer-motion";
import { Newspaper, CheckCircle, MinusCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketStory } from "@/resources/mock-data/indexes";

interface SentimentBreakdownProps {
  stories: MarketStory[];
}

/**
 * Sentiment Breakdown Component
 * Displays visual breakdown of news sentiment (bullish/bearish/neutral)
 */
export const SentimentBreakdown: FC<SentimentBreakdownProps> = memo(function SentimentBreakdown({ stories }) {
  const breakdown = useMemo(() => {
    const bullish = stories.filter((s) => s.sentiment === "bullish").length;
    const bearish = stories.filter((s) => s.sentiment === "bearish").length;
    const neutral = stories.filter((s) => s.sentiment === "neutral").length;
    const total = stories.length;

    return {
      bullish,
      bearish,
      neutral,
      bullishPct: total > 0 ? Math.round((bullish / total) * 100) : 0,
      bearishPct: total > 0 ? Math.round((bearish / total) * 100) : 0,
      neutralPct: total > 0 ? Math.round((neutral / total) * 100) : 0,
    };
  }, [stories]);

  const overallSentiment =
    breakdown.bullish > breakdown.bearish + 2
      ? "bullish"
      : breakdown.bearish > breakdown.bullish + 2
        ? "bearish"
        : "mixed";

  return (
    <div className="mb-4 p-4 rounded-lg bg-surface-2 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-muted-foreground" />
          News Sentiment Today
        </h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            overallSentiment === "bullish" && "bg-up/10 text-up",
            overallSentiment === "bearish" && "bg-down/10 text-down",
            overallSentiment === "mixed" && "bg-muted text-muted-foreground"
          )}
        >
          {overallSentiment === "bullish"
            ? "Overall Positive"
            : overallSentiment === "bearish"
              ? "Overall Negative"
              : "Mixed Signals"}
        </span>
      </div>

      {/* Visual bar */}
      <div className="h-3 rounded-full overflow-hidden bg-surface-3 flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.bullishPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-up h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.neutralPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="bg-muted h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.bearishPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="bg-down h-full"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-up" />
          <span className="text-muted-foreground">Bullish ({breakdown.bullish})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MinusCircle className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Neutral ({breakdown.neutral})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-down" />
          <span className="text-muted-foreground">Bearish ({breakdown.bearish})</span>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        {overallSentiment === "bullish"
          ? "More positive news today suggests market optimism. This often correlates with upward price movement."
          : overallSentiment === "bearish"
            ? "More negative news today suggests market caution. This often correlates with downward price pressure."
            : "News sentiment is mixed today, suggesting uncertainty. Watch for clearer trends to develop."}
      </p>
    </div>
  );
});

SentimentBreakdown.displayName = "SentimentBreakdown";

