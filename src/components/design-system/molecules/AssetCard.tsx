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
  sparklineData?: number[];
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
  sparklineData,
}: AssetCardProps) {
  const isPositive = changePercent >= 0;

  // Generate SVG path from sparkline data
  const generateSparklinePath = (data: number[] | undefined): string => {
    if (!data || data.length < 2) {
      // Fallback to simple curve if no data
      return isPositive
        ? "M 0 35 Q 20 30 40 25 T 80 15"
        : "M 0 15 Q 20 20 40 25 T 80 35";
    }

    const width = 80;
    const height = 40;
    const padding = 2;

    // Find min and max for normalization
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero

    // Generate path points
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return { x, y };
    });

    // Create smooth path using quadratic curves
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      if (i === 1) {
        // First curve
        path += ` L ${curr.x} ${curr.y}`;
      } else {
        // Smooth curve through points
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
        
        if (i === points.length - 1) {
          // Last point
          path += ` L ${curr.x} ${curr.y}`;
        }
      }
    }

    return path;
  };

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
              d={generateSparklinePath(sparklineData)}
              fill="none"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
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
            {Number(changePercent).toFixed(2)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
