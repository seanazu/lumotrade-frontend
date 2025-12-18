"use client";

interface FinancialsCardProps {
  revenue: string;
  revenueChange: string;
  eps: string;
  epsChange: string;
}

export function FinancialsCard({
  revenue,
  revenueChange,
  eps,
  epsChange,
}: FinancialsCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-4">Financials</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Revenue</div>
          <div className="font-bold font-mono text-lg">{revenue}</div>
          <div className="text-xs text-emerald-500 font-medium">
            {revenueChange}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">EPS</div>
          <div className="font-bold font-mono text-lg">{eps}</div>
          <div className="text-xs text-emerald-500 font-medium">
            {epsChange}
          </div>
        </div>
      </div>
    </div>
  );
}
