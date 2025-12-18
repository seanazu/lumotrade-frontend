"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";
import { cn } from "@/lib/utils";

interface NewPredictionBannerProps {
  show: boolean;
  predictionSummary: {
    ticker: string;
    direction: "UP" | "DOWN";
    confidence: number;
    shouldTrade: boolean;
    timestamp: string;
  } | null;
  onDismiss: () => void;
  onRefresh?: () => void;
}

export function NewPredictionBanner({
  show,
  predictionSummary,
  onDismiss,
  onRefresh,
}: NewPredictionBannerProps) {
  if (!show || !predictionSummary) return null;

  const isUp = predictionSummary.direction === "UP";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <div
            className={cn(
              "relative rounded-xl border shadow-lg backdrop-blur-xl overflow-hidden",
              isUp
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-rose-500/10 border-rose-500/30"
            )}
          >
            {/* Animated gradient background */}
            <div
              className={cn(
                "absolute inset-0 opacity-30",
                isUp
                  ? "bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20"
                  : "bg-gradient-to-r from-rose-500/20 via-transparent to-rose-500/20"
              )}
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundImage: isUp
                    ? "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative flex items-center gap-4 p-4">
              {/* Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={cn(
                  "flex-shrink-0 p-3 rounded-full",
                  isUp ? "bg-emerald-500/20" : "bg-rose-500/20"
                )}
              >
                <Bell
                  className={cn(
                    "h-5 w-5",
                    isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">
                  🎯 New Prediction Available!
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {isUp ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                    )}
                    <span className="font-medium">{predictionSummary.ticker}</span>
                  </span>
                  <span className="text-2xs">•</span>
                  <span
                    className={cn(
                      "font-semibold",
                      isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {predictionSummary.direction}
                  </span>
                  <span className="text-2xs">•</span>
                  <span>{predictionSummary.confidence}% confidence</span>
                  {predictionSummary.shouldTrade && (
                    <>
                      <span className="text-2xs">•</span>
                      <span className="text-primary font-medium">Trade Signal</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {onRefresh && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="gap-1.5 h-8"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span className="text-xs">Refresh</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 h-1",
                isUp ? "bg-emerald-500" : "bg-rose-500"
              )}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 10, ease: "linear" }}
              onAnimationComplete={onDismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

