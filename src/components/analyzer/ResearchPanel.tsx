"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ComprehensiveResearch } from "@/hooks/useResearch";
import { StrategyMatrix } from "./StrategyMatrix";
import type { TradingStrategy } from "@/types/strategies";

interface ResearchPanelProps {
  research: ComprehensiveResearch;
  onSelectStrategy: (strategy: TradingStrategy) => void;
  onSaveStrategy: (strategy: TradingStrategy) => void;
  selectedStrategyId?: string;
  isSaving?: boolean;
}

export function ResearchPanel({
  research,
  onSelectStrategy,
  onSaveStrategy,
  selectedStrategyId,
  isSaving = false,
}: ResearchPanelProps) {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "fundamentals"
    | "technicals"
    | "sentiment"
    | "strategies"
    | "risk"
  >("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "fundamentals", label: "Fundamentals" },
    { id: "technicals", label: "Technicals" },
    { id: "sentiment", label: "Sentiment" },
    { id: "strategies", label: "Strategies" },
    { id: "risk", label: "Risk" },
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border bg-muted/20 overflow-x-auto">
        <div className="flex gap-0.5 sm:gap-1 p-1.5 sm:p-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {activeTab === "overview" && <OverviewTab research={research} />}
        {activeTab === "fundamentals" && (
          <FundamentalsTab research={research} />
        )}
        {activeTab === "technicals" && <TechnicalsTab research={research} />}
        {activeTab === "sentiment" && <SentimentTab research={research} />}
        {activeTab === "strategies" && (
          <div className="space-y-2 sm:space-y-3">
            {selectedStrategyId && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground mb-0.5">
                    Strategy Selected
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    Click &ldquo;Save Strategy&rdquo; to apply this setup to
                    your Trade Setup card
                  </div>
                </div>
                <button
                  onClick={() => {
                    const selected = research.strategies.find(
                      (s) => s.id === selectedStrategyId
                    );
                    if (selected) {
                      onSaveStrategy(selected);
                    }
                  }}
                  disabled={isSaving}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSaving ? "Saving..." : "Save Strategy"}
                </button>
              </div>
            )}
            <StrategyMatrix
              strategies={research.strategies}
              currentPrice={research.currentPrice}
              onSelectStrategy={onSelectStrategy}
              selectedStrategyId={selectedStrategyId}
            />
          </div>
        )}
        {activeTab === "risk" && <RiskTab research={research} />}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ research }: { research: ComprehensiveResearch }) {
  const regime = research.marketContext.regime;
  const scores = research.scores;

  // Calculate investment quality metrics
  const potentialScore = calculateInvestmentPotential(research);
  const riskScore = calculateInvestmentRisk(research);
  const rewardScore = calculateInvestmentReward(research);

  return (
    <div className="space-y-4">
      {/* Investment Quality Cards - 4 Column Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        <InvestmentScoreCard
          label="Potential"
          score={potentialScore}
          icon="📈"
          description="Moderate growth forecast. Value metrics indicate stock is currently trading at a premium."
          color="orange"
        />
        <InvestmentScoreCard
          label="Safety"
          score={100 - riskScore}
          icon="🛡️"
          description="Strong balance sheet and market dominance provide a significant safety margin."
          inverted
          color="emerald"
        />
        <InvestmentScoreCard
          label="Reward"
          score={rewardScore}
          icon="💵"
          description="High expected returns based on current volatility and historical performance."
          color="emerald"
        />
        <InvestmentScoreCard
          label="Timing"
          score={scores.technical.score}
          icon="🕐"
          description="Excellent technical entry point. Momentum indicators align with price action."
          color="emerald"
        />
      </div>

      {/* Investment Signals - Two Column with Subtle Backgrounds */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Top Investment Reasons */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
          <h4 className="font-semibold text-xs text-emerald-400 mb-2 flex items-center gap-1.5">
            <span className="text-sm">✓</span>
            Top Reasons to Invest
          </h4>
          <div className="space-y-1.5">
            {generateInvestmentReasons(research)
              .slice(0, 5)
              .map((reason, i) => {
                const parts = reason.split(":");
                return (
                  <div key={i} className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    <div className="text-foreground/90">
                      {parts.length > 1 ? (
                        <>
                          <span className="font-semibold text-foreground">
                            {parts[0]}:
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            {parts[1]}
                          </span>
                        </>
                      ) : (
                        reason
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Key Risks */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
          <h4 className="font-semibold text-xs text-amber-400 mb-2 flex items-center gap-1.5">
            <span className="text-sm">⚠️</span>
            Key Risks to Watch
          </h4>
          <div className="space-y-1.5">
            {generateRiskFactors(research)
              .slice(0, 5)
              .map((risk, i) => {
                const parts = risk.split(":");
                return (
                  <div key={i} className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-amber-400 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    <div className="text-foreground/90">
                      {parts.length > 1 ? (
                        <>
                          <span className="font-semibold text-foreground">
                            {parts[0]}:
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            {parts[1]}
                          </span>
                        </>
                      ) : (
                        risk
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Detailed Scores + Market Environment */}
      <div className="grid grid-cols-5 gap-2.5">
        {/* Detailed Analysis Scores */}
        <div className="col-span-3 bg-card/30 border border-border/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-semibold text-xs text-foreground">
              Detailed Analysis Scores
            </h3>
            <button className="text-indigo-400 text-[10px] font-medium hover:text-indigo-300 transition-colors flex items-center gap-1">
              View Details
              <span>→</span>
            </button>
          </div>
          <div className="space-y-2">
            <DetailedScoreBar
              label="Composite Score"
              score={scores.composite}
            />
            <DetailedScoreBar
              label="Fundamental Health"
              score={scores.fundamental.score}
            />
            <DetailedScoreBar
              label="Technical Strength"
              score={scores.technical.score}
            />
            <DetailedScoreBar
              label="Market Sentiment"
              score={scores.sentiment.score}
            />
            <DetailedScoreBar
              label="Chart Patterns"
              score={scores.pattern.score}
            />
          </div>
        </div>

        {/* Market Environment */}
        <div className="col-span-2 bg-[#1a1d23] border border-[#2a2d35] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <span className="text-base">📊</span>
              </div>
              <h3 className="font-semibold text-xs text-foreground">
                Market Environment
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-muted-foreground uppercase tracking-wider">
                AI CONF.
              </div>
              <div className="text-base font-bold text-indigo-400">
                {regime.confidence}%
              </div>
            </div>
          </div>

          {/* Condition Header */}
          <div className="bg-muted/20 border border-border/50 rounded-lg p-2 mb-2">
            <div className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">
              CONDITION
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">
                {regime.regime
                  .replace("_", " ")
                  .split(" ")
                  .map(
                    (w: string) =>
                      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </span>
              <span className="px-1.5 py-0.5 bg-muted/40 text-muted-foreground text-[8px] rounded uppercase font-semibold">
                NEUTRAL
              </span>
            </div>
          </div>

          {/* Characteristics */}
          <div className="space-y-1">
            <MarketCharacteristic
              icon="💧"
              title="Low Volatility"
              description="VIX Index at 14.9 (Stable)"
            />
            <MarketCharacteristic
              icon="📊"
              title="Mixed Breadth"
              description="Sector rotation in progress"
            />
            <MarketCharacteristic
              icon="🔄"
              title="Sideways Trend"
              description="No clear directional bias"
            />
          </div>
        </div>
      </div>

      {/* Upcoming Catalysts */}
      {research.catalysts && research.catalysts.length > 0 && (
        <div className="bg-card/30 border border-border/50 rounded-lg p-2.5 sm:p-3">
          <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">Upcoming Catalysts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {research.catalysts.slice(0, 6).map((catalyst, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-1.5 rounded-lg bg-muted/30"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[11px] font-semibold truncate">
                    {catalyst.event}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {catalyst.daysUntil} days away
                  </div>
                </div>
                <span
                  className={cn(
                    "px-1 py-0.5 rounded text-[8px] font-bold uppercase flex-shrink-0",
                    catalyst.importance === "HIGH" &&
                      "bg-red-500/20 text-red-300",
                    catalyst.importance === "MEDIUM" &&
                      "bg-amber-500/20 text-amber-300",
                    catalyst.importance === "LOW" &&
                      "bg-blue-500/20 text-blue-300"
                  )}
                >
                  {catalyst.importance}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Fundamentals Tab
function FundamentalsTab({ research }: { research: ComprehensiveResearch }) {
  const fund = research.scores.fundamental;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Profitability"
          score={fund.components.profitability}
        />
        <MetricCard label="Growth" score={fund.components.growth} />
        <MetricCard label="Valuation" score={fund.components.valuation} />
        <MetricCard
          label="Financial Health"
          score={fund.components.financialHealth}
        />
      </div>

      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
        <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">Interpretation</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">{fund.interpretation}</p>
      </div>

      {/* Financial Details */}
      {research.financials && research.financials.ratios && (
        <div>
          <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Key Metrics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {research.financials.ratios.peRatio && (
              <StatBox
                label="P/E Ratio"
                value={research.financials.ratios.peRatio.toFixed(2)}
              />
            )}
            {research.financials.ratios.returnOnEquity && (
              <StatBox
                label="ROE"
                value={`${research.financials.ratios.returnOnEquity.toFixed(1)}%`}
              />
            )}
            {research.financials.ratios.revenueGrowth && (
              <StatBox
                label="Revenue Growth"
                value={`${research.financials.ratios.revenueGrowth.toFixed(1)}%`}
              />
            )}
            {research.financials.ratios.netProfitMargin && (
              <StatBox
                label="Profit Margin"
                value={`${research.financials.ratios.netProfitMargin.toFixed(1)}%`}
              />
            )}
            {research.financials.ratios.debtToEquity && (
              <StatBox
                label="Debt/Equity"
                value={research.financials.ratios.debtToEquity.toFixed(2)}
              />
            )}
            {research.financials.ratios.currentRatio && (
              <StatBox
                label="Current Ratio"
                value={research.financials.ratios.currentRatio.toFixed(2)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Technicals Tab
function TechnicalsTab({ research }: { research: ComprehensiveResearch }) {
  const tech = research.technicals;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
        <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">Technical Summary</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {research.scores.technical.interpretation}
        </p>
      </div>

      {/* Indicators Grid */}
      <div>
        <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Key Indicators</h4>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <IndicatorCard
            label="RSI (14)"
            value={tech.rsi.toFixed(1)}
            signal={tech.rsiSignal}
          />
          <IndicatorCard
            label="MACD"
            value={tech.macd.histogram.toFixed(2)}
            signal={tech.macd.crossover}
          />
          <IndicatorCard
            label="ADX"
            value={tech.adx.toFixed(1)}
            signal={tech.adxSignal}
          />
          <IndicatorCard
            label="Stochastic"
            value={`${tech.stochastic.k.toFixed(1)}`}
            signal={tech.stochastic.signal}
          />
          <IndicatorCard
            label="ATR"
            value={`${tech.atrPercent.toFixed(2)}%`}
            signal={tech.atrPercent > 3 ? "high" : "normal"}
          />
          <IndicatorCard label="OBV" value="—" signal={tech.obvTrend} />
        </div>
      </div>

      {/* Moving Averages */}
      <div>
        <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Moving Averages</h4>
        <div className="space-y-1.5 sm:space-y-2">
          {[
            { label: "SMA 20", value: tech.sma20, color: "#60a5fa" },
            { label: "SMA 50", value: tech.sma50, color: "#f59e0b" },
            { label: "SMA 200", value: tech.sma200, color: "#ef4444" },
          ].map((ma) => {
            const diff = ((research.currentPrice / ma.value - 1) * 100).toFixed(
              2
            );
            const isAbove = research.currentPrice > ma.value;
            return (
              <div
                key={ma.label}
                className="flex items-center justify-between p-2 rounded bg-muted/30"
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: ma.color }}
                >
                  {ma.label}
                </span>
                <span className="text-xs font-mono">
                  ${ma.value.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isAbove ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {isAbove ? "+" : ""}
                  {diff}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Sentiment Tab
function SentimentTab({ research }: { research: ComprehensiveResearch }) {
  const sent = research.sentiment;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sentiment Gauge */}
      <div className="flex justify-center">
        <div className="text-center">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 uppercase tracking-wide">
            Composite Sentiment
          </div>
          <div
            className={cn(
              "text-4xl sm:text-6xl font-bold mb-1.5 sm:mb-2",
              sent.score >= 70
                ? "text-emerald-400"
                : sent.score >= 55
                  ? "text-green-400"
                  : sent.score >= 45
                    ? "text-amber-400"
                    : sent.score >= 30
                      ? "text-orange-400"
                      : "text-red-400"
            )}
          >
            {sent.score}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">
            {sent.label.replace("_", " ").toUpperCase()}
          </div>
          <div
            className={cn(
              "text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block",
              sent.momentum === "positive" &&
                "bg-emerald-500/20 text-emerald-300",
              sent.momentum === "neutral" && "bg-amber-500/20 text-amber-300",
              sent.momentum === "negative" && "bg-red-500/20 text-red-300"
            )}
          >
            Momentum: {sent.momentum}
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-muted-foreground">{sent.interpretation}</p>
      </div>

      {/* Component Breakdown */}
      <div>
        <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Sentiment Sources</h4>
        <div className="space-y-1.5 sm:space-y-2">
          {Object.entries(sent.components).map(
            ([source, data]: [string, any]) => (
              <div
                key={source}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <div className="text-xs font-semibold capitalize">
                    {source}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Weight: {((data.weight || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-lg font-bold",
                      (data.score || 50) >= 60
                        ? "text-emerald-400"
                        : (data.score || 50) >= 40
                          ? "text-amber-400"
                          : "text-red-400"
                    )}
                  >
                    {data.score || 50}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Risk Tab
function RiskTab({ research }: { research: ComprehensiveResearch }) {
  const catalysts = research.catalysts || [];
  const nearTerm = catalysts.filter((c) => c.daysUntil <= 14);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Catalyst Warnings */}
      {nearTerm.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 sm:p-4">
          <h4 className="font-semibold text-xs sm:text-sm text-amber-300 mb-2 sm:mb-3">
            ⚠️ Near-Term Catalysts ({nearTerm.length})
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            {nearTerm.map((catalyst, i) => (
              <div key={i} className="text-xs text-muted-foreground">
                <span className="font-semibold">{catalyst.event}</span> in{" "}
                <span className="text-amber-300">
                  {catalyst.daysUntil} days
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volatility Metrics */}
      <div>
        <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Volatility Metrics</h4>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <StatBox
            label="ATR"
            value={`${research.technicals.atrPercent.toFixed(2)}%`}
          />
          <StatBox
            label="Market VIX"
            value={research.marketContext.vix.toFixed(1)}
          />
        </div>
      </div>

      {/* Position Sizing Guidance */}
      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
        <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Position Sizing Guidance</h4>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
          Based on {research.marketContext.regime.volatilityLevel} volatility
          regime
        </p>
        <div className="space-y-1.5 sm:space-y-2">
          {research.marketContext.regime.strategySuggestions.map(
            (suggestion: string, i: number) => (
              <div key={i} className="text-xs text-muted-foreground flex">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components

function DetailedScoreBar({ label, score }: { label: string; score: number }) {
  const barColorClass = cn(
    score >= 70
      ? "bg-emerald-500"
      : score >= 55
        ? "bg-green-500"
        : score >= 45
          ? "bg-amber-500"
          : "bg-orange-500"
  );

  const textColorClass = cn(
    score >= 70
      ? "text-emerald-400"
      : score >= 55
        ? "text-green-400"
        : score >= 45
          ? "text-amber-400"
          : "text-orange-400"
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-foreground">{label}</span>
        <span className={cn("text-xs font-bold tabular-nums", textColorClass)}>
          {score}
          <span className="text-[9px] text-muted-foreground font-normal">
            /100
          </span>
        </span>
      </div>
      <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all rounded-full", barColorClass)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function MarketCharacteristic({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-muted/10 border border-border/30 rounded-lg p-1.5 flex items-center gap-1.5 hover:bg-muted/20 transition-colors">
      <div className="w-6 h-6 bg-background rounded flex items-center justify-center flex-shrink-0">
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-foreground">{title}</div>
        <div className="text-[9px] text-muted-foreground leading-tight">
          {description}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div
        className={cn(
          "text-3xl font-bold",
          score >= 70
            ? "text-emerald-400"
            : score >= 50
              ? "text-amber-400"
              : "text-red-400"
        )}
      >
        {score}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded p-3">
      <div className="text-[10px] text-muted-foreground mb-1 uppercase">
        {label}
      </div>
      <div className="text-sm font-mono font-bold">{value}</div>
    </div>
  );
}

function IndicatorCard({
  label,
  value,
  signal,
}: {
  label: string;
  value: string;
  signal: string;
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 border border-border">
      <div className="text-[10px] text-muted-foreground mb-1 uppercase">
        {label}
      </div>
      <div className="text-lg font-mono font-bold mb-1">{value}</div>
      <div className="text-[10px] text-muted-foreground capitalize">
        {signal}
      </div>
    </div>
  );
}

// Helper functions for investment quality analysis
function calculateInvestmentPotential(research: any): number {
  const fundamental = research.scores.fundamental.score;
  const growth = research.scores.fundamental.components.growth;
  const catalysts = research.catalysts?.length || 0;

  return Math.round(
    fundamental * 0.5 + growth * 0.3 + Math.min(catalysts * 10, 20)
  );
}

function calculateInvestmentRisk(research: any): number {
  const volatility = research.technicals.atrPercent || 2;
  const vix = research.marketContext.vix || 15;

  let riskScore = 50;
  if (volatility > 5) riskScore = 80;
  else if (volatility > 3) riskScore = 65;
  else if (volatility < 2) riskScore = 35;

  if (vix > 25) riskScore += 15;
  else if (vix < 15) riskScore -= 10;

  return Math.max(0, Math.min(100, riskScore));
}

function calculateInvestmentReward(research: any): number {
  const technical = research.scores.technical.score;
  const sentiment = research.scores.sentiment.score;
  const patterns = research.scores.pattern.score;

  return Math.round(technical * 0.4 + sentiment * 0.3 + patterns * 0.3);
}

function generateInvestmentReasons(research: any): string[] {
  const reasons: string[] = [];

  // Check valuation
  if (
    research.financials?.ratios?.peRatio &&
    research.financials.ratios.peRatio < 20
  ) {
    reasons.push(
      `Attractive valuation: P/E ratio of ${research.financials.ratios.peRatio.toFixed(1)} suggests value opportunity`
    );
  }

  // Check growth
  if (
    research.financials?.ratios?.revenueGrowth &&
    research.financials.ratios.revenueGrowth > 15
  ) {
    reasons.push(
      `Strong growth: ${research.financials.ratios.revenueGrowth.toFixed(1)}% revenue growth indicates expanding business`
    );
  }

  // Check profitability
  if (
    research.financials?.ratios?.netProfitMargin &&
    research.financials.ratios.netProfitMargin > 15
  ) {
    reasons.push(
      `High margins: ${research.financials.ratios.netProfitMargin.toFixed(1)}% profit margin shows strong pricing power`
    );
  }

  // Check technical setup
  if (research.scores.technical.score > 65) {
    reasons.push(
      `Bullish technical setup: Multiple indicators confirming upward momentum`
    );
  }

  // Check sentiment
  if (research.scores.sentiment.score > 60) {
    reasons.push(
      `Positive sentiment: Analysts, insiders, and market participants are optimistic`
    );
  }

  // Check patterns
  const bullishPatterns =
    research.patterns?.filter(
      (p: any) =>
        p.confidence === "HIGH" &&
        (p.type.toLowerCase().includes("bull") ||
          p.type.toLowerCase().includes("engulfing") ||
          p.type.toLowerCase().includes("hammer"))
    ) || [];

  if (bullishPatterns.length > 0) {
    reasons.push(
      `Bullish chart patterns: ${bullishPatterns[0].type} detected with high confidence`
    );
  }

  // Check catalysts
  if (research.catalysts && research.catalysts.length > 0) {
    const nearTermCatalysts = research.catalysts.filter(
      (c: any) => c.daysUntil <= 14
    );
    if (nearTermCatalysts.length > 0) {
      reasons.push(
        `Upcoming catalysts: ${nearTermCatalysts.length} events in next 2 weeks could drive movement`
      );
    }
  }

  // Default reasons if we don't have enough
  if (reasons.length === 0) {
    reasons.push(
      "Analyze the detailed tabs for specific investment opportunities"
    );
  }

  return reasons.slice(0, 5); // Return top 5 reasons
}

function generateRiskFactors(research: any): string[] {
  const risks: string[] = [];

  // Check valuation risk
  if (
    research.financials?.ratios?.peRatio &&
    research.financials.ratios.peRatio > 40
  ) {
    risks.push(
      `High valuation: P/E ratio of ${research.financials.ratios.peRatio.toFixed(1)} suggests limited margin of safety`
    );
  }

  // Check volatility
  if (research.technicals.atrPercent > 4) {
    risks.push(
      `High volatility: ${research.technicals.atrPercent.toFixed(1)}% ATR indicates significant price swings`
    );
  }

  // Check market conditions
  if (research.marketContext.vix > 25) {
    risks.push(
      `Elevated market volatility: VIX at ${research.marketContext.vix.toFixed(1)} suggests cautious environment`
    );
  }

  // Check debt
  if (
    research.financials?.ratios?.debtToEquity &&
    research.financials.ratios.debtToEquity > 1.5
  ) {
    risks.push(
      `High debt levels: Debt-to-equity of ${research.financials.ratios.debtToEquity.toFixed(2)} may limit flexibility`
    );
  }

  // Check technical weakness
  if (research.scores.technical.score < 40) {
    risks.push(
      `Weak technical setup: Multiple indicators showing bearish signals`
    );
  }

  // Check bearish patterns
  const bearishPatterns =
    research.patterns?.filter(
      (p: any) =>
        p.confidence === "HIGH" && p.type.toLowerCase().includes("bear")
    ) || [];

  if (bearishPatterns.length > 0) {
    risks.push(
      `Bearish chart patterns: ${bearishPatterns[0].type} suggests potential downside`
    );
  }

  // Check earnings risk
  const earningsSoon = research.catalysts?.find(
    (c: any) => c.type === "earnings" && c.daysUntil <= 7
  );

  if (earningsSoon) {
    risks.push(
      `Earnings volatility: Earnings report in ${earningsSoon.daysUntil} days may cause sharp moves`
    );
  }

  // Default risk if none identified
  if (risks.length === 0) {
    risks.push(
      "Standard equity risk - use proper position sizing and stop losses"
    );
  }

  return risks.slice(0, 5); // Return top 5 risks
}

function InvestmentScoreCard({
  label,
  score,
  icon,
  description,
  color = "emerald",
  inverted = false,
}: {
  label: string;
  score: number;
  icon: string;
  description: string;
  color?: "emerald" | "orange" | "amber";
  inverted?: boolean;
}) {
  // For risk, invert the color scheme (low risk = good = green)
  const actualScore = inverted ? 100 - score : score;

  const scoreColorClass = cn(
    actualScore >= 70
      ? "text-emerald-400"
      : actualScore >= 55
        ? "text-green-400"
        : actualScore >= 45
          ? "text-amber-400"
          : "text-orange-400"
  );

  const barColorClass = cn(
    actualScore >= 70
      ? "bg-emerald-500"
      : actualScore >= 55
        ? "bg-green-500"
        : actualScore >= 45
          ? "bg-amber-500"
          : "bg-orange-500"
  );

  return (
    <div className="bg-[#1a1d23] border border-[#2a2d35] rounded-lg p-2.5 flex flex-col hover:border-[#3a3d45] transition-colors">
      {/* Icon and Score Row */}
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-xl">{icon}</span>
        <div
          className={cn(
            "text-xl font-bold tabular-nums leading-none",
            scoreColorClass
          )}
        >
          {score}
          <span className="text-[10px] text-muted-foreground/50 font-normal ml-0.5">
            /100
          </span>
        </div>
      </div>

      {/* Label */}
      <h4 className="text-sm font-semibold text-foreground mb-1">{label}</h4>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground/90 leading-snug mb-2 flex-1">
        {description}
      </p>

      {/* Progress Bar */}
      <div className="h-0.5 bg-muted/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all rounded-full", barColorClass)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
