"use client";

import { cn } from "@/lib/utils";

interface Indicator {
  label: string;
  value: string;
  percentage: number;
  color: "indigo" | "emerald" | "amber";
}

interface KeyIndicatorsProps {
  indicators: Indicator[];
}

export function KeyIndicators({ indicators }: KeyIndicatorsProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-4">Key Indicators</h3>
      <div className="space-y-3">
        {indicators.map((indicator, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">
                {indicator.label}
              </span>
              <span className="text-sm font-bold font-mono">
                {indicator.value}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  indicator.color === "indigo" && "bg-indigo-500",
                  indicator.color === "emerald" && "bg-emerald-500",
                  indicator.color === "amber" && "bg-amber-500"
                )}
                style={{ width: `${indicator.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
