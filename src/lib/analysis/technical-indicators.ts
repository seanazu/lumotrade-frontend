/**
 * Technical Indicators Library
 * Comprehensive technical analysis indicators
 */

import {
  SMA,
  EMA,
  RSI,
  MACD,
  BollingerBands,
  ATR,
  Stochastic,
  ADX,
  WilliamsR,
  CCI,
  OBV,
  VWAP,
} from "technicalindicators";

export interface CandleData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  // Trend
  sma20: number;
  sma50: number;
  sma100: number;
  sma200: number;
  ema20: number;
  ema50: number;

  // Momentum
  rsi: number;
  rsiSignal: "overbought" | "oversold" | "neutral";
  rsiDivergence: "bullish" | "bearish" | "none";
  stochastic: { k: number; d: number; signal: string };
  williamsR: number;
  cci: number;

  // Trend Strength
  macd: { value: number; signal: number; histogram: number; crossover: string };
  adx: number;
  adxSignal: "strong_trend" | "weak_trend" | "no_trend";

  // Volatility
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    squeeze: boolean;
  };
  atr: number;
  atrPercent: number;

  // Volume
  obv: number;
  obvTrend: "rising" | "falling" | "flat";
  vwap: number;
  volumeTrend: "increasing" | "decreasing" | "stable";

  // Multi-timeframe
  trendAlignment: {
    daily: "bullish" | "bearish" | "neutral";
    weekly: "bullish" | "bearish" | "neutral";
    aligned: boolean;
  };

  // Composite
  technicalScore: number; // 0-100
}

export interface MultiTimeframeData {
  daily: CandleData[];
  weekly: CandleData[];
}

/**
 * Calculate all technical indicators for a dataset
 */
