"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/design-system/atoms/Badge";
import { cn } from "@/lib/utils";
import { useTrades, Trade } from "@/hooks/useTrades";
import { format } from "date-fns";

interface TradeHistoryTableProps {
  days?: number;
  ticker?: string;
  maxRows?: number;
}

export function TradeHistoryTable({
  days = 30,
  ticker,
  maxRows,
}: TradeHistoryTableProps) {
  const { data, isLoading, error } = useTrades(days, undefined, ticker);
  const [sortField, setSortField] = useState<keyof Trade>("entry_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load trades
      </div>
    );
  }

  const trades = data?.trades || [];
  const displayTrades = maxRows ? trades.slice(0, maxRows) : trades;

  const handleSort = (field: keyof Trade) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedTrades = [...displayTrades].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === undefined || bVal === undefined) return 0;

    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Total Trades</div>
            <div className="text-xl font-bold font-mono">
              {data.summary.total}
            </div>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Win Rate</div>
            <div className="text-xl font-bold font-mono text-up">
              {(data.summary.win_rate * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Total P&L</div>
            <div
              className={cn(
                "text-xl font-bold font-mono",
                data.summary.total_pnl > 0 ? "text-up" : "text-down"
              )}
            >
              ${data.summary.total_pnl.toFixed(2)}
            </div>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Open</div>
            <div className="text-xl font-bold font-mono text-warning">
              {data.summary.open}
            </div>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Closed</div>
            <div className="text-xl font-bold font-mono">
              {data.summary.closed}
            </div>
          </div>
        </div>
      )}

      {/* Trades Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 border-b border-border">
            <tr>
              <th
                className="text-left p-3 font-medium cursor-pointer hover:bg-surface-3 transition-colors"
                onClick={() => handleSort("trade_id")}
              >
                ID
              </th>
              <th
                className="text-left p-3 font-medium cursor-pointer hover:bg-surface-3 transition-colors"
                onClick={() => handleSort("entry_date")}
              >
                Date
              </th>
              <th className="text-left p-3 font-medium">Ticker</th>
              <th className="text-left p-3 font-medium">Direction</th>
              <th className="text-right p-3 font-medium">Entry</th>
              <th className="text-right p-3 font-medium">Exit</th>
              <th
                className="text-right p-3 font-medium cursor-pointer hover:bg-surface-3 transition-colors"
                onClick={() => handleSort("pnl")}
              >
                P&L
              </th>
              <th className="text-center p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  No trades found
                </td>
              </tr>
            ) : (
              sortedTrades.map((trade, idx) => (
                <motion.tr
                  key={trade.trade_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-border/50 hover:bg-surface-2 transition-colors"
                >
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    #{trade.trade_id}
                  </td>
                  <td className="p-3 text-xs">
                    {format(new Date(trade.entry_date), "MMM d")}
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{trade.ticker}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {(trade.confidence * 100).toFixed(0)}% conf
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={trade.direction === "UP" ? "bullish" : "bearish"}
                      className="gap-1"
                    >
                      {trade.direction === "UP" ? (
                        <ArrowUpCircle className="h-3 w-3" />
                      ) : (
                        <ArrowDownCircle className="h-3 w-3" />
                      )}
                      {trade.direction}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-mono text-xs">
                    ${trade.entry_price.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-xs">
                    {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : "-"}
                  </td>
                  <td className="p-3 text-right">
                    {trade.pnl !== undefined && trade.pnl !== null ? (
                      <div>
                        <div
                          className={cn(
                            "font-mono font-medium text-sm",
                            trade.pnl > 0 ? "text-up" : "text-down"
                          )}
                        >
                          ${trade.pnl.toFixed(2)}
                        </div>
                        <div
                          className={cn(
                            "text-xs font-mono",
                            trade.pnl > 0 ? "text-up/70" : "text-down/70"
                          )}
                        >
                          ({(trade.pnl_pct! * 100).toFixed(2)}%)
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={
                        trade.status === "closed"
                          ? "default"
                          : trade.status === "open"
                            ? "warning"
                            : "error"
                      }
                      className="text-xs"
                    >
                      {trade.status === "stopped_out" ? "Stop" : trade.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {maxRows && trades.length > maxRows && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {maxRows} of {trades.length} trades
        </div>
      )}
    </div>
  );
}
