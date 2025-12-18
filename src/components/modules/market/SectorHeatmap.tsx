"use client";

import { type FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectorData {
  name: string;
  symbol: string;
  change: number;
  marketCap?: number;
  topMovers?: { symbol: string; name: string; change: number }[];
}

interface SectorHeatmapProps {
  sectors: SectorData[];
  isLoading?: boolean;
  className?: string;
}

// Color scale from red to green based on performance - theme-aware
function getColorForChange(change: number): { bg: string; text: string; border: string } {
  // Use CSS custom properties that adapt to theme
  if (change <= -3) return { bg: "bg-down/90", text: "text-white", border: "border-down" };
  if (change <= -2) return { bg: "bg-down/75", text: "text-white", border: "border-down/80" };
  if (change <= -1) return { bg: "bg-down/60", text: "text-white", border: "border-down/60" };
  if (change <= -0.5) return { bg: "bg-down/40", text: "text-foreground", border: "border-down/40" };
  if (change < 0) return { bg: "bg-down/20", text: "text-foreground", border: "border-down/20" };
  if (change === 0) return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
  if (change < 0.5) return { bg: "bg-up/20", text: "text-foreground", border: "border-up/20" };
  if (change < 1) return { bg: "bg-up/40", text: "text-foreground", border: "border-up/40" };
  if (change < 2) return { bg: "bg-up/60", text: "text-white", border: "border-up/60" };
  if (change < 3) return { bg: "bg-up/75", text: "text-white", border: "border-up/80" };
  return { bg: "bg-up/90", text: "text-white", border: "border-up" };
}

const SectorTile: FC<{
  sector: SectorData;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}> = ({ sector, index, onClick, isSelected }) => {
  const colors = getColorForChange(sector.change);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      whileHover={{ scale: 1.01, zIndex: 10 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-lg border transition-all duration-150 min-h-[70px]",
        colors.bg,
        colors.text,
        colors.border,
        isSelected && "ring-1 ring-primary"
      )}
    >
      <div className="flex flex-col items-start h-full justify-center">
        <span className="text-xs font-semibold truncate w-full text-left mb-1">
          {sector.name}
        </span>
        <div className="flex items-center gap-1.5">
          {sector.change >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span className="text-base font-bold font-mono">
            {sector.change >= 0 ? "+" : ""}
            {sector.change.toFixed(2)}%
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export const SectorHeatmap: FC<SectorHeatmapProps> = ({
  sectors,
  isLoading,
  className,
}) => {
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);

  // Sort sectors by absolute change for visual impact
  const sortedSectors = [...sectors].sort(
    (a, b) => Math.abs(b.change) - Math.abs(a.change)
  );

  // Calculate market summary
  const upSectors = sectors.filter((s) => s.change > 0).length;
  const downSectors = sectors.filter((s) => s.change < 0).length;
  const avgChange =
    sectors.reduce((sum, s) => sum + s.change, 0) / sectors.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-lg bg-card border border-border shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-up">
            <TrendingUp className="h-3 w-3" />
            {upSectors} up
          </span>
          <span className="flex items-center gap-1 text-down">
            <TrendingDown className="h-3 w-3" />
            {downSectors} down
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {sortedSectors.map((sector, index) => (
          <SectorTile
            key={sector.symbol}
            sector={sector}
            index={index}
            onClick={() => setSelectedSector(sector)}
            isSelected={selectedSector?.symbol === sector.symbol}
          />
        ))}
      </div>

      {/* Selected Sector Detail */}
      <AnimatePresence>
        {selectedSector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{selectedSector.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSector.symbol} •{" "}
                  <span
                    className={
                      selectedSector.change >= 0 ? "text-up" : "text-down"
                    }
                  >
                    {selectedSector.change >= 0 ? "+" : ""}
                    {selectedSector.change.toFixed(2)}%
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedSector(null)}
                className="p-1 rounded hover:bg-surface-3"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Top movers in sector */}
            {selectedSector.topMovers && selectedSector.topMovers.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs text-muted-foreground">Top movers:</p>
                {selectedSector.topMovers.map((mover) => (
                  <div
                    key={mover.symbol}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{mover.symbol}</span>
                    <span
                      className={cn(
                        "font-mono",
                        mover.change >= 0 ? "text-up" : "text-down"
                      )}
                    >
                      {mover.change >= 0 ? "+" : ""}
                      {mover.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-center gap-0.5 mt-3 pt-3 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground mr-1.5">-3%</span>
        {[
          "bg-red-600",
          "bg-red-500",
          "bg-red-400",
          "bg-red-300",
          "bg-gray-400",
          "bg-green-300",
          "bg-green-400",
          "bg-green-500",
          "bg-green-600",
        ].map((color, i) => (
          <div key={i} className={cn("w-3 h-1.5 rounded-sm", color)} />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1.5">+3%</span>
      </div>
    </motion.div>
  );
};

// Default sectors data (S&P 500 sectors)
export const DEFAULT_SECTORS: SectorData[] = [
  { name: "Technology", symbol: "XLK", change: 1.2 },
  { name: "Healthcare", symbol: "XLV", change: 0.45 },
  { name: "Financials", symbol: "XLF", change: -0.32 },
  { name: "Consumer Disc.", symbol: "XLY", change: 0.89 },
  { name: "Communication", symbol: "XLC", change: 1.5 },
  { name: "Industrials", symbol: "XLI", change: 0.21 },
  { name: "Consumer Stap.", symbol: "XLP", change: -0.15 },
  { name: "Energy", symbol: "XLE", change: -1.8 },
  { name: "Utilities", symbol: "XLU", change: -0.55 },
  { name: "Real Estate", symbol: "XLRE", change: 0.33 },
  { name: "Materials", symbol: "XLB", change: -0.72 },
];

export const SectorHeatmapWithData: FC<{ className?: string }> = ({
  className,
}) => {
  return <SectorHeatmap sectors={DEFAULT_SECTORS} className={className} />;
};

