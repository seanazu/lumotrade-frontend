/**
 * Multi-Factor Scoring System
 * Generates composite scores from fundamental, technical, sentiment, and pattern analysis
 */

import type { TechnicalIndicators } from "../analysis/technical-indicators";
import type { SentimentScore } from "../analysis/sentiment-engine";
import type { Pattern } from "../analysis/pattern-recognition";

export interface FactorScores {
  fundamental: {
    score: number; // 0-100
    components: {
      profitability: number;
      growth: number;
      valuation: number;
      financialHealth: number;
    };
    interpretation: string;
  };

  technical: {
    score: number; // 0-100
    components: {
      trend: number;
      momentum: number;
      volume: number;
      support: number;
    };
    interpretation: string;
  };

  sentiment: {
    score: number; // 0-100
    components: {
      news: number;
      social: number;
      analyst: number;
      insider: number;
    };
    interpretation: string;
  };

  pattern: {
    score: number; // 0-100
    highConfidence: Pattern[];
    mediumConfidence: Pattern[];
    interpretation: string;
  };

  composite: number; // 0-100 weighted average
  rating: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
}

/**
 * Calculate fundamental score from financial data
 */
export function calculateFundamentalScore(financials: any): {
  score: number;
  components: {
    profitability: number;
    growth: number;
    valuation: number;
    financialHealth: number;
  };
} {
  if (!financials || !financials.ratios) {
    return {
      score: 50,
      components: {
        profitability: 50,
        growth: 50,
        valuation: 50,
        financialHealth: 50,
      },
    };
  }

  const ratios = financials.ratios;
  const keyMetrics = financials.keyMetrics || {};

  // Profitability (0-100)
  let profitability = 50;
  if (ratios.returnOnEquity) {
    if (ratios.returnOnEquity > 20) profitability = 90;
    else if (ratios.returnOnEquity > 15) profitability = 75;
    else if (ratios.returnOnEquity > 10) profitability = 60;
    else if (ratios.returnOnEquity > 5) profitability = 45;
    else profitability = 30;
  }

  if (ratios.netProfitMargin > 20) profitability += 10;
  else if (ratios.netProfitMargin < 5) profitability -= 10;

  // Growth (0-100)
  let growth = 50;
  if (ratios.revenueGrowth) {
    if (ratios.revenueGrowth > 30) growth = 95;
    else if (ratios.revenueGrowth > 20) growth = 80;
    else if (ratios.revenueGrowth > 10) growth = 65;
    else if (ratios.revenueGrowth > 5) growth = 55;
    else if (ratios.revenueGrowth > 0) growth = 45;
    else growth = 25;
  }

  if (ratios.epsGrowth > 15) growth += 10;
  else if (ratios.epsGrowth < 0) growth -= 15;

  // Valuation (0-100, where 100 = most undervalued)
  let valuation = 50;
  if (ratios.peRatio) {
    // Industry average P/E is ~15-20
    if (ratios.peRatio < 10) valuation = 85;
    else if (ratios.peRatio < 15) valuation = 70;
    else if (ratios.peRatio < 25) valuation = 55;
    else if (ratios.peRatio < 40) valuation = 40;
    else valuation = 25;
  }

  if (ratios.pbRatio && ratios.pbRatio < 1.5) valuation += 10;
  if (keyMetrics.peRatio && keyMetrics.pegRatio < 1.0) valuation += 15;

  // Financial Health (0-100)
  let health = 50;
  if (ratios.currentRatio) {
    if (ratios.currentRatio > 2.0) health = 85;
    else if (ratios.currentRatio > 1.5) health = 70;
    else if (ratios.currentRatio > 1.0) health = 55;
    else health = 35;
  }

  if (ratios.debtToEquity) {
    if (ratios.debtToEquity < 0.3) health += 15;
    else if (ratios.debtToEquity < 0.5) health += 5;
    else if (ratios.debtToEquity > 2.0) health -= 20;
  }

  // Clamp all to 0-100
  profitability = Math.max(0, Math.min(100, profitability));
  growth = Math.max(0, Math.min(100, growth));
  valuation = Math.max(0, Math.min(100, valuation));
  health = Math.max(0, Math.min(100, health));

  // Weighted average (growth and profitability matter most for traders)
  const score =
    profitability * 0.3 + growth * 0.35 + valuation * 0.2 + health * 0.15;

  return {
    score: Math.round(score),
    components: {
      profitability: Math.round(profitability),
      growth: Math.round(growth),
      valuation: Math.round(valuation),
      financialHealth: Math.round(health),
    },
  };
}

/**
 * Calculate pattern score
 */
