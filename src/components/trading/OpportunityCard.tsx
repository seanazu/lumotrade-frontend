import { useState } from "react";
import { Clock, ArrowRight, Zap } from "lucide-react";
import { PriceLevelGrid } from "./PriceLevelGrid";
import { TradingModal } from "./TradingModal";
import type { TradingOpportunity } from "@/hooks/useTradingOpportunities";

interface OpportunityCardProps {
  opportunity: TradingOpportunity;
  positionRisk: number;
  isPending: boolean;
  onAnalyze: (symbol: string) => void;
}

const SETUP_CONFIGS = {
  momentum_breakout: { label: "MOMENTUM BREAKOUT", icon: "🚀" },
  mean_reversion: { label: "MEAN REVERSION", icon: "🔄" },
  options_play: { label: "OPTIONS PLAY", icon: "📊" },
  swing_trade: { label: "SWING TRADE", icon: "📈" },
} as const;

export function OpportunityCard({
  opportunity: opp,
  positionRisk,
  isPending,
  onAnalyze,
}: OpportunityCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const setupConfig = opp.setupType && SETUP_CONFIGS[opp.setupType] 
    ? SETUP_CONFIGS[opp.setupType]
    : {
        label: opp.setupType ? opp.setupType.toUpperCase() : "OPPORTUNITY",
        icon: "💡",
      };

  const shares = calculateShares(
    opp.entry.price,
    opp.stopLoss.price,
    positionRisk
  );
  const totalValue = shares * opp.entry.price;

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-xl p-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">{setupConfig.icon}</span>
          <div>
            <div className="text-sm font-bold text-foreground">
              {opp.symbol}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
              {setupConfig.label}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold text-indigo-400">
            {opp.winRate}% Win
          </div>
          <div className="text-[9px] text-muted-foreground">
            {opp.riskReward.toFixed(1)}:1 R:R
          </div>
        </div>
      </div>

      {/* Price Levels */}
      <PriceLevelGrid
        entry={opp.entry}
        target={opp.target}
        stopLoss={opp.stopLoss}
      />

      {/* Position Size */}
      <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-1.5 my-1.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-muted-foreground uppercase">
              Position (${positionRisk} risk)
            </div>
            <div className="text-xs font-bold text-foreground">
              {shares} shares
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground text-right">
            ${totalValue.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="text-[10px] leading-snug text-muted-foreground border-t border-border/50 pt-1.5 mb-1.5">
        <div className="font-bold text-foreground mb-0.5 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {opp.timeframe}
        </div>
        <p className="line-clamp-2">{opp.reasoning}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[9px]">
          <MetricBadge
            label="Prob"
            value={opp.probability}
            color="text-indigo-400"
          />
          <span className="text-muted-foreground">•</span>
          <MetricBadge
            label="Conf"
            value={opp.confidence}
            color="text-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg border border-primary/20 shadow-sm shadow-primary/20 transition-all group"
          >
            <Zap className="w-3 h-3 text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground">
              Trade
            </span>
          </button>
          <button
            onClick={() => onAnalyze(opp.symbol)}
            disabled={isPending}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 hover:border-indigo-500/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[10px] font-bold text-indigo-400">
              {isPending ? "Loading..." : "Analyze"}
            </span>
            {!isPending && (
              <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        opportunity={opp}
      />
    </div>
  );
}

function MetricBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-bold ${color}`}>{value}%</span>
    </div>
  );
}

function calculateShares(
  entryPrice: number,
  stopPrice: number,
  riskAmount: number
): number {
  const riskPerShare = entryPrice - stopPrice;
  if (riskPerShare <= 0) return 0;
  return Math.floor(riskAmount / riskPerShare);
}
