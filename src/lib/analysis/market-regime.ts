/**
 * Market Regime Detection
 * Classifies current market conditions to adjust strategy recommendations
 */

export type MarketRegime =
  | "trending_bull"
  | "trending_bear"
  | "range_bound"
  | "high_volatility"
  | "low_volatility";

export interface MarketRegimeData {
  regime: MarketRegime;
  confidence: number; // 0-100
  characteristics: string[];
  strategySuggestions: string[];
  volatilityLevel: "low" | "medium" | "high";
  trendStrength: "weak" | "moderate" | "strong";
}

interface MarketData {
  spyPrice: number;
  spyChange: number;
  vix: number;
  advancers: number;
  decliners: number;
  newHighs: number;
  newLows: number;
}

/**
 * Detect current market regime
 */
export function detectMarketRegime(marketData: MarketData): MarketRegimeData {
  const characteristics: string[] = [];
  const strategySuggestions: string[] = [];

  // VIX Analysis
  let volatilityLevel: "low" | "medium" | "high";
  if (marketData.vix > 30) {
    volatilityLevel = "high";
    characteristics.push(`High volatility (VIX: ${marketData.vix.toFixed(1)})`);
  } else if (marketData.vix > 20) {
    volatilityLevel = "medium";
    characteristics.push(
      `Moderate volatility (VIX: ${marketData.vix.toFixed(1)})`
    );
  } else {
    volatilityLevel = "low";
    characteristics.push(`Low volatility (VIX: ${marketData.vix.toFixed(1)})`);
  }

  // Market Breadth
  const breadthRatio =
    marketData.advancers / (marketData.advancers + marketData.decliners);
  const nhNlRatio =
    marketData.newHighs / (marketData.newHighs + marketData.newLows + 0.01);

  if (breadthRatio > 0.65 && nhNlRatio > 0.6) {
    characteristics.push("Strong positive breadth");
  } else if (breadthRatio < 0.35 && nhNlRatio < 0.4) {
    characteristics.push("Weak breadth, more stocks declining");
  } else {
    characteristics.push("Mixed market breadth");
  }

  // Trend Detection
  let trendStrength: "weak" | "moderate" | "strong";
  const spyChangeAbs = Math.abs(marketData.spyChange);

  if (spyChangeAbs > 2.0) {
    trendStrength = "strong";
  } else if (spyChangeAbs > 1.0) {
    trendStrength = "moderate";
  } else {
    trendStrength = "weak";
  }

  // Determine Regime
  let regime: MarketRegime;
  let confidence = 50;

  if (volatilityLevel === "high") {
    regime = "high_volatility";
    confidence = 75;
    strategySuggestions.push("Reduce position sizes");
    strategySuggestions.push("Use wider stop losses");
    strategySuggestions.push("Focus on high-conviction setups only");
    strategySuggestions.push("Consider hedging strategies");
  } else if (volatilityLevel === "low" && spyChangeAbs < 0.5) {
    regime = "low_volatility";
    confidence = 70;
    strategySuggestions.push("Range-trading opportunities");
    strategySuggestions.push("Tighter stop losses possible");
    strategySuggestions.push("Mean-reversion strategies favorable");
    strategySuggestions.push("Prepare for volatility breakout");
  } else if (marketData.spyChange > 0.8 && breadthRatio > 0.6) {
    regime = "trending_bull";
    confidence = 80;
    characteristics.push("Bullish trend in place");
    strategySuggestions.push("Favor long positions");
    strategySuggestions.push("Buy dips to support");
    strategySuggestions.push("Momentum and breakout strategies");
    strategySuggestions.push("Hold winners, cut losers quickly");
  } else if (marketData.spyChange < -0.8 && breadthRatio < 0.4) {
    regime = "trending_bear";
    confidence = 80;
    characteristics.push("Bearish trend in place");
    strategySuggestions.push("Defensive positioning");
    strategySuggestions.push("Short bounces to resistance");
    strategySuggestions.push("Avoid catching falling knives");
    strategySuggestions.push("Tight stops on longs");
  } else {
    regime = "range_bound";
    confidence = 60;
    characteristics.push("No clear trend");
    strategySuggestions.push("Trade the range");
    strategySuggestions.push("Buy support, sell resistance");
    strategySuggestions.push("Quick profits, defined risk");
    strategySuggestions.push("Wait for breakout confirmation");
  }

  return {
    regime,
    confidence,
    characteristics,
    strategySuggestions,
    volatilityLevel,
    trendStrength,
  };
}

/**
 * Adjust strategy parameters based on market regime
 */
export function adjustForRegime(
  baseStrategy: any,
  regime: MarketRegimeData
): any {
  const adjusted = { ...baseStrategy };

  switch (regime.regime) {
    case "high_volatility":
      // Wider stops, smaller size
      adjusted.stopLoss.percentage *= 1.5;
      adjusted.sizing.recommendedPosition *= 0.6;
      adjusted.notes = [
        ...(adjusted.notes || []),
        "⚠️ High volatility regime - reduced position size",
      ];
      break;

    case "low_volatility":
      // Tighter stops possible
      adjusted.stopLoss.percentage *= 0.8;
      adjusted.notes = [
        ...(adjusted.notes || []),
        "💡 Low volatility - tighter risk management possible",
      ];
      break;

    case "trending_bull":
      // Favor longs, hold longer
      adjusted.confidence += 10;
      adjusted.notes = [
        ...(adjusted.notes || []),
        "📈 Strong bullish market regime supports long positions",
      ];
      break;

    case "trending_bear":
      // Reduce long confidence, tighter stops
      if (adjusted.entries[0]?.type === "LONG") {
        adjusted.confidence -= 15;
        adjusted.stopLoss.percentage *= 0.9;
        adjusted.notes = [
          ...(adjusted.notes || []),
          "⚠️ Bearish market regime - use tight stops on longs",
        ];
      }
      break;

    case "range_bound":
      // Prefer mean reversion
      adjusted.notes = [
        ...(adjusted.notes || []),
        "↔️ Range-bound market - focus on defined risk/reward",
      ];
      break;
  }

  return adjusted;
}