export function calculateAllIndicators(
  candles: CandleData[],
  currentPrice: number
): TechnicalIndicators {
  if (!candles || candles.length < 200) {
    throw new Error(
      "Insufficient data for technical analysis (need 200+ candles)"
    );
  }

  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const volumes = candles.map((c) => c.volume);

  // Trend Indicators
  const sma20Data = SMA.calculate({ period: 20, values: closes });
  const sma50Data = SMA.calculate({ period: 50, values: closes });
  const sma100Data = SMA.calculate({ period: 100, values: closes });
  const sma200Data = SMA.calculate({ period: 200, values: closes });
  const ema20Data = EMA.calculate({ period: 20, values: closes });
  const ema50Data = EMA.calculate({ period: 50, values: closes });

  const sma20 = sma20Data[sma20Data.length - 1] || 0;
  const sma50 = sma50Data[sma50Data.length - 1] || 0;
  const sma100 = sma100Data[sma100Data.length - 1] || 0;
  const sma200 = sma200Data[sma200Data.length - 1] || 0;
  const ema20 = ema20Data[ema20Data.length - 1] || 0;
  const ema50 = ema50Data[ema50Data.length - 1] || 0;

  // Momentum Indicators
  const rsiData = RSI.calculate({ period: 14, values: closes });
  const rsi = rsiData[rsiData.length - 1] || 50;
  const rsiSignal = rsi > 70 ? "overbought" : rsi < 30 ? "oversold" : "neutral";

  // RSI Divergence (simplified - compare last 20 candles)
  const recentRsi = rsiData.slice(-20);
  const recentPrices = closes.slice(-20);
  const rsiDivergence = detectDivergence(recentPrices, recentRsi);

  const stochasticData = Stochastic.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
    signalPeriod: 3,
  });
  const stochastic = stochasticData[stochasticData.length - 1] || {
    k: 50,
    d: 50,
  };
  const stochasticSignal =
    stochastic.k > 80
      ? "overbought"
      : stochastic.k < 20
        ? "oversold"
        : "neutral";

  const williamsRData = WilliamsR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
  });
  const williamsR = williamsRData[williamsRData.length - 1] || -50;

  const cciData = CCI.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 20,
  });
  const cci = cciData[cciData.length - 1] || 0;

  // MACD
  const macdData = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const macdLast: any = macdData[macdData.length - 1] || {
    MACD: 0,
    signal: 0,
    histogram: 0,
  };
  const macdPrev: any = macdData[macdData.length - 2] || macdLast;
  const macdCrossover =
    (macdLast.MACD ?? 0) > (macdLast.signal ?? 0) &&
    (macdPrev.MACD ?? 0) <= (macdPrev.signal ?? 0)
      ? "bullish"
      : (macdLast.MACD ?? 0) < (macdLast.signal ?? 0) &&
          (macdPrev.MACD ?? 0) >= (macdPrev.signal ?? 0)
        ? "bearish"
        : "none";

  // ADX (trend strength)
  const adxData = ADX.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
  });
  const adx = adxData[adxData.length - 1]?.adx || 20;
  const adxSignal =
    adx > 25 ? "strong_trend" : adx > 15 ? "weak_trend" : "no_trend";

  // Bollinger Bands
  const bbData = BollingerBands.calculate({
    period: 20,
    values: closes,
    stdDev: 2,
  });
  const bb = bbData[bbData.length - 1] || {
    upper: currentPrice * 1.05,
    middle: currentPrice,
    lower: currentPrice * 0.95,
  };
  // Squeeze detection: bands are narrow
  const bbWidth = bb.upper - bb.lower;
  const bbWidthPercent = (bbWidth / bb.middle) * 100;
  const squeeze = bbWidthPercent < 4; // Less than 4% width = squeeze

  // ATR
  const atrData = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
  });
  const atr = atrData[atrData.length - 1] || 0;
  const atrPercent = (atr / currentPrice) * 100;

  // Volume Indicators
  const obvData = OBV.calculate({ close: closes, volume: volumes });
  const obv = obvData[obvData.length - 1] || 0;
  const obvPrev = obvData[obvData.length - 20] || obv;
  const obvTrend =
    obv > obvPrev * 1.05 ? "rising" : obv < obvPrev * 0.95 ? "falling" : "flat";

  // VWAP (simplified - would need intraday for true VWAP)
  const vwap =
    candles.reduce((sum, c) => sum + c.close * c.volume, 0) /
    candles.reduce((sum, c) => sum + c.volume, 0);

  // Volume Trend
  const recentVolume = volumes.slice(-20);
  const avgRecentVolume =
    recentVolume.reduce((a, b) => a + b, 0) / recentVolume.length;
  const olderVolume = volumes.slice(-40, -20);
  const avgOlderVolume =
    olderVolume.reduce((a, b) => a + b, 0) / olderVolume.length;
  const volumeTrend =
    avgRecentVolume > avgOlderVolume * 1.2
      ? "increasing"
      : avgRecentVolume < avgOlderVolume * 0.8
        ? "decreasing"
        : "stable";

  // Multi-timeframe (simplified - using SMA alignment)
  const dailyTrend: "bullish" | "bearish" | "neutral" =
    currentPrice > sma20 && sma20 > sma50
      ? "bullish"
      : currentPrice < sma20 && sma20 < sma50
        ? "bearish"
        : "neutral";

  // For weekly, approximate by using longer SMAs
  const weeklyTrend: "bullish" | "bearish" | "neutral" =
    sma50 > sma100 && sma100 > sma200
      ? "bullish"
      : sma50 < sma100 && sma100 < sma200
        ? "bearish"
        : "neutral";

  const trendAlignment = {
    daily: dailyTrend,
    weekly: weeklyTrend,
    aligned: dailyTrend === weeklyTrend && dailyTrend !== "neutral",
  };

  // Calculate composite technical score
  const technicalScore = calculateTechnicalScore({
    rsi,
    macd: macdLast,
    adx,
    currentPrice,
    sma20,
    sma50,
    sma200,
    bollingerBands: bb,
    stochastic,
    obvTrend,
    trendAlignment,
  });

  return {
    sma20,
    sma50,
    sma100,
    sma200,
    ema20,
    ema50,
    rsi,
    rsiSignal,
    rsiDivergence,
    stochastic: { k: stochastic.k, d: stochastic.d, signal: stochasticSignal },
    williamsR,
    cci,
    macd: {
      value: macdLast.MACD ?? 0,
      signal: macdLast.signal ?? 0,
      histogram: macdLast.histogram ?? 0,
      crossover: macdCrossover,
    },
    adx,
    adxSignal,
    bollingerBands: { ...bb, squeeze },
    atr,
    atrPercent,
    obv,
    obvTrend,
    vwap,
    volumeTrend,
    trendAlignment,
    technicalScore,
  };
}

/**
 * Detect price/indicator divergence
 */
function detectDivergence(
  prices: number[],
  indicator: number[]
): "bullish" | "bearish" | "none" {
  if (prices.length < 10 || indicator.length < 10) return "none";

  const priceFirst = prices[0];
  const priceLast = prices[prices.length - 1];
  const indFirst = indicator[0];
  const indLast = indicator[indicator.length - 1];

  // Bullish divergence: price makes lower low, indicator makes higher low
  if (priceLast < priceFirst && indLast > indFirst) {
    return "bullish";
  }

  // Bearish divergence: price makes higher high, indicator makes lower high
  if (priceLast > priceFirst && indLast < indFirst) {
    return "bearish";
  }

  return "none";
}

