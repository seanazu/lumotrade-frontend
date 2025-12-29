"use client";

import { memo } from "react";

interface KeyLevel {
  support1?: number;
  support2?: number;
  resistance1?: number;
  resistance2?: number;
}

interface KeyLevelsCardProps {
  keyLevels: KeyLevel;
}

/**
 * Key Levels Card
 * Displays support and resistance price levels
 */
export const KeyLevelsCard = memo(function KeyLevelsCard({ keyLevels }: KeyLevelsCardProps) {
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-xs">Key Levels</h3>
      </div>
      <div className="space-y-2">
        {keyLevels.resistance2 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Resistance 2</span>
            <span className="text-sm font-bold font-mono text-red-500">
              ${keyLevels.resistance2.toFixed(2)}
            </span>
          </div>
        )}
        {keyLevels.resistance1 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Resistance 1</span>
            <span className="text-sm font-bold font-mono text-red-500">
              ${keyLevels.resistance1.toFixed(2)}
            </span>
          </div>
        )}
        {keyLevels.support1 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Support 1</span>
            <span className="text-sm font-bold font-mono text-emerald-500">
              ${keyLevels.support1.toFixed(2)}
            </span>
          </div>
        )}
        {keyLevels.support2 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Support 2</span>
            <span className="text-sm font-bold font-mono text-emerald-500">
              ${keyLevels.support2.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

KeyLevelsCard.displayName = "KeyLevelsCard";

