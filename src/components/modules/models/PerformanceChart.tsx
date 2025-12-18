"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Calendar,
  RefreshCw,
  AlertCircle,
  Layers,
} from "lucide-react";
import { useModelStatus, useModelAccuracyStats } from "@/hooks/useMLBackend";

export function PerformanceChart() {
  const { data: status, isLoading: statusLoading } = useModelStatus();
  const { data: accuracy, isLoading: accuracyLoading, error, refetch } = useModelAccuracyStats();

  const isLoading = statusLoading || accuracyLoading;

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-center h-48">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !status?.loaded) {
    return (
      <div className="bg-card border border-warning/30 rounded-xl p-6">
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <AlertCircle className="w-10 h-10 text-warning" />
          <p className="text-warning text-sm text-center">
            {error ? "Failed to load model data" : "Model not trained yet"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-warning/10 hover:bg-warning/20 rounded-lg text-warning text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const accuracyPercent = (status.accuracy || 0) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (accuracyPercent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm font-medium text-foreground">Model Performance</span>
          <button
            onClick={() => refetch()}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Accuracy Ring */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-secondary"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                  {accuracyPercent.toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground">Accuracy</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Threshold</p>
              <p className="text-sm font-bold text-foreground">
                {((status.threshold || 0.5) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Layers className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Features</p>
              <p className="text-sm font-bold text-foreground">
                {status.features || 0}
              </p>
            </div>
          </div>

          {/* Version & Date */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm font-bold text-foreground">
                {status.version || "1.0.0"}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Trained</p>
              <p className="text-xs font-bold text-foreground">
                {formatDate(status.trained_at)}
              </p>
            </div>
          </div>

          {/* Ensemble Weights */}
          {accuracy?.weights && (
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Ensemble Weights</p>
              <div className="space-y-2">
                {[
                  { name: "LightGBM", weight: accuracy.weights.lightgbm, color: "bg-blue-500" },
                  { name: "CatBoost", weight: accuracy.weights.catboost, color: "bg-green-500" },
                  { name: "XGBoost", weight: accuracy.weights.xgboost, color: "bg-purple-500" },
                ].map((model) => (
                  <div key={model.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{model.name}</span>
                      <span className="text-muted-foreground">
                        {(model.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${model.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${model.weight * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
