"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { AIThesisData } from "@/hooks/useAIThesis";

interface AIThesisCardProps {
  symbol: string;
  aiThesis?: AIThesisData;
  aiThesisLoading: boolean;
}

/**
 * AI Thesis Card
 * Displays AI-generated investment thesis with sentiment and conviction
 */
export const AIThesisCard = memo(function AIThesisCard({ symbol, aiThesis, aiThesisLoading }: AIThesisCardProps) {
  return (
    <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-xs">AI Thesis</h3>
        {aiThesis && (
          <span
            className={cn(
              "ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
              aiThesis.sentiment === "BULLISH" && "bg-emerald-500/10 text-emerald-500",
              aiThesis.sentiment === "BEARISH" && "bg-red-500/10 text-red-500",
              aiThesis.sentiment === "NEUTRAL" && "bg-amber-500/10 text-amber-500"
            )}
          >
            {aiThesis.sentiment}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-3">
        {aiThesis?.thesis || `Click Analyze to generate an AI thesis for ${symbol}.`}
      </p>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">
          {aiThesis?.conviction
            ? `${aiThesis.conviction} Conviction`
            : aiThesisLoading
              ? "Loading..."
              : "—"}
        </span>
        <button className="text-primary hover:underline">Ask AI →</button>
      </div>
    </div>
  );
});

AIThesisCard.displayName = "AIThesisCard";

