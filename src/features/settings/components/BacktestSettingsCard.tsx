"use client";

import { Card } from "@/components/design-system/atoms/Card";
import { BarChart3 } from "lucide-react";
import type { SettingsState } from "../types";

interface BacktestSettingsCardProps {
  settings: SettingsState;
  onUpdate: (updates: Partial<SettingsState>) => void;
}

/**
 * Backtest Settings Card
 * Configure backtesting parameters and risk management
 */
export function BacktestSettingsCard({ settings, onUpdate }: BacktestSettingsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Backtesting</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Confidence Threshold: {(settings.confidenceThreshold * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={settings.confidenceThreshold}
            onChange={(e) => onUpdate({ confidenceThreshold: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kelly Fraction: {(settings.kellyFraction * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.10"
            max="0.50"
            step="0.05"
            value={settings.kellyFraction}
            onChange={(e) => onUpdate({ kellyFraction: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}

BacktestSettingsCard.displayName = "BacktestSettingsCard";

