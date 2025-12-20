/**
 * Trading Strategy Types
 * Comprehensive types for multi-strategy generation
 */

export type StrategyType =
  | "conservative"
  | "moderate"
  | "aggressive"
  | "swing"
  | "position";
export type Valuation = "undervalued" | "fair" | "overvalued";
export type SentimentMomentum = "positive" | "neutral" | "negative";

export interface StrategyEntry {
  price: number;
  condition: string;
  rationale: string;
}

export interface StrategyTarget {
  price: number;
  percentage: number;
  probability: number;
  rationale: string;
}

export interface StopLoss {
  initial: {
    price: number;
    percentage: number;
  };
  trailing: {
    type: string;
    percentage: number;
  };
  rationale: string;
}

export interface PositionSizing {
  recommendedPosition: number; // percentage of portfolio
  maxPosition: number; // percentage
  scaling: "in" | "out" | "both";
}

export interface StrategyThesis {
  bullCase: string;
  bearCase: string;
  catalysts: string[];
  risks: string[];
}

export interface TechnicalBasis {
  supportingIndicators: string[];
  patterns: string[];
  keyLevels: number[];
}

export interface FundamentalBasis {
  strengthMetrics: string[];
  concernMetrics: string[];
  valuation: Valuation;
}

export interface SentimentBasis {
  score: number;
  interpretation: string;
  momentum: SentimentMomentum;
}

export interface StrategyUpdate {
  condition: string;
  action: string;
}

export interface TradingStrategy {
  id: string;
  name: string;
  type: StrategyType;
  confidence: number; // 0-100
  timeframe: string;

  thesis: StrategyThesis;

  entries: StrategyEntry[];
  targets: StrategyTarget[];
  stopLoss: StopLoss;
  sizing: PositionSizing;

  riskReward: string;

  technicalBasis: TechnicalBasis;
  fundamentalBasis: FundamentalBasis;
  sentimentBasis: SentimentBasis;

  updates: StrategyUpdate[];

  // Backtest results (indicative)
  backtest?: {
    winRate: number;
    avgRiskReward: number;
    maxDrawdown: number;
    sampleSize: number;
  };
}

export interface StrategyComparison {
  strategies: TradingStrategy[];
  selectedStrategyId?: string;
}
