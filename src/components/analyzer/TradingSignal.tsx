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
      <div className="p-4 bg-indigo-500/5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{signal}</h3>
              <p className="text-xs text-muted-foreground">
                {conviction} •{" "}
                <span className="text-emerald-500">{timeframe}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Active Setup</div>
            <div className="text-sm font-bold text-emerald-500">
              {riskReward}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Levels */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase mb-1">
            Entry Zone
          </div>
          <div className="font-mono font-bold text-sm">{entryZone}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase mb-1">
            Take Profit
          </div>
          <div className="font-mono font-bold text-sm text-emerald-500">
            {takeProfit}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase mb-1">
            Stop Loss
          </div>
          <div className="font-mono font-bold text-sm text-red-500">
            {stopLoss}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase mb-1">
            Risk / Reward
          </div>
          <div className="font-mono font-bold text-sm">{rrRatio}</div>
        </div>
      </div>
    </div>
  );
}
