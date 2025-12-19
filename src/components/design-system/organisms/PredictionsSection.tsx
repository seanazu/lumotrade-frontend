"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PredictionCard } from "@/components/design-system/molecules/PredictionCard";

interface Prediction {
  ticker: string;
  direction: "UP" | "DOWN" | "HOLD";
  confidence?: number;
  magnitude?: number;
  should_trade?: boolean;
  date: string;
  actual_return?: number | null;
  was_correct?: boolean | null;
}

interface PredictionsSectionProps {
  predictions: Prediction[];
  isLoading?: boolean;
}

/**
 * Predictions Section Component
 * Displays AI model predictions with expand/collapse functionality
 * Shows active trades for each prediction
 */
export function PredictionsSection({
  predictions,
  isLoading = false,
}: PredictionsSectionProps) {
  const [showAllPredictions, setShowAllPredictions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-primary/20 rounded-3xl p-4 sm:p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              AI Model Predictions
            </h2>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading predictions..."
                : showAllPredictions
                  ? `Showing all ${predictions?.length || 0} predictions`
                  : `${predictions?.length || 0} predictions • Showing 4`}
            </p>
          </div>
        </div>
        {predictions && predictions.length > 4 && (
          <button
            onClick={() => setShowAllPredictions(!showAllPredictions)}
            className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
          >
            {showAllPredictions
              ? "Show Less"
              : `View All (${predictions.length})`}{" "}
            <ArrowRight
              className={cn(
                "w-3 h-3 transition-transform",
                showAllPredictions && "rotate-90"
              )}
            />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 h-64 animate-pulse"
            >
              <div className="h-full flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-2" />
                <div className="h-4 bg-surface-2 rounded w-3/4" />
                <div className="h-4 bg-surface-2 rounded w-1/2" />
                <div className="flex-1" />
                <div className="h-4 bg-surface-2 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : predictions && predictions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {(showAllPredictions ? predictions : predictions.slice(0, 4)).map(
            (prediction, idx) => {
              return (
                <PredictionCard
                  key={prediction.id || prediction.ticker}
                  prediction={prediction}
                  index={idx}
                />
              );
            }
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No predictions available
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Model predictions will appear here
          </p>
        </div>
      )}
    </motion.div>
  );
}
