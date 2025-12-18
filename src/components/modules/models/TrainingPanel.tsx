"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Loader2,
} from "lucide-react";
import { useTrainStatus, useTriggerTraining } from "@/hooks/useMLBackend";

export function TrainingPanel() {
  const [trials, setTrials] = useState(100);
  const { data: status, isLoading } = useTrainStatus();
  const triggerTraining = useTriggerTraining();

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  const isTraining = triggerTraining.isPending || status?.status === "in_progress";

  const handleStartTraining = () => {
    triggerTraining.mutate(trials);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Model Training</span>
          </div>
          <div className="flex items-center gap-2">
            {status?.status === "trained" && (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-up/10 border border-up/30 rounded-lg text-up text-xs">
                <CheckCircle className="w-3 h-3" />
                Trained
              </span>
            )}
            {isTraining && (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 border border-warning/30 rounded-lg text-warning text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Training
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Model Info */}
          {status?.status === "trained" && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                <p className="text-lg font-bold text-primary">
                  {((status.accuracy || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Version</p>
                <p className="text-lg font-bold text-foreground">
                  {status.version || "1.0.0"}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Trained</p>
                <p className="text-xs font-bold text-foreground">
                  {formatDate(status.trained_at)}
                </p>
              </div>
            </div>
          )}

          {/* Trials Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-muted-foreground">Optimization Trials</label>
              <span className="text-sm font-medium text-foreground">{trials}</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={trials}
              onChange={(e) => setTrials(parseInt(e.target.value))}
              disabled={isTraining}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Fast</span>
              <span>Balanced</span>
              <span>Thorough</span>
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            onClick={handleStartTraining}
            disabled={isTraining}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              isTraining
                ? "bg-warning/10 text-warning cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
            whileHover={!isTraining ? { scale: 1.01 } : {}}
            whileTap={!isTraining ? { scale: 0.99 } : {}}
          >
            <AnimatePresence mode="wait">
              {isTraining ? (
                <motion.div
                  key="training"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Training in Progress...
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {status?.status === "trained" ? "Retrain Model" : "Train Model"}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Error Message */}
          <AnimatePresence>
            {triggerTraining.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {triggerTraining.error instanceof Error
                  ? triggerTraining.error.message
                  : "Training failed"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Uses {trials} Optuna trials for hyperparameter optimization.
            More trials = better accuracy but longer training time.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
