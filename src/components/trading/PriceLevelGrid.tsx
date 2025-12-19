import { TrendingUp, Target, Shield } from "lucide-react";

interface PriceLevel {
  label: string;
  price: number;
  percentage?: number;
  type: "entry" | "target" | "stop";
}

interface PriceLevelGridProps {
  entry: { price: number };
  target: { price: number; percentage: number };
  stopLoss: { price: number; percentage: number };
}

export function PriceLevelGrid({
  entry,
  target,
  stopLoss,
}: PriceLevelGridProps) {
  const levels: PriceLevel[] = [
    { label: "Entry", price: entry.price, type: "entry" },
    {
      label: "Target",
      price: target.price,
      percentage: target.percentage,
      type: "target",
    },
    {
      label: "Stop",
      price: stopLoss.price,
      percentage: stopLoss.percentage,
      type: "stop",
    },
  ];

  const getConfig = (type: PriceLevel["type"]) => {
    const configs = {
      entry: {
        bg: "bg-muted/50 dark:bg-white/5",
        textColor: "text-foreground",
        icon: TrendingUp,
      },
      target: {
        bg: "bg-emerald-500/10",
        textColor: "text-emerald-400",
        icon: Target,
      },
      stop: {
        bg: "bg-red-500/10",
        textColor: "text-red-400",
        icon: Shield,
      },
    };
    return configs[type];
  };

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {levels.map((level) => {
        const config = getConfig(level.type);
        const Icon = config.icon;

        return (
          <div key={level.label} className={`${config.bg} rounded-lg p-1.5`}>
            <div
              className={`text-[9px] ${config.textColor} uppercase mb-0.5 flex items-center gap-0.5`}
            >
              <Icon className="w-3 h-3" />
              {level.label}
            </div>
            <div className={`text-xs font-bold ${config.textColor}`}>
              ${level.price.toFixed(2)}
            </div>
            {level.percentage !== undefined && (
              <div className={`text-[9px] ${config.textColor}`}>
                {level.type === "target" ? "+" : "-"}
                {level.percentage.toFixed(1)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
