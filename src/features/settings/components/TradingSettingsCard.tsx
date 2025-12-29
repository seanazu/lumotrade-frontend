"use client";

import { Card } from "@/components/design-system/atoms/Card";
import { TrendingUp } from "lucide-react";
import type { SettingsState } from "../types";

interface TradingSettingsCardProps {
  settings: SettingsState;
  onUpdate: (updates: Partial<SettingsState>) => void;
}

/**
 * Trading Settings Card
 * Configure default trading index and preferences
 */
export function TradingSettingsCard({ settings, onUpdate }: TradingSettingsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Trading</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Default Index
          </label>
          <select
            value={settings.defaultIndex}
            onChange={(e) => onUpdate({ defaultIndex: e.target.value })}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground"
          >
            <option value="SPX">S&P 500 (SPX)</option>
            <option value="NDX">Nasdaq 100 (NDX)</option>
            <option value="DJI">Dow Jones (DJI)</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

TradingSettingsCard.displayName = "TradingSettingsCard";

