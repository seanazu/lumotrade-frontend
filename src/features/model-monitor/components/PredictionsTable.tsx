"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/design-system/atoms/Badge";
import { cn } from "@/lib/utils";
import type { Prediction } from "../types";

interface PredictionsTableProps {
  predictions: Prediction[];
}

/**
 * PredictionsTable Component
 * Displays model predictions with confidence and results
 */
export function PredictionsTable({ predictions }: PredictionsTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Ticker
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Direction
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Expected (p50)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Actual Return
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {predictions.length > 0 ? (
              predictions.map((pred, i) => {
                const isUp = pred.direction === "UP";
                const isDown = pred.direction === "DOWN";
                const isHold = pred.direction === "HOLD";
                const confidence = (pred.confidence * 100).toFixed(1);

                return (
                  <motion.tr
                    key={pred.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(pred.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold font-mono">
                        {pred.ticker}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={isUp ? "bullish" : isDown ? "bearish" : "default"}
                        className={cn("text-xs", isHold && "text-muted-foreground bg-muted")}
                      >
                        {pred.direction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence}%` }}
                            transition={{ duration: 0.5, delay: i * 0.02 }}
                            className={cn(
                              "h-full",
                              isUp ? "bg-up" : isDown ? "bg-down" : "bg-muted-foreground"
                            )}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium">
                          {confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {pred.q50 !== null &&
                      pred.q50 !== undefined &&
                      !isNaN(pred.q50) ? (
                        <span
                          className={cn(
                            "text-xs font-mono font-semibold",
                            pred.q50 > 0 ? "text-up" : "text-down"
                          )}
                        >
                          {pred.q50 > 0 ? "+" : ""}
                          {(pred.q50 * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isHold ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : pred.actual_return !== null &&
                        pred.actual_return !== undefined &&
                        !isNaN(pred.actual_return) ? (
                        <span
                          className={cn(
                            "text-xs font-mono font-semibold",
                            pred.actual_return > 0 ? "text-up" : "text-down"
                          )}
                        >
                          {pred.actual_return > 0 ? "+" : ""}
                          {(pred.actual_return * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isHold ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : pred.was_correct === null ||
                        pred.was_correct === undefined ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : pred.was_correct === true ? (
                        <CheckCircle2 className="h-4 w-4 text-up inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-down inline" />
                      )}
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Target className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">No predictions yet</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

PredictionsTable.displayName = "PredictionsTable";

