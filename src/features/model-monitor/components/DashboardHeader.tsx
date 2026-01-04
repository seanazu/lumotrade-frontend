"use client";

import { motion } from "framer-motion";
import {
  Brain,
  RefreshCw,
  BarChart3,
  Target,
  TrendingUpDown,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";
import { cn } from "@/lib/utils";
import type { TabId } from "../types";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "predictions", label: "Predictions", icon: Target },
  { id: "trades", label: "Trades", icon: TrendingUpDown },
  { id: "alpaca", label: "Account", icon: Wallet },
];

interface DashboardHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

/**
 * DashboardHeader Component
 * Header with branding, status, and tab navigation
 */
export function DashboardHeader({
  activeTab,
  onTabChange,
}: DashboardHeaderProps) {
  return (
    <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-xl blur-xl opacity-20" />
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                AI Trading System
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-up rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
                <span>•</span>
                <span>72-73% Accuracy</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

DashboardHeader.displayName = "DashboardHeader";
