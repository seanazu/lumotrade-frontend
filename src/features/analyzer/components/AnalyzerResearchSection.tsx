"use client";

import { ResearchPanel } from "@/components/analyzer/ResearchPanel";
import type { TradingStrategy } from "@/types/strategies";

interface AnalyzerResearchSectionProps {
  research: any;
  researchLoading: boolean;
  symbol: string;
  onSelectStrategy: (strategy: TradingStrategy | undefined) => void;
  onSaveStrategy: (strategy: TradingStrategy) => void;
  selectedStrategyId: string | undefined;
  isSaving: boolean;
}

/**
 * Analyzer Research Section Component
 * Displays AI-generated research and trading strategies
 */
export function AnalyzerResearchSection({
  research,
  researchLoading,
  symbol,
  onSelectStrategy,
  onSaveStrategy,
  selectedStrategyId,
  isSaving,
}: AnalyzerResearchSectionProps) {
  if (research) {
    return (
      <ResearchPanel
        research={research}
        onSelectStrategy={onSelectStrategy}
        onSaveStrategy={onSaveStrategy}
        selectedStrategyId={selectedStrategyId}
        isSaving={isSaving}
      />
    );
  }

  if (researchLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            🤖 AI is analyzing {symbol}...
          </div>
          <div className="flex justify-center gap-1 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
          </div>
          <div className="text-xs text-muted-foreground">
            Generating 5 distinct strategies based on comprehensive analysis...
          </div>
        </div>
      </div>
    );
  }

  return null;
}

AnalyzerResearchSection.displayName = "AnalyzerResearchSection";
