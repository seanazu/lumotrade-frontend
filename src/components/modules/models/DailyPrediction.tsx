"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Gauge,
  RefreshCw,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useTodayPrediction } from "@/hooks/useMLBackend";

export function DailyPrediction() {
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

  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-destructive text-center">
            {error instanceof Error ? error.message : "Failed to fetch prediction"}
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

  if (!prediction) {
    return null;
  }

  const isUp = prediction.direction === "UP";

  const getSignalStyles = () => {
    switch (prediction.signal_strength) {
      case "STRONG":
        return "bg-up/10 text-up border-up/30";
      case "MODERATE":
        return "bg-warning/10 text-warning border-warning/30";
      case "WEAK":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getConfidenceColor = () => {
    if (prediction.confidence >= 0.7) return "text-up";
    if (prediction.confidence >= 0.6) return "text-warning";
    if (prediction.confidence >= 0.55) return "text-orange-400";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`bg-card border rounded-xl overflow-hidden ${isUp ? "border-up/30" : "border-down/30"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{prediction.date}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Direction Indicator */}
          <div className="flex flex-col items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-4 ${
                isUp ? "bg-up/10" : "bg-down/10"
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-12 h-12 text-up" />
              ) : (
                <TrendingDown className="w-12 h-12 text-down" />
              )}
            </motion.div>

            <h2 className={`text-3xl font-bold mb-2 ${isUp ? "text-up" : "text-down"}`}>
              {prediction.direction}
            </h2>

            <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getSignalStyles()}`}>
              {prediction.signal_strength} SIGNAL
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Gauge className={`w-5 h-5 mx-auto mb-1 ${getConfidenceColor()}`} />
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className={`text-lg font-bold ${getConfidenceColor()}`}>
                {(prediction.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-lg font-bold text-foreground">
                {prediction.magnitude.toFixed(1)}%
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <div className="w-5 h-5 mx-auto mb-1 text-primary font-bold text-sm flex items-center justify-center">%</div>
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="text-lg font-bold text-foreground">
                {(prediction.position_size * 100).toFixed(0)}%
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-lg font-bold text-foreground">
                {(prediction.model_accuracy * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Trade Signal */}
          <div className={`p-4 rounded-lg text-center ${isUp ? "bg-up/5 border border-up/20" : "bg-down/5 border border-down/20"}`}>
            <p className="text-xs text-muted-foreground mb-1">Trade Signal</p>
            <p className={`text-xl font-bold ${isUp ? "text-up" : "text-down"}`}>
              {prediction.trade_signal}
            </p>
          </div>

          {/* Recommendation */}
          {prediction.recommendation && (
            <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono">
                {prediction.recommendation}
              </pre>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
