"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FinancialsCardProps {
  revenue: string;
  revenueChange: string;
  eps: string;
  epsChange: string;
}

export function FinancialsCard({
  revenue,
  revenueChange,
  eps,
  epsChange,
}: FinancialsCardProps) {
  // Parse percentage change from strings like "+15.3%" or "-5.2%"
  const parseChange = (change: string): number | null => {
    if (change === "N/A") return null;
    const match = change.match(/([+-]?\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  };

  const revenueChangeNum = parseChange(revenueChange);
  const epsChangeNum = parseChange(epsChange);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-4">Financials (TTM)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Revenue</div>
          <div className="font-bold font-mono text-lg">{revenue}</div>
          <div
            className={cn(
              "text-xs font-medium flex items-center gap-1",
              revenueChangeNum === null && "text-muted-foreground",
              revenueChangeNum !== null &&
                revenueChangeNum > 0 &&
                "text-emerald-500",
              revenueChangeNum !== null &&
                revenueChangeNum < 0 &&
                "text-red-500"
            )}
          >
            {revenueChangeNum !== null &&
              (revenueChangeNum > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : revenueChangeNum < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null)}
            {revenueChange}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">EPS</div>
          <div className="font-bold font-mono text-lg">{eps}</div>
          <div
            className={cn(
              "text-xs font-medium flex items-center gap-1",
              epsChangeNum === null && "text-muted-foreground",
              epsChangeNum !== null && epsChangeNum > 0 && "text-emerald-500",
              epsChangeNum !== null && epsChangeNum < 0 && "text-red-500"
            )}
          >
            {epsChangeNum !== null &&
              (epsChangeNum > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : epsChangeNum < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null)}
            {epsChange}
          </div>
        </div>
      </div>
    </div>
  );
}
