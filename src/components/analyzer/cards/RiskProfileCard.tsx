"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface RiskProfile {
  volatility: "HIGH" | "MEDIUM" | "LOW";
  beta?: number;
  shortInterest?: number;
  distance52WeekLow?: number;
}

interface RiskProfileCardProps {
  riskProfile: RiskProfile;
}

/**
 * Risk Profile Card
 * Displays risk metrics including volatility and short interest
 */
export const RiskProfileCard = memo(function RiskProfileCard({ riskProfile }: RiskProfileCardProps) {
  return (
    <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-xs">Risk Profile</h3>
        <span
          className={cn(
            "ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
            riskProfile.volatility === "HIGH" && "bg-red-500/10 text-red-500",
            riskProfile.volatility === "MEDIUM" && "bg-amber-500/10 text-amber-500",
            riskProfile.volatility === "LOW" && "bg-emerald-500/10 text-emerald-500"
          )}
        >
          {riskProfile.volatility || "Medium"}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              Volatility {riskProfile.beta ? `(Beta ${riskProfile.beta.toFixed(2)})` : ""}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold",
                riskProfile.volatility === "HIGH" && "text-red-500",
                riskProfile.volatility === "MEDIUM" && "text-amber-500",
                riskProfile.volatility === "LOW" && "text-emerald-500"
              )}
            >
              {riskProfile.volatility || "Medium"}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                riskProfile.volatility === "HIGH" && "w-4/5 bg-red-500",
                riskProfile.volatility === "MEDIUM" && "w-3/5 bg-amber-500",
                riskProfile.volatility === "LOW" && "w-2/5 bg-emerald-500"
              )}
            />
          </div>
        </div>
        {riskProfile.shortInterest !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Short Interest</span>
              <span className="text-[10px] font-bold text-emerald-500">
                {riskProfile.shortInterest.toFixed(1)}%
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${Math.min(riskProfile.shortInterest, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

RiskProfileCard.displayName = "RiskProfileCard";

