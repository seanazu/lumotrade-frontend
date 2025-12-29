"use client";

import { Card } from "@/components/design-system/atoms/Card";
import { Bell } from "lucide-react";
import type { SettingsState } from "../types";

interface NotificationSettingsCardProps {
  settings: SettingsState;
  onUpdate: (updates: Partial<SettingsState>) => void;
}

/**
 * Notification Settings Card
 * Configure notification preferences
 */
export function NotificationSettingsCard({
  settings,
  onUpdate,
}: NotificationSettingsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive alerts for predictions and trades
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => onUpdate({ notificationsEnabled: e.target.checked })}
            className="w-5 h-5"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Email Notifications</p>
            <p className="text-sm text-muted-foreground">Receive daily briefings via email</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => onUpdate({ emailNotifications: e.target.checked })}
            className="w-5 h-5"
          />
        </div>
      </div>
    </Card>
  );
}

NotificationSettingsCard.displayName = "NotificationSettingsCard";

