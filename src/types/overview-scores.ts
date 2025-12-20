/**
 * Overview Investment Scores
 * Key metrics that determine investment attractiveness
 */

export interface InvestmentScores {
  // Primary investment signals (0-100 each)
  potential: {
    score: number;
    factors: {
      valueScore: number; // How undervalued is it?
      growthScore: number; // Growth trajectory
      catalystScore: number; // Upcoming catalysts
    };
    interpretation: string;
  };

  risk: {
    score: number; // Lower is better (0 = no risk, 100 = extreme risk)
    factors: {
      volatility: number;
      fundamentalRisk: number;
      marketRisk: number;
    };
    interpretation: string;
  };

  reward: {
    score: number; // Potential upside
    factors: {
      technicalSetup: number;
      valuationGap: number; // Gap between price and fair value
      momentumScore: number;
    };
    interpretation: string;
  };

  timing: {
    score: number; // Is NOW the right time?
    factors: {
      technicalTiming: number;
      fundamentalTiming: number; // Earnings cycle, catalysts
      marketConditions: number;
    };
    interpretation: string;
  };

  // Overall investment grade
  investmentGrade:
    | "A+"
    | "A"
    | "A-"
    | "B+"
    | "B"
    | "B-"
    | "C+"
    | "C"
    | "C-"
    | "D";
  recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "REDUCE" | "SELL";

  // Key reasons to invest
  topReasons: string[];

  // Key risks to watch
  topRisks: string[];
}

/**
 * Calculate investment potential score
 */
export function calculatePotentialScore(data: {
  peRatio?: number;
  pbRatio?: number;
  pegRatio?: number;
  revenueGrowth?: number;
  profitMargin?: number;
  industryPE?: number;
  catalysts: any[];
}): {
  score: number;
  factors: { valueScore: number; growthScore: number; catalystScore: number };
  interpretation: string;
} {
  // Value Score (0-100)
  let valueScore = 50;

  if (data.peRatio && data.industryPE) {
    const peDiscount =
      ((data.industryPE - data.peRatio) / data.industryPE) * 100;
    if (peDiscount > 30)
      valueScore = 90; // Deeply undervalued
    else if (peDiscount > 15) valueScore = 75;
    else if (peDiscount > 0) valueScore = 60;
    else if (peDiscount > -15) valueScore = 45;
    else valueScore = 25; // Overvalued
  }

  if (data.pegRatio && data.pegRatio < 1.0) valueScore += 10; // Growth at reasonable price
  if (data.pbRatio && data.pbRatio < 1.5) valueScore += 5; // Trading below book value is good

  // Growth Score (0-100)
  let growthScore = 50;

  if (data.revenueGrowth) {
    if (data.revenueGrowth > 30)
      growthScore = 95; // Hyper growth
    else if (data.revenueGrowth > 20) growthScore = 85;
    else if (data.revenueGrowth > 10) growthScore = 70;
    else if (data.revenueGrowth > 5) growthScore = 55;
    else if (data.revenueGrowth > 0) growthScore = 45;
    else growthScore = 25; // Declining revenue
  }

  if (data.profitMargin && data.profitMargin > 20) growthScore += 10; // Strong margins

  // Catalyst Score (0-100)
  let catalystScore = 50;
  const highImportanceCatalysts = data.catalysts.filter(
    (c) => c.importance === "HIGH"
  ).length;
  const mediumImportanceCatalysts = data.catalysts.filter(
    (c) => c.importance === "MEDIUM"
  ).length;

  catalystScore += highImportanceCatalysts * 15;
  catalystScore += mediumImportanceCatalysts * 8;
  catalystScore = Math.min(100, catalystScore);

  // Overall potential
  const score = Math.round(
    valueScore * 0.4 + growthScore * 0.4 + catalystScore * 0.2
  );

  let interpretation = "";
  if (score >= 80) {
    interpretation =
      "Exceptional investment potential - strong value and growth combination";
  } else if (score >= 65) {
    interpretation = "High potential with multiple positive factors";
  } else if (score >= 50) {
    interpretation = "Moderate potential - some attractive qualities";
  } else {
    interpretation = "Limited upside potential at current levels";
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors: {
      valueScore: Math.round(valueScore),
      growthScore: Math.round(growthScore),
      catalystScore: Math.round(catalystScore),
    },
    interpretation,
  };
}

