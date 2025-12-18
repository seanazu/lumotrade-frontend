"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";
import { Badge } from "@/components/design-system/atoms/Badge";
import {
  useTodayPrediction,
  useModelAccuracyStats,
  usePredictionHistory,
} from "@/hooks/useMLBackend";
import { cn } from "@/lib/utils";

// Mini Prediction Card for Ticker
function MiniPredictionCard({
  prediction,
  index,
}: {
  prediction: any;
  index: number;
}) {
  if (!prediction) return null;

  const isUp = prediction.direction === "UP";
  const confidence = Math.round(prediction.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative p-3 rounded-lg border overflow-hidden group cursor-pointer",
        isUp ? "bg-up/5 border-up/30" : "bg-down/5 border-down/30"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold font-mono">{prediction.ticker}</span>
        <Badge variant={isUp ? "bullish" : "bearish"} className="text-xs h-5">
          {prediction.direction}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {isUp ? (
          <TrendingUp className="h-4 w-4 text-up" />
        ) : (
          <TrendingDown className="h-4 w-4 text-down" />
        )}
        <div className="flex-1">
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                isUp ? "bg-up" : "bg-down"
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
        <span
          className={cn(
            "text-xs font-bold font-mono",
            isUp ? "text-up" : "text-down"
          )}
        >
          {confidence}%
        </span>
      </div>
    </motion.div>
  );
}

export function AIPredictionsSection() {
  const { data: todayPrediction, isLoading: predictionLoading } =
    useTodayPrediction();
  const { data: accuracyStats } = useModelAccuracyStats();
  const { data: historyData } = usePredictionHistory(7);

  const recentPredictions = historyData?.predictions?.slice(0, 4) || [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background rounded-2xl" />

      <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                AI Market Predictions
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium text-primary">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Live
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Automated predictions across 8 major tickers
              </p>
            </div>
          </div>
          <Link href="/model-monitor">
            <Button variant="outline" size="sm" className="gap-2 group">
              Full Dashboard
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        {accuracyStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-lg bg-background/50 border border-border/50"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Model Accuracy</p>
                <p className="text-lg font-bold font-mono">
                  {(accuracyStats.accuracy * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold font-mono">
                  {(accuracyStats.win_rate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Predictions
                </p>
                <p className="text-lg font-bold font-mono">
                  {accuracyStats.total_predictions}
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant="default" className="text-xs">
                72-73% Accuracy
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Predictions Grid */}
        {predictionLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Brain className="h-5 w-5 text-primary absolute inset-0 m-auto" />
              </div>
              <span className="text-sm text-muted-foreground">
                Loading AI predictions...
              </span>
            </div>
          </div>
        ) : recentPredictions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {recentPredictions.map((pred, i) => (
                <MiniPredictionCard
                  key={pred.id || i}
                  prediction={pred}
                  index={i}
                />
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center pt-4 border-t border-border"
            >
              <p className="text-xs text-muted-foreground mb-3">
                Predictions update daily at 9:29 AM ET. System is fully
                automated.
              </p>
              <Link href="/model-monitor">
                <Button className="gap-2 group">
                  <Zap className="h-4 w-4" />
                  View All Predictions
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground mb-1">
              No predictions available yet
            </p>
            <p className="text-xs text-muted-foreground">
              Check back on the next trading day at 9:30 AM ET
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
