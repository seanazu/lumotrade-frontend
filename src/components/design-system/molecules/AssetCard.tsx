"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AssetCardProps {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  icon: React.ReactNode;
  delay?: number;
}

/**
 * Asset Card Component
 * Displays asset information with price, change, and mini chart
 */
export function AssetCard({
  name,
  symbol,
  price,
  changePercent,
  icon,
  delay = 0,
}: AssetCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-card border border-border rounded-xl hover:border-primary/50 cursor-pointer p-2.5 sm:p-3 shadow-sm hover:shadow-md dark:hover:shadow-lg relative overflow-hidden group"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Header: Icon, Title, Symbol */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[11px] sm:text-xs text-foreground truncate leading-none">
              {name}
            </h3>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground truncate mt-0.5">
              {symbol}
            </p>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="w-full h-5 sm:h-6 mb-1.5 sm:mb-2">
          <svg
            className="w-full h-full"
            viewBox="0 0 80 40"
            preserveAspectRatio="none"
          >
            <path
              d={
                isPositive
                  ? "M 0 35 Q 20 30 40 25 T 80 15"
                  : "M 0 15 Q 20 20 40 25 T 80 35"
              }
              fill="none"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Price and Percentage */}
        <div>
          <div className="text-sm sm:text-base font-bold text-foreground truncate leading-none">
            {price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div
            className={cn(
              "text-[9px] sm:text-[10px] font-bold mt-0.5",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}

