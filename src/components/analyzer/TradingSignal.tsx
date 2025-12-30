"use client";

import { TrendingUp } from "lucide-react";

interface TradingSignalProps {
  signal: string;
  conviction: string;
  timeframe: string;
  riskReward: string;
  entryZone: string;
  takeProfit: string;
  stopLoss: string;
  rrRatio: string;
}

export function TradingSignal({
  signal,
  conviction,
  timeframe,
  riskReward,
  entryZone,
  takeProfit,
  stopLoss,
  rrRatio,
}: TradingSignalProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Signal Header */}
      <div className="p-3 sm:p-4 bg-indigo-500/5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm">{signal}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {conviction} •{" "}
                <span className="text-emerald-500">{timeframe}</span>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Active Setup</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-500">
              {riskReward}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Levels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30">
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">
            Entry Zone
          </div>
          <div className="font-mono font-bold text-xs sm:text-sm break-words">{entryZone}</div>
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">
            Take Profit
          </div>
          <div className="font-mono font-bold text-xs sm:text-sm text-emerald-500 break-words">
            {takeProfit}
          </div>
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">
            Stop Loss
          </div>
          <div className="font-mono font-bold text-xs sm:text-sm text-red-500 break-words">
            {stopLoss}
          </div>
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase mb-1">
            Risk / Reward
          </div>
          <div className="font-mono font-bold text-xs sm:text-sm">{rrRatio}</div>
        </div>
      </div>
    </div>
  );
}
