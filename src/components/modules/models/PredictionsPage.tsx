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
  const { data: predictions, isLoading, error, refetch } = useTodayPrediction();

  console.log('[PredictionsPage] Today predictions:', { predictions, isLoading, error });

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

  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-destructive text-center font-semibold">
            {error instanceof Error ? error.message : "Failed to load predictions"}
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

  // Handle empty predictions array
  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No predictions available for today yet. Predictions are generated daily at 9:29 AM ET.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Display all predictions in a grid
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {predictions.map((prediction) => {
          const isUp = prediction.direction === "UP";
          const isDown = prediction.direction === "DOWN";
          const isHold = prediction.direction === "HOLD";
          
          return (
            <motion.div
              key={prediction.ticker}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <span className="text-lg font-bold text-foreground">{prediction.ticker}</span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  isUp ? "bg-up/10 text-up" : isDown ? "bg-down/10 text-down" : "bg-muted text-muted-foreground"
                }`}>
                  {prediction.direction}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Direction Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isUp ? "bg-up/10" : isDown ? "bg-down/10" : "bg-muted"
                }`}>
                  {isUp ? (
                    <TrendingUp className="w-6 h-6 text-up" />
                  ) : isDown ? (
                    <TrendingDown className="w-6 h-6 text-down" />
                  ) : (
                    <Target className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Confidence</span>
                    <span className="font-medium text-foreground">
                      {((prediction.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(prediction.confidence || 0) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full ${isUp ? "bg-up" : isDown ? "bg-down" : "bg-primary"}`}
                    />
                  </div>
                </div>

                {/* Magnitude */}
                {prediction.magnitude !== undefined && Math.abs(prediction.magnitude) > 0.001 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expected Move</span>
                    <span className={`font-semibold ${isUp ? "text-up" : isDown ? "text-down" : "text-muted-foreground"}`}>
                      {prediction.magnitude > 0 ? '+' : ''}{(prediction.magnitude * 100).toFixed(2)}%
                    </span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
                  <Clock className="w-3 h-3" />
                  {prediction.date}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ============ Prediction History Item ============

function PredictionHistoryItem({ prediction, index }: { prediction: Prediction; index: number }) {
  const isUp = prediction.direction === "UP";
  const isDown = prediction.direction === "DOWN";
  const isHold = prediction.direction === "HOLD";

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
          isUp ? "bg-up/10" : isDown ? "bg-down/10" : "bg-muted"
        }`}
      >
        {isUp ? (
          <TrendingUp className="w-5 h-5 text-up" />
        ) : isDown ? (
          <TrendingDown className="w-5 h-5 text-down" />
        ) : (
          <Target className="w-5 h-5 text-muted-foreground" />
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
  const { data: history, isLoading: historyLoading, error: historyError } = usePredictionHistory(
    90, // days - fetch last 90 days
    page, // current page
    50 // page size
  );

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

