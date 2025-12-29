"use client";

import { motion } from "framer-motion";
import { TrendingUpDown } from "lucide-react";
import { Badge } from "@/components/design-system/atoms/Badge";
import { cn } from "@/lib/utils";
import type { Trade } from "../types";

interface TradesTableProps {
  trades: Trade[];
}

/**
 * TradesTable Component
 * Displays trading history with P&L and status
 */
export function TradesTable({ trades }: TradesTableProps) {
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
                Side
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Entry
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Exit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                P&L
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trades.length > 0 ? (
              trades.map((trade, i) => {
                const isLong = trade.direction === "LONG";
                const isProfitable = (trade.profit_loss || 0) > 0;
                const isOpen = trade.status === "OPEN";

                return (
                  <motion.tr
                    key={trade.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(trade.entry_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold font-mono">
                        {trade.ticker}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={isLong ? "bullish" : "bearish"}
                        className="text-xs"
                      >
                        {trade.direction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono">
                        ${trade.entry_price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono">
                        ${(trade.exit_price || trade.entry_price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono">
                        $
                        {trade.position_size?.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }) || "0"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isOpen && trade.profit_loss !== null ? (
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-xs font-mono font-semibold",
                              isProfitable ? "text-up" : "text-down"
                            )}
                          >
                            {isProfitable ? "+" : ""}$
                            {trade.profit_loss.toFixed(2)}
                          </span>
                          {trade.profit_loss_pct && (
                            <span
                              className={cn(
                                "text-xs font-mono",
                                isProfitable ? "text-up/70" : "text-down/70"
                              )}
                            >
                              {isProfitable ? "+" : ""}
                              {trade.profit_loss_pct.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          isOpen ? "default" : isProfitable ? "bullish" : "bearish"
                        }
                        className="text-xs"
                      >
                        {trade.status}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUpDown className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">No trades yet</p>
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

TradesTable.displayName = "TradesTable";