/**
 * Calculate composite technical score (0-100)
 */
function calculateTechnicalScore(params: {
  rsi: number;
  macd: { MACD: number; signal: number; histogram: number };
  adx: number;
  currentPrice: number;
  sma20: number;
  sma50: number;
  sma200: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  stochastic: { k: number; d: number };
  obvTrend: string;
  trendAlignment: { aligned: boolean };
}): number {
  let score = 50; // Start neutral

  // Trend Score (25 points)
  if (params.currentPrice > params.sma20) score += 5;
  if (params.currentPrice > params.sma50) score += 5;
  if (params.currentPrice > params.sma200) score += 5;
  if (params.sma20 > params.sma50) score += 5;
  if (params.sma50 > params.sma200) score += 5;

  // Momentum Score (25 points)
  if (params.rsi > 50 && params.rsi < 70) score += 8;
  else if (params.rsi >= 70)
    score += 3; // Overbought
  else if (params.rsi < 30) score -= 5; // Oversold

  if (params.macd.MACD > params.macd.signal) score += 8;
  if (params.macd.histogram > 0) score += 5;
  if (params.stochastic.k > params.stochastic.d && params.stochastic.k < 80)
    score += 4;

  // Trend Strength (15 points)
  if (params.adx > 25) score += 10;
  else if (params.adx > 15) score += 5;

  if (params.trendAlignment.aligned) score += 5;

  // Volume (10 points)
  if (params.obvTrend === "rising") score += 10;
  else if (params.obvTrend === "flat") score += 5;

  // Position relative to Bollinger Bands (10 points)
  const bbPosition =
    (params.currentPrice - params.bollingerBands.lower) /
    (params.bollingerBands.upper - params.bollingerBands.lower);
  if (bbPosition > 0.5 && bbPosition < 0.8) score += 10;
  else if (bbPosition >= 0.8)
    score += 5; // Near upper
  else if (bbPosition <= 0.2) score -= 5; // Near lower

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate indicator interpretation for UI
 */
export function interpretIndicators(indicators: TechnicalIndicators): {
  summary: string;
  signals: Array<{ indicator: string; signal: string; color: string }>;
} {
  const signals: Array<{ indicator: string; signal: string; color: string }> =
    [];

  // RSI
  if (indicators.rsi > 70) {
    signals.push({
      indicator: "RSI",
      signal: "Overbought - Consider taking profits",
      color: "red",
    });
  } else if (indicators.rsi < 30) {
    signals.push({
      indicator: "RSI",
      signal: "Oversold - Potential bounce opportunity",
      color: "green",
    });
  } else if (indicators.rsi > 50) {
    signals.push({
      indicator: "RSI",
      signal: "Bullish momentum",
      color: "emerald",
    });
  }

  // MACD
  if (indicators.macd.crossover === "bullish") {
    signals.push({
      indicator: "MACD",
      signal: "Bullish crossover detected",
      color: "emerald",
    });
  } else if (indicators.macd.crossover === "bearish") {
    signals.push({
      indicator: "MACD",
      signal: "Bearish crossover detected",
      color: "red",
    });
  }

  // Trend
  if (indicators.adxSignal === "strong_trend") {
    signals.push({
      indicator: "ADX",
      signal: "Strong trend in place",
      color: "blue",
    });
  }

  // Bollinger Bands
  if (indicators.bollingerBands.squeeze) {
    signals.push({
      indicator: "Bollinger Bands",
      signal: "Squeeze detected - Breakout imminent",
      color: "amber",
    });
  }

  // Volume
  if (indicators.volumeTrend === "increasing") {
    signals.push({
      indicator: "Volume",
      signal: "Increasing volume confirms move",
      color: "emerald",
    });
  }

  // Multi-timeframe
  if (indicators.trendAlignment.aligned) {
    signals.push({
      indicator: "Multi-Timeframe",
      signal: `${indicators.trendAlignment.daily} alignment across timeframes`,
      color: indicators.trendAlignment.daily === "bullish" ? "emerald" : "red",
    });
  }

  // Generate summary
  let summary = "";
  if (indicators.technicalScore >= 70) {
    summary =
      "Strong bullish technical setup with multiple confirming indicators.";
  } else if (indicators.technicalScore >= 55) {
    summary =
      "Moderately bullish technical picture with some supporting signals.";
  } else if (indicators.technicalScore >= 45) {
    summary =
      "Neutral technical setup. Wait for clearer signals before entering.";
  } else if (indicators.technicalScore >= 30) {
    summary = "Moderately bearish technicals. Caution advised on long entries.";
  } else {
    summary = "Weak technical setup. Multiple bearish signals present.";
  }

  return { summary, signals };
}
