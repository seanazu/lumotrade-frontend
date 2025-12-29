"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}

/**
 * StatCard Component
 * Displays a single metric with icon and optional trend indicator
 */
export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {trend && (
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                trend === "up"
                  ? "bg-up shadow-lg shadow-up/50"
                  : trend === "down"
                    ? "bg-down shadow-lg shadow-down/50"
                    : "bg-muted-foreground"
              )}
            />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}

StatCard.displayName = "StatCard";

