"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  isLive?: boolean;
}

/**
 * Page Header Component
 * Displays page title with optional LIVE indicator and subtitle
 */
export function PageHeader({
  title,
  subtitle,
  isLive = false,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-500 uppercase tracking-[0.5px] shadow-sm animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            LIVE
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
