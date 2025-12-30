"use client";

import { memo } from "react";
import type { StockAnalysisData } from "@/hooks/useStockAnalysis";
import { useAIThesis } from "@/hooks/useAIThesis";
import {
  AIThesisCard,
  KeyLevelsCard,
  CatalystsCard,
  RiskProfileCard,
  FundamentalsCard,
} from "./cards";

interface InfoCardsProps {
  symbol: string;
  analysis: StockAnalysisData;
  aiEnabled?: boolean;
}

/**
 * Info Cards Component
 * Horizontal scrolling cards showing key stock information
 */
export const InfoCards = memo(function InfoCards({ symbol, analysis, aiEnabled = false }: InfoCardsProps) {
  const { data: aiThesis, isLoading: aiThesisLoading } = useAIThesis(symbol, aiEnabled);

  return (
    <div className="bg-card border-b border-border">
      <div className="px-3 sm:px-6 py-3 sm:py-4 overflow-x-auto scrollbar-thin">
        <div className="flex gap-3 sm:gap-4 pb-1">
          <AIThesisCard
            symbol={symbol}
            aiThesis={aiThesis}
            aiThesisLoading={aiThesisLoading}
          />
          <KeyLevelsCard keyLevels={analysis.keyLevels} />
          <CatalystsCard catalysts={analysis.catalysts} />
          <RiskProfileCard riskProfile={analysis.riskProfile} />
          <FundamentalsCard quote={analysis.quote} riskProfile={analysis.riskProfile} />
        </div>
      </div>
    </div>
  );
});

InfoCards.displayName = "InfoCards";
