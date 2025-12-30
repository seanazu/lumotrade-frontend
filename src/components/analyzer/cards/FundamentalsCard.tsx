"use client";

import { memo } from "react";

interface Quote {
  marketCap?: number;
  pe?: number;
  eps?: number;
  volume: number;
}

interface RiskProfile {
  distance52WeekLow?: number;
}

interface FundamentalsCardProps {
  quote: Quote;
  riskProfile: RiskProfile;
}

/**
 * Fundamentals Card
 * Displays key fundamental metrics
 */
export const FundamentalsCard = memo(function FundamentalsCard({ quote, riskProfile }: FundamentalsCardProps) {
  return (
    <div className="w-56 sm:w-64 bg-background rounded-lg border border-border p-3 sm:p-4 flex-shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-[11px] sm:text-xs">Fundamentals</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">Mkt Cap</div>
          <div className="text-xs sm:text-sm font-bold">
            {quote.marketCap ? `$${(quote.marketCap / 1e9).toFixed(1)}B` : "N/A"}
          </div>
          {quote.pe && (
            <div className="text-[8px] sm:text-[9px] text-muted-foreground">
              P/E: {quote.pe.toFixed(1)}
            </div>
          )}
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">EPS</div>
          <div className="text-xs sm:text-sm font-bold">
            {quote.eps ? `$${quote.eps.toFixed(2)}` : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">Volume</div>
          <div className="text-xs sm:text-sm font-bold">{(quote.volume / 1e6).toFixed(1)}M</div>
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">52W Range</div>
          <div className="text-[8px] sm:text-[9px] font-bold">
            {riskProfile.distance52WeekLow !== undefined
              ? `${riskProfile.distance52WeekLow.toFixed(0)}% from low`
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
});

FundamentalsCard.displayName = "FundamentalsCard";

