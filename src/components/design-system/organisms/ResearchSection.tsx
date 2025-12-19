"use client";

import { LineChart as LineChartIcon } from "lucide-react";
import { useResearchInsights } from "@/hooks/useResearchInsights";

/**
 * Research Section Component
 * Displays research insights and analysis
 */
export function ResearchSection() {
  const { data: insights, isLoading } = useResearchInsights();

  // Default insight for fallback
  const defaultInsight = {
    category: "TECHNICAL" as const,
    title: "Loading market insights...",
    summary: "Fetching latest technical analysis and market research...",
    time: "Recently",
    source: "Market Analysis",
  };

  const displayInsights =
    insights && insights.length > 0 ? insights : [defaultInsight];

  return (
    <div className="bg-card border border-border rounded-2xl lg:rounded-[23px] p-4 sm:p-6 md:col-span-2 lg:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <LineChartIcon className="w-5 h-5 text-foreground" />
        <h3 className="font-bold text-base text-foreground">
          Research & Insights
        </h3>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted">
        {displayInsights.slice(0, 3).map((insight, idx) => (
          <div
            key={idx}
            className="pb-4 border-b border-border last:border-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                  insight.category === "TECHNICAL"
                    ? "bg-indigo-500/10 text-indigo-400"
                    : insight.category === "FUNDAMENTAL"
                      ? "bg-blue-500/10 text-blue-400"
                      : insight.category === "SENTIMENT"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {insight.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {insight.time}
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground mt-1 mb-2 leading-snug">
              {insight.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.summary}
            </p>
            {insight.url && (
              <a
                href={insight.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-500 flex items-center gap-1 mt-2"
              >
                Read Report <span>→</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
