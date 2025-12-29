"use client";

import { Card } from "@/components/design-system/atoms/Card";
import { Brain } from "lucide-react";
import type { SettingsState } from "../types";

interface ModelTrainingCardProps {
  settings: SettingsState;
  onUpdate: (updates: Partial<SettingsState>) => void;
}

/**
 * Model Training Settings Card
 * Configure ML model training parameters
 */
export function ModelTrainingCard({ settings, onUpdate }: ModelTrainingCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Model Training</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Training Lookback Days: {settings.trainingLookbackDays}
          </label>
          <input
            type="range"
            min="30"
            max="1825"
            step="30"
            value={settings.trainingLookbackDays}
            onChange={(e) => onUpdate({ trainingLookbackDays: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>30 days</span>
            <span>5 years</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Validation Split: {(settings.validationSplit * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.05"
            max="0.30"
            step="0.05"
            value={settings.validationSplit}
            onChange={(e) => onUpdate({ validationSplit: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Model Refresh Interval: {settings.modelRefreshInterval} hours
          </label>
          <input
            type="range"
            min="1"
            max="168"
            step="1"
            value={settings.modelRefreshInterval}
            onChange={(e) => onUpdate({ modelRefreshInterval: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}

ModelTrainingCard.displayName = "ModelTrainingCard";

