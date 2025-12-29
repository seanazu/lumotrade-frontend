"use client";

import { Card } from "@/components/design-system/atoms/Card";
import { Button } from "@/components/design-system/atoms/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

/**
 * Theme Settings Card
 * Allows users to switch between light and dark themes
 */
export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sun className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Appearance</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              <Sun className="w-4 h-4 mr-2" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              <Moon className="w-4 h-4 mr-2" />
              Dark
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

ThemeSettingsCard.displayName = "ThemeSettingsCard";

