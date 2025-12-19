"use client";

import type { StockAnalysisData } from "@/hooks/useStockAnalysis";
import { useAIThesis } from "@/hooks/useAIThesis";
import { cn } from "@/lib/utils";

interface InfoCardsProps {
  symbol: string;
  analysis: StockAnalysisData;
  aiEnabled?: boolean;
}

export function InfoCards({
  symbol,
  analysis,
  aiEnabled = false,
}: InfoCardsProps) {
  const { data: aiThesis, isLoading: aiThesisLoading } = useAIThesis(
    symbol,
    aiEnabled
  );

  return (
    <div className="bg-card border-b border-border">
      <div className="px-6 py-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {/* AI Thesis Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">AI Thesis</h3>
              {aiThesis && (
                <span
                  className={cn(
                    "ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                    aiThesis.sentiment === "BULLISH" &&
                      "bg-emerald-500/10 text-emerald-500",
                    aiThesis.sentiment === "BEARISH" &&
                      "bg-red-500/10 text-red-500",
                    aiThesis.sentiment === "NEUTRAL" &&
                      "bg-amber-500/10 text-amber-500"
                  )}
                >
                  {aiThesis.sentiment}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-3">
              {aiThesis?.thesis ||
                `Click Analyze to generate an AI thesis for ${symbol}.`}
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">
                {aiThesis?.conviction
                  ? `${aiThesis.conviction} Conviction`
                  : aiThesisLoading
                    ? "Loading..."
                    : "—"}
              </span>
              <button className="text-primary hover:underline">Ask AI →</button>
            </div>
          </div>

          {/* Key Levels Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Key Levels</h3>
            </div>
            <div className="space-y-2">
              {analysis.keyLevels.resistance2 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Resistance 2
                  </span>
                  <span className="text-sm font-bold font-mono text-red-500">
                    ${analysis.keyLevels.resistance2.toFixed(2)}
                  </span>
                </div>
              )}
              {analysis.keyLevels.resistance1 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Resistance 1
                  </span>
                  <span className="text-sm font-bold font-mono text-red-500">
                    ${analysis.keyLevels.resistance1.toFixed(2)}
                  </span>
                </div>
              )}
              {analysis.keyLevels.support1 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Support 1
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-500">
                    ${analysis.keyLevels.support1.toFixed(2)}
                  </span>
                </div>
              )}
              {analysis.keyLevels.support2 && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Support 2
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-500">
                    ${analysis.keyLevels.support2.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Catalysts Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-purple-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Catalysts</h3>
            </div>
            <div className="space-y-2">
              {analysis.catalysts.length > 0 ? (
                analysis.catalysts.map((catalyst, i) => (
                  <div key={i} className="p-2 rounded bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">
                        {catalyst.event}
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                          catalyst.importance === "HIGH" &&
                            "bg-red-500/10 text-red-500",
                          catalyst.importance === "MEDIUM" &&
                            "bg-amber-500/10 text-amber-500",
                          catalyst.importance === "LOW" &&
                            "bg-blue-500/10 text-blue-500"
                        )}
                      >
                        {catalyst.importance}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {catalyst.date}{" "}
                      {catalyst.description ? `- ${catalyst.description}` : ""}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No upcoming catalysts found
                </p>
              )}
            </div>
          </div>

          {/* Risk Profile Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Risk Profile</h3>
              <span
                className={cn(
                  "ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                  analysis.riskProfile.volatility === "HIGH" &&
                    "bg-red-500/10 text-red-500",
                  analysis.riskProfile.volatility === "MEDIUM" &&
                    "bg-amber-500/10 text-amber-500",
                  analysis.riskProfile.volatility === "LOW" &&
                    "bg-emerald-500/10 text-emerald-500"
                )}
              >
                {analysis.riskProfile.volatility || "Medium"}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    Volatility{" "}
                    {analysis.riskProfile.beta
                      ? `(Beta ${analysis.riskProfile.beta.toFixed(2)})`
                      : ""}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      analysis.riskProfile.volatility === "HIGH" &&
                        "text-red-500",
                      analysis.riskProfile.volatility === "MEDIUM" &&
                        "text-amber-500",
                      analysis.riskProfile.volatility === "LOW" &&
                        "text-emerald-500"
                    )}
                  >
                    {analysis.riskProfile.volatility || "Medium"}
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      analysis.riskProfile.volatility === "HIGH" &&
                        "w-4/5 bg-red-500",
                      analysis.riskProfile.volatility === "MEDIUM" &&
                        "w-3/5 bg-amber-500",
                      analysis.riskProfile.volatility === "LOW" &&
                        "w-2/5 bg-emerald-500"
                    )}
                  />
                </div>
              </div>
              {analysis.riskProfile.shortInterest !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">
                      Short Interest
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500">
                      {analysis.riskProfile.shortInterest.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(analysis.riskProfile.shortInterest, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fundamentals Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Fundamentals</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  Mkt Cap
                </div>
                <div className="text-sm font-bold">
                  {analysis.quote.marketCap
                    ? `$${(analysis.quote.marketCap / 1e9).toFixed(1)}B`
                    : "N/A"}
                </div>
                {analysis.quote.pe && (
                  <div className="text-[9px] text-muted-foreground">
                    P/E: {analysis.quote.pe.toFixed(1)}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  EPS
                </div>
                <div className="text-sm font-bold">
                  {analysis.quote.eps
                    ? `$${analysis.quote.eps.toFixed(2)}`
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  Volume
                </div>
                <div className="text-sm font-bold">
                  {(analysis.quote.volume / 1e6).toFixed(1)}M
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  52W Range
                </div>
                <div className="text-[9px] font-bold">
                  {analysis.riskProfile.distance52WeekLow !== undefined
                    ? `${analysis.riskProfile.distance52WeekLow.toFixed(0)}% from low`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
