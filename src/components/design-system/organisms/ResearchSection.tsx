"use client";

import { LineChart as LineChartIcon } from "lucide-react";

/**
 * Research Section Component
 * Displays research insights and analysis
 */
export function ResearchSection() {
  return (
    <div className="bg-card border border-border rounded-2xl lg:rounded-[23px] p-4 sm:p-6 md:col-span-2 lg:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <LineChartIcon className="w-5 h-5 text-foreground" />
        <h3 className="font-bold text-base text-foreground">
          Research & Insights
        </h3>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-block px-2 py-0.5 bg-indigo-500/10 rounded text-[11px] text-indigo-400 font-bold">
              TECHNICAL
            </span>
            <span className="text-xs text-muted-foreground">4h ago</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground mt-1 mb-2">
            Gold forming a double bottom pattern near $1800 support
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Analysts suggest a potential reversal if the key support level holds
            through the weekly close...
          </p>
          <button className="text-xs text-indigo-400 hover:text-indigo-500 flex items-center gap-1">
            Read Report <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
