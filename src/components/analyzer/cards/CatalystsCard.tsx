"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface Catalyst {
  event: string;
  date: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  description?: string;
}

interface CatalystsCardProps {
  catalysts: Catalyst[];
}

/**
 * Catalysts Card
 * Displays upcoming events and catalysts
 */
export const CatalystsCard = memo(function CatalystsCard({ catalysts }: CatalystsCardProps) {
  return (
    <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-purple-500/10 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-xs">Catalysts</h3>
      </div>
      <div className="space-y-2">
        {catalysts.length > 0 ? (
          catalysts.map((catalyst, i) => (
            <div key={i} className="p-2 rounded bg-muted/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{catalyst.event}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                    catalyst.importance === "HIGH" && "bg-red-500/10 text-red-500",
                    catalyst.importance === "MEDIUM" &&
                      "bg-amber-500/10 text-amber-500",
                    catalyst.importance === "LOW" && "bg-blue-500/10 text-blue-500"
                  )}
                >
                  {catalyst.importance}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {catalyst.date}{" "}
                {catalyst.description ? `- ${catalyst.description}` : ""}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No upcoming catalysts found</p>
        )}
      </div>
    </div>
  );
});

CatalystsCard.displayName = "CatalystsCard";

