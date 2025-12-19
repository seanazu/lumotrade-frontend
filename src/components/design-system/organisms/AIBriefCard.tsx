"use client";

import { Sparkles } from "lucide-react";
import { useTradingOpportunities } from "@/hooks/useTradingOpportunities";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MarketContextDisplay,
  OpportunityCard,
  PositionSizeInput,
} from "@/components/trading";

interface AIBriefCardProps {
  onChatClick?: () => void;
}

/**
 * Lumo's Picks - AI-powered trading opportunities
 *
 * Displays 1-2 high-probability trade setups with:
 * - Entry, target, and stop loss prices
 * - Risk/reward ratios and win rates
 * - Position sizing calculator
 * - Market regime and sentiment context
 */
export function AIBriefCard({ onChatClick }: AIBriefCardProps) {
  const { data, isLoading } = useTradingOpportunities();
  const [positionRisk, setPositionRisk] = useState(500);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const opportunities = data?.opportunities || [];
  const marketContext = data?.marketContext;

  const handleAnalyze = (symbol: string) => {
    startTransition(() => {
      router.push(`/analyzer?symbol=${symbol}`);
    });
  };

  return (
    <div
      className="relative neon-border-card w-full lg:w-96 xl:w-[380px] 2xl:w-[420px] flex-shrink-0 mb-1.5"
      // style={{ height: "641px" }}
    >
      <div className="w-full h-full bg-card border border-border rounded-2xl lg:rounded-[23px] overflow-hidden flex flex-col">
        {/* Gradient blur effect at top right */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-100 pointer-events-none z-0"
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            filter: "blur(20px)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-4 sm:p-6">
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-indigo-500">
                  Lumo&apos;s Picks
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5px]">
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Market Context */}
          {marketContext && (
            <div className="mb-2">
              <MarketContextDisplay context={marketContext} />
            </div>
          )}

          {/* Trading Opportunities */}
          <div className="flex-1 overflow-y-auto mb-2 space-y-2.5 pr-1">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              </div>
            )}

            {!isLoading && opportunities.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {data?.message ||
                    "No high-probability setups found. Stand aside and wait for better opportunities."}
                </p>
              </div>
            )}

            {!isLoading &&
              opportunities.map((opportunity, idx) => (
                <OpportunityCard
                  key={idx}
                  opportunity={opportunity}
                  positionRisk={positionRisk}
                  isPending={isPending}
                  onAnalyze={handleAnalyze}
                />
              ))}
          </div>

          {/* Position Risk Input */}
          {opportunities.length > 0 && (
            <div className="mt-auto">
              <PositionSizeInput
                value={positionRisk}
                onChange={setPositionRisk}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