export function calculatePatternScore(patterns: Pattern[]): {
  score: number;
  highConfidence: Pattern[];
  mediumConfidence: Pattern[];
} {
  const highConfidence = patterns.filter((p) => p.confidence === "HIGH");
  const mediumConfidence = patterns.filter((p) => p.confidence === "MEDIUM");

  // Score based on number and quality of patterns
  let score = 50;

  score += highConfidence.length * 15; // Each high-confidence pattern adds 15 points
  score += mediumConfidence.length * 8; // Each medium-confidence pattern adds 8 points

  // Bullish vs bearish patterns
  const bullishPatterns = patterns.filter(
    (p) =>
      p.type.toLowerCase().includes("bull") ||
      p.type.toLowerCase().includes("hammer") ||
      p.type.toLowerCase().includes("morning") ||
      p.type.toLowerCase().includes("ascending") ||
      p.type.toLowerCase().includes("accumulation")
  );

  const bearishPatterns = patterns.filter(
    (p) =>
      p.type.toLowerCase().includes("bear") ||
      p.type.toLowerCase().includes("shooting") ||
      p.type.toLowerCase().includes("evening") ||
      p.type.toLowerCase().includes("descending") ||
      p.type.toLowerCase().includes("distribution")
  );

  if (bullishPatterns.length > bearishPatterns.length) {
    score += 10;
  } else if (bearishPatterns.length > bullishPatterns.length) {
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    highConfidence,
    mediumConfidence,
  };
}

/**
 * Calculate composite score from all factors
 */
export function calculateCompositeScore(scores: {
  fundamental: number;
  technical: number;
  sentiment: number;
  pattern: number;
}): {
  composite: number;
  rating: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
} {
  // Weighted average (technical and patterns matter most for short-term trades)
  const composite =
    scores.fundamental * 0.2 +
    scores.technical * 0.35 +
    scores.sentiment * 0.2 +
    scores.pattern * 0.25;

  let rating: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
  if (composite >= 75) rating = "strong_buy";
  else if (composite >= 60) rating = "buy";
  else if (composite >= 40) rating = "hold";
  else if (composite >= 25) rating = "sell";
  else rating = "strong_sell";

  return {
    composite: Math.round(composite),
    rating,
  };
}

/**
 * Generate factor scores with interpretations
 */
export function generateFactorScores(data: {
  financials: any;
  technicals: TechnicalIndicators;
  sentiment: SentimentScore;
  patterns: Pattern[];
}): FactorScores {
  // Fundamental
  const fundamental = calculateFundamentalScore(data.financials);
  let fundamentalInterpretation = "";
  if (fundamental.score >= 70) {
    fundamentalInterpretation =
      "Strong fundamentals with solid growth and profitability";
  } else if (fundamental.score >= 55) {
    fundamentalInterpretation =
      "Decent fundamentals, some strengths and weaknesses";
  } else if (fundamental.score >= 40) {
    fundamentalInterpretation = "Mixed fundamental picture, exercise caution";
  } else {
    fundamentalInterpretation =
      "Weak fundamentals, significant concerns present";
  }

  // Technical (already calculated in technical-indicators.ts)
  const technicalScore = data.technicals.technicalScore;
  let technicalInterpretation = "";
  if (technicalScore >= 70) {
    technicalInterpretation = "Strong bullish technical setup";
  } else if (technicalScore >= 55) {
    technicalInterpretation = "Moderately bullish technicals";
  } else if (technicalScore >= 45) {
    technicalInterpretation = "Neutral technical picture";
  } else if (technicalScore >= 30) {
    technicalInterpretation = "Moderately bearish technicals";
  } else {
    technicalInterpretation = "Weak bearish setup";
  }

  // Pattern
  const pattern = calculatePatternScore(data.patterns);
  let patternInterpretation = "";
  if (pattern.highConfidence.length > 0) {
    patternInterpretation = `${pattern.highConfidence.length} high-confidence pattern(s) detected`;
  } else if (pattern.mediumConfidence.length > 0) {
    patternInterpretation = `${pattern.mediumConfidence.length} medium-confidence pattern(s) detected`;
  } else {
    patternInterpretation = "No clear patterns detected";
  }

  // Composite
  const { composite, rating } = calculateCompositeScore({
    fundamental: fundamental.score,
    technical: technicalScore,
    sentiment: data.sentiment.score,
    pattern: pattern.score,
  });

  return {
    fundamental: {
      score: fundamental.score,
      components: fundamental.components,
      interpretation: fundamentalInterpretation,
    },
    technical: {
      score: technicalScore,
      components: {
        trend: 0, // Would need to break down from technicals
        momentum: 0,
        volume: 0,
        support: 0,
      },
      interpretation: technicalInterpretation,
    },
    sentiment: {
      score: data.sentiment.score,
      components: {
        news: data.sentiment.components.news.score,
        social: data.sentiment.components.social.score,
        analyst: data.sentiment.components.analyst.score,
        insider: data.sentiment.components.insider.score,
      },
      interpretation: data.sentiment.interpretation,
    },
    pattern: {
      score: pattern.score,
      highConfidence: pattern.highConfidence,
      mediumConfidence: pattern.mediumConfidence,
      interpretation: patternInterpretation,
    },
    composite,
    rating,
  };
}
