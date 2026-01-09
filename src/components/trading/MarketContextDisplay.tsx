import type { MarketContext } from "@/hooks/useTradingOpportunities";

interface MarketContextDisplayProps {
  context: MarketContext;
}

export function MarketContextDisplay({ context }: MarketContextDisplayProps) {
  const sentimentColor =
    context.sentiment === "bullish"
      ? "text-emerald-500"
      : context.sentiment === "bearish"
        ? "text-red-500"
        : "text-amber-500";

  return (
    <div className="bg-muted/30 dark:bg-white/5 border border-border dark:border-white/5 rounded-lg p-2">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">REGIME:</span>
        <span className="font-bold text-foreground uppercase">
          {context.regime.replace("_", " ")}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] mt-0.5">
        <span className="text-muted-foreground">SENTIMENT:</span>
        <span className={`font-bold ${sentimentColor}`}>
          {context.sentiment ? context.sentiment.toUpperCase() : "NEUTRAL"}
        </span>
      </div>
    </div>
  );
}
