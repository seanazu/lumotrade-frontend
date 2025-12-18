"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Gauge,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useTodayPrediction, usePredictionHistory, type Prediction } from "@/hooks/useMLBackend";

// ============ Today's Prediction Card ============

function TodayPredictionCard() {
  const { data: prediction, isLoading, error, refetch } = useTodayPrediction();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-muted-foreground" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-card border border-destructive/30 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-destructive text-center">
            {error instanceof Error ? error.message : "Failed to load prediction"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg text-destructive transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isUp = prediction.direction === "UP";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">Today's Prediction</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="w-4 h-4" />
          {prediction.date}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-center gap-8">
          {/* Direction Indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
              isUp ? "bg-up/10" : "bg-down/10"
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-12 h-12 text-up" />
            ) : (
              <TrendingDown className="w-12 h-12 text-down" />
            )}
          </motion.div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className={`text-3xl font-bold ${isUp ? "text-up" : "text-down"}`}>
                {prediction.direction}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  prediction.signal_strength === "STRONG"
                    ? "bg-up/10 text-up"
                    : prediction.signal_strength === "MODERATE"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {prediction.signal_strength}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{prediction.trade_signal}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Gauge className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-lg font-bold text-foreground">
                {(prediction.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="text-lg font-bold text-foreground">
                {(prediction.position_size * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// ============ Prediction History Item ============

function PredictionHistoryItem({ prediction, index }: { prediction: Prediction; index: number }) {
  const isUp = prediction.direction === "UP";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
    >
      {/* Direction Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isUp ? "bg-up/10" : "bg-down/10"
        }`}
      >
        {isUp ? (
          <TrendingUp className="w-5 h-5 text-up" />
        ) : (
          <TrendingDown className="w-5 h-5 text-down" />
        )}
      </div>

      {/* Date & Direction */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{prediction.date}</p>
        <p className="text-sm text-muted-foreground truncate">{prediction.trade_signal}</p>
      </div>

      {/* Confidence */}
      <div className="text-right">
        <p className="font-medium text-foreground">
          {(prediction.confidence * 100).toFixed(0)}%
        </p>
        <p className="text-xs text-muted-foreground">confidence</p>
      </div>

      {/* Signal Strength Badge */}
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          prediction.signal_strength === "STRONG"
            ? "bg-up/10 text-up"
            : prediction.signal_strength === "MODERATE"
            ? "bg-warning/10 text-warning"
            : prediction.signal_strength === "WEAK"
            ? "bg-muted text-muted-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {prediction.signal_strength || "NO_TRADE"}
      </span>
    </motion.div>
  );
}

// ============ Pagination ============

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="px-4 py-2 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============ Main Component ============

export function PredictionsPage() {
  const [page, setPage] = useState(1);
  const { data: history, isLoading: historyLoading, error: historyError } = usePredictionHistory(page, 10);

  return (
    <div className="space-y-8">
      {/* Today's Prediction */}
      <section>
        <TodayPredictionCard />
      </section>

      {/* Prediction History */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Prediction History</h3>
          {history && (
            <span className="text-sm text-muted-foreground">
              {history.total} total predictions
            </span>
          )}
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-6 h-6 text-muted-foreground" />
            </motion.div>
          </div>
        ) : historyError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">Failed to load prediction history</p>
          </div>
        ) : history && history.predictions.length > 0 ? (
          <>
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                {history.predictions.map((pred, index) => (
                  <PredictionHistoryItem key={pred.date} prediction={pred} index={index} />
                ))}
              </AnimatePresence>
            </div>
            {history.total_pages > 1 && (
              <Pagination
                page={page}
                totalPages={history.total_pages}
                onPageChange={setPage}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Clock className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">No prediction history yet</p>
          </div>
        )}
      </section>
    </div>
  );
}

