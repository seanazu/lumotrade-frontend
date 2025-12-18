"use client";

import { type FC, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, TrendingDown, Activity, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyLevel {
  price: number;
  label: string;
  type: "support" | "resistance" | "ma" | "current";
  description?: string;
}

interface KeyLevelsProps {
  currentPrice: number;
  levels: KeyLevel[];
  high52Week?: number;
  low52Week?: number;
  className?: string;
}

export const KeyLevels: FC<KeyLevelsProps> = ({
  currentPrice,
  levels,
  high52Week,
  low52Week,
  className,
}) => {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  // Sort levels by price (highest to lowest)
  const sortedLevels = useMemo(() => {
    const allLevels = [...levels];

    // Add current price if not already included
    if (!allLevels.find((l) => l.type === "current")) {
      allLevels.push({
        price: currentPrice,
        label: "Current",
        type: "current",
      });
    }

    return allLevels.sort((a, b) => b.price - a.price);
  }, [levels, currentPrice]);

  const getDistanceFromCurrent = (price: number) => {
    const diff = ((price - currentPrice) / currentPrice) * 100;
    return diff;
  };

  // Get icon for level type
  const getLevelIcon = (type: string) => {
    switch (type) {
      case "resistance":
        return TrendingDown;
      case "support":
        return TrendingUp;
      case "ma":
        return Activity;
      case "current":
        return Minus;
      default:
        return Minus;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-2xl bg-gradient-to-br from-surface-2/50 to-surface-2/30 border border-border backdrop-blur-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Key Price Levels</h3>
        </div>
        <span className="text-2xs text-muted-foreground/60">SPY • Live</span>
      </div>

      {/* Professional Price Ladder */}
      <div className="space-y-2">
        {sortedLevels.map((level, index) => {
          const Icon = getLevelIcon(level.type);
          const distance = getDistanceFromCurrent(level.price);
          const isCurrent = level.type === "current";
          const isAbove = level.price > currentPrice;
          const isHovered = hoveredLevel === `${level.label}-${level.price}`;

          return (
            <motion.div
              key={`${level.label}-${level.price}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onHoverStart={() => setHoveredLevel(`${level.label}-${level.price}`)}
              onHoverEnd={() => setHoveredLevel(null)}
              className={cn(
                "group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-default",
                isCurrent && "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-sm shadow-primary/10",
                !isCurrent && level.type === "support" && "bg-gradient-to-r from-emerald-500/[0.06] to-transparent border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-sm hover:shadow-emerald-500/5",
                !isCurrent && level.type === "resistance" && "bg-gradient-to-r from-rose-500/[0.06] to-transparent border-rose-500/20 hover:border-rose-500/40 hover:shadow-sm hover:shadow-rose-500/5",
                !isCurrent && level.type === "ma" && "bg-gradient-to-r from-blue-500/[0.06] to-transparent border-blue-500/20 hover:border-blue-500/40 hover:shadow-sm hover:shadow-blue-500/5",
                isHovered && "scale-[1.02]"
              )}
            >
              {/* Level Indicator Line */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300",
                isCurrent && "bg-gradient-to-b from-primary via-primary to-primary/50",
                !isCurrent && level.type === "support" && "bg-gradient-to-b from-emerald-500 to-emerald-500/50",
                !isCurrent && level.type === "resistance" && "bg-gradient-to-b from-rose-500 to-rose-500/50",
                !isCurrent && level.type === "ma" && "bg-gradient-to-b from-blue-500 to-blue-500/50",
                isHovered && "w-1.5"
              )} />

              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 p-2 rounded-lg transition-colors",
                isCurrent && "bg-primary/20",
                !isCurrent && level.type === "support" && "bg-emerald-500/10 group-hover:bg-emerald-500/20",
                !isCurrent && level.type === "resistance" && "bg-rose-500/10 group-hover:bg-rose-500/20",
                !isCurrent && level.type === "ma" && "bg-blue-500/10 group-hover:bg-blue-500/20"
              )}>
                <Icon className={cn(
                  "h-3.5 w-3.5",
                  isCurrent && "text-primary",
                  !isCurrent && level.type === "support" && "text-emerald-600 dark:text-emerald-400",
                  !isCurrent && level.type === "resistance" && "text-rose-600 dark:text-rose-400",
                  !isCurrent && level.type === "ma" && "text-blue-600 dark:text-blue-400"
                )} />
              </div>

              {/* Level Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn(
                    "text-xs font-medium",
                    isCurrent && "text-primary",
                    !isCurrent && level.type === "support" && "text-emerald-600 dark:text-emerald-400",
                    !isCurrent && level.type === "resistance" && "text-rose-600 dark:text-rose-400",
                    !isCurrent && level.type === "ma" && "text-blue-600 dark:text-blue-400"
                  )}>
                    {level.label}
                  </span>
                  {level.description && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-2xs text-muted-foreground/60 truncate">
                        {level.description}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-foreground">
                    ${level.price.toFixed(2)}
                  </span>
                  {!isCurrent && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span className={cn(
                        "text-2xs font-mono font-medium",
                        isAbove ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {isAbove ? "+" : ""}{distance.toFixed(2)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Distance Badge */}
              {!isCurrent && (
                <div className={cn(
                  "flex-shrink-0 px-2 py-1 rounded-md text-2xs font-medium transition-colors",
                  isAbove && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  !isAbove && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}>
                  {isAbove ? "Above" : "Below"}
                </div>
              )}

              {/* Current Badge */}
              {isCurrent && (
                <div className="flex-shrink-0 px-2 py-1 rounded-md bg-primary/20 text-2xs font-bold text-primary">
                  LIVE
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 52-Week Range Footer */}
      {(high52Week || low52Week) && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-2xs">
            {low52Week && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60">52W Low:</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  ${low52Week.toFixed(2)}
                </span>
              </div>
            )}
            {high52Week && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60">52W High:</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  ${high52Week.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Wrapper with sample data
export const KeyLevelsWithData: FC<{
  className?: string;
  currentPrice?: number;
  sma50?: number;
  sma200?: number;
}> = ({ className, currentPrice = 590.5, sma50 = 580.25, sma200 = 565.80 }) => {
  const levels: KeyLevel[] = [
    { price: 600, label: "R1", type: "resistance", description: "Key resistance" },
    { price: 595, label: "R2", type: "resistance" },
    { price: currentPrice, label: "Current", type: "current" },
    { price: sma50, label: "50 SMA", type: "ma" },
    { price: 575, label: "S1", type: "support" },
    { price: sma200, label: "200 SMA", type: "ma" },
    { price: 555, label: "S2", type: "support" },
  ];

  return (
    <KeyLevels
      currentPrice={currentPrice}
      levels={levels}
      high52Week={610.5}
      low52Week={510.25}
      className={className}
    />
  );
};