/**
 * Calculate risk score (lower is better)
 */
export function calculateRiskScore(data: {
  atrPercent: number;
  vix: number;
  debtToEquity?: number;
  currentRatio?: number;
  beta?: number;
}): {
  score: number;
  factors: { volatility: number; fundamentalRisk: number; marketRisk: number };
  interpretation: string;
} {
  // Volatility risk (0-100, higher = more risk)
  let volatility = 50;
  if (data.atrPercent > 5) volatility = 85;
  else if (data.atrPercent > 3) volatility = 65;
  else if (data.atrPercent > 2) volatility = 50;
  else if (data.atrPercent > 1) volatility = 35;
  else volatility = 20;

  // Fundamental risk
  let fundamentalRisk = 50;
  if (data.debtToEquity) {
    if (data.debtToEquity > 2.0) fundamentalRisk = 80;
    else if (data.debtToEquity > 1.0) fundamentalRisk = 60;
    else if (data.debtToEquity > 0.5) fundamentalRisk = 40;
    else fundamentalRisk = 25;
  }

  if (data.currentRatio && data.currentRatio < 1.0) fundamentalRisk += 15; // Liquidity risk

  // Market risk
  let marketRisk = 50;
  if (data.vix > 30)
    marketRisk = 80; // High market volatility
  else if (data.vix > 20) marketRisk = 60;
  else if (data.vix > 15) marketRisk = 45;
  else marketRisk = 30;

  const score = Math.round(
    volatility * 0.4 + fundamentalRisk * 0.35 + marketRisk * 0.25
  );

  let interpretation = "";
  if (score <= 30) {
    interpretation = "Low risk profile - suitable for conservative investors";
  } else if (score <= 50) {
    interpretation = "Moderate risk - standard for equity investments";
  } else if (score <= 70) {
    interpretation = "Elevated risk - careful position sizing recommended";
  } else {
    interpretation = "High risk - only for aggressive risk tolerance";
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors: {
      volatility: Math.round(volatility),
      fundamentalRisk: Math.round(fundamentalRisk),
      marketRisk: Math.round(marketRisk),
    },
    interpretation,
  };
}

/**
 * Calculate reward score (potential upside)
 */
export function calculateRewardScore(data: {
  technicalScore: number;
  currentPrice: number;
  resistance?: number;
  fairValue?: number;
  sentimentScore: number;
}): {
  score: number;
  factors: {
    technicalSetup: number;
    valuationGap: number;
    momentumScore: number;
  };
  interpretation: string;
} {
  // Technical setup
  const technicalSetup = data.technicalScore;

  // Valuation gap (how much upside to fair value)
  let valuationGap = 50;
  if (data.fairValue && data.currentPrice) {
    const upside =
      ((data.fairValue - data.currentPrice) / data.currentPrice) * 100;
    if (upside > 50) valuationGap = 95;
    else if (upside > 30) valuationGap = 85;
    else if (upside > 15) valuationGap = 70;
    else if (upside > 5) valuationGap = 55;
    else if (upside > -5) valuationGap = 45;
    else valuationGap = 25; // Overvalued
  }

  // Momentum score
  const momentumScore = data.sentimentScore;

  const score = Math.round(
    technicalSetup * 0.35 + valuationGap * 0.4 + momentumScore * 0.25
  );

  let interpretation = "";
  if (score >= 75) {
    interpretation = "High reward potential with multiple catalysts aligned";
  } else if (score >= 60) {
    interpretation = "Good upside potential with favorable setup";
  } else if (score >= 45) {
    interpretation = "Moderate upside - limited near-term catalysts";
  } else {
    interpretation = "Limited upside at current levels";
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors: {
      technicalSetup: Math.round(technicalSetup),
      valuationGap: Math.round(valuationGap),
      momentumScore: Math.round(momentumScore),
    },
    interpretation,
  };
}
