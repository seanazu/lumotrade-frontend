"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { IndexData } from "@/resources/mock-data/indexes";
import { formatPrice, formatPercentage } from "@/utils/formatting/numbers";
import { cn } from "@/lib/utils";

interface IndexCardProps {
  index: IndexData;
}

export const IndexCard: FC<IndexCardProps> = ({ index }) => {
  const isPositive = index.change >= 0;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "bg-card rounded-lg border border-border p-4 cursor-pointer",
        "hover:border-primary/30 hover:shadow-card-hover transition-all duration-200"
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{index.symbol}</p>
            <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{index.name}</p>
          </div>
          <div className={cn(
            "p-1.5 rounded-md",
            isPositive ? "bg-up/10" : "bg-down/10"
          )}>
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-up" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-down" />
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <span className="text-xl font-bold font-mono">
            ${formatPrice(index.price)}
          </span>
          <div className={cn(
            "text-sm font-medium font-mono",
            isPositive ? "text-up" : "text-down"
          )}>
            {isPositive ? "+" : ""}{formatPrice(index.change)} ({formatPercentage(index.changePercent)})
          </div>
        </div>

        {/* Range indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-2xs text-muted-foreground">
            <span>${formatPrice(index.p0)}</span>
            <span>${formatPrice(index.p90)}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isPositive ? "bg-up" : "bg-down"
              )}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, Math.max(0, ((index.price - index.p0) / (index.p90 - index.p0)) * 100))}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
