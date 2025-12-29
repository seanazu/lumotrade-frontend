"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/design-system/organisms/AppShell";
import { queryClient } from "@/lib/tanstack-query/queryClient";
import { Button } from "@/components/design-system/atoms/Button";
import { Save } from "lucide-react";
import {
  ThemeSettingsCard,
  TradingSettingsCard,
  ModelTrainingCard,
  BacktestSettingsCard,
  NotificationSettingsCard,
} from "@/features/settings";
import type { SettingsState } from "@/features/settings";

function SettingsContent() {
  const [settings, setSettings] = useState<SettingsState>({
    defaultIndex: "SPX",
    trainingLookbackDays: 730,
    validationSplit: 0.1,
    confidenceThreshold: 0.7,
    kellyFraction: 0.25,
    notificationsEnabled: true,
    emailNotifications: false,
    modelRefreshInterval: 24,
  });

  const [saved, setSaved] = useState(false);

  const handleUpdate = (updates: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/settings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "default", settings }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your preferences and model parameters
          </p>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Theme Settings */}
          <ThemeSettingsCard />

          {/* Trading Settings */}
          <TradingSettingsCard settings={settings} onUpdate={handleUpdate} />

          {/* Model Training Settings */}
          <ModelTrainingCard settings={settings} onUpdate={handleUpdate} />

          {/* Backtest Settings */}
          <BacktestSettingsCard settings={settings} onUpdate={handleUpdate} />

          {/* Notification Settings */}
          <NotificationSettingsCard settings={settings} onUpdate={handleUpdate} />

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reset
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <SettingsContent />
      </AppShell>
    </QueryClientProvider>
  );
}
