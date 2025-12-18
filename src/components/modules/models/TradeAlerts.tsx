"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useTodayAlert } from "@/hooks/useMLBackend";

export function TradeAlerts() {
  const { data: alert, isLoading, error, refetch } = useTodayAlert();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-center h-32">
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

  if (error) {
    return (
      <div className="bg-card border border-destructive/30 rounded-xl p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Failed to load alerts</span>
        </div>
      </div>
    );
  }

  if (!alert) return null;

  const signal = alert.signal;
  const hasAlert = alert.has_alert && signal;

  const getSignalStyles = () => {
    if (!signal) return { bg: "bg-muted/50", border: "border-border", text: "text-muted-foreground" };

    switch (signal.signal_strength) {
      case "STRONG":
        return { bg: "bg-up/5", border: "border-up/30", text: "text-up" };
      case "MODERATE":
        return { bg: "bg-warning/5", border: "border-warning/30", text: "text-warning" };
      case "WEAK":
        return { bg: "bg-muted/50", border: "border-border", text: "text-muted-foreground" };
      default:
        return { bg: "bg-muted/50", border: "border-border", text: "text-muted-foreground" };
    }
  };

  const styles = getSignalStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`bg-card border ${styles.border} rounded-xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <motion.div
              animate={hasAlert ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: hasAlert ? Infinity : 0 }}
            >
              <Bell className={`w-5 h-5 ${hasAlert ? styles.text : "text-muted-foreground"}`} />
            </motion.div>
            <span className="text-sm font-medium text-foreground">Today's Alert</span>
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {hasAlert && signal ? (
              <motion.div
                key="alert"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Signal Header */}
                <div className="flex items-center gap-3">
                  {signal.direction === "UP" ? (
                    <div className="w-10 h-10 rounded-lg bg-up/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-up" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-down/10 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-down" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${styles.text}`}>
                      {signal.action} {signal.ticker}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {signal.signal_strength} Signal
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles.bg} ${styles.text}`}>
                    {(signal.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Signal Details */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="text-sm font-bold text-foreground">
                      {(signal.position_size * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Stop</p>
                    <p className="text-sm font-bold text-down">
                      {(Math.abs(signal.stop_loss_pct) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="text-sm font-bold text-up">
                      {(signal.take_profit_pct * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-alert"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <CheckCircle className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No trade signal today</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Confidence below threshold
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
