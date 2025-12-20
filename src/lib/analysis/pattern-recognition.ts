/**
 * Enhanced Pattern Recognition
 * Chart patterns, candlestick patterns, and volume patterns
 */

export interface CandleData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Pattern {
  type: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  target: number;
  invalidation: number;
  description: string;
  category: "chart" | "candlestick" | "harmonic" | "volume";
  formationProgress: number; // 0-100
}

/**
 * Detect all patterns in the dataset
 */
export function detectAllPatterns(
  candles: CandleData[],
  currentPrice: number
): Pattern[] {
  const patterns: Pattern[] = [];

  // Chart patterns
  patterns.push(...detectChartPatterns(candles, currentPrice));

  // Candlestick patterns
  patterns.push(...detectCandlestickPatterns(candles, currentPrice));

  // Volume patterns
  patterns.push(...detectVolumePatterns(candles, currentPrice));

  return patterns.sort((a, b) => {
    const confScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return confScore[b.confidence] - confScore[a.confidence];
  });
}

/**
 * Detect chart patterns (trend lines, shapes)
 */
function detectChartPatterns(
  candles: CandleData[],
  currentPrice: number
): Pattern[] {
  const patterns: Pattern[] = [];

  if (candles.length < 50) return patterns;

  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  // Double Bottom
  const doubleBottom = findDoubleBottom(lows, closes, currentPrice);
  if (doubleBottom) patterns.push(doubleBottom);

  // Double Top
  const doubleTop = findDoubleTop(highs, closes, currentPrice);
  if (doubleTop) patterns.push(doubleTop);

  // Head and Shoulders
  const headShoulders = findHeadAndShoulders(highs, lows, closes, currentPrice);
  if (headShoulders) patterns.push(headShoulders);

  // Ascending Triangle
  const ascendingTriangle = findAscendingTriangle(highs, lows, currentPrice);
  if (ascendingTriangle) patterns.push(ascendingTriangle);

  // Descending Triangle
  const descendingTriangle = findDescendingTriangle(highs, lows, currentPrice);
  if (descendingTriangle) patterns.push(descendingTriangle);

  return patterns;
}

/**
 * Detect candlestick patterns (1-3 candle patterns)
 */
function detectCandlestickPatterns(
  candles: CandleData[],
  currentPrice: number
): Pattern[] {
  const patterns: Pattern[] = [];

  if (candles.length < 3) return patterns;

  const recent = candles.slice(-5);
  const lastCandle = recent[recent.length - 1];
  const body = Math.abs(lastCandle.close - lastCandle.open);
  const range = lastCandle.high - lastCandle.low;

  // Single candle patterns
  if (range > 0) {
    const upperShadow =
      lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
    const lowerShadow =
      Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;

    // Hammer (bullish reversal)
    if (
      lowerShadow > body * 2 &&
      upperShadow < body * 0.3 &&
      lastCandle.close > lastCandle.open
    ) {
      patterns.push({
        type: "Hammer",
        confidence: "MEDIUM",
        target: currentPrice * 1.05,
        invalidation: lastCandle.low,
        description:
          "Bullish reversal pattern suggesting buying pressure at lows",
        category: "candlestick",
        formationProgress: 100,
      });
    }

    // Shooting Star (bearish reversal)
    if (
      upperShadow > body * 2 &&
      lowerShadow < body * 0.3 &&
      lastCandle.close < lastCandle.open
    ) {
      patterns.push({
        type: "Shooting Star",
        confidence: "MEDIUM",
        target: currentPrice * 0.95,
        invalidation: lastCandle.high,
        description: "Bearish reversal pattern indicating rejection at highs",
        category: "candlestick",
        formationProgress: 100,
      });
    }

    // Doji (indecision)
    if (body < range * 0.1) {
      patterns.push({
        type: "Doji",
        confidence: "LOW",
        target: currentPrice * 1.02,
        invalidation: currentPrice * 0.98,
        description: "Indecision candle - wait for directional confirmation",
        category: "candlestick",
        formationProgress: 100,
      });
    }
  }

  // Two candle patterns
  if (recent.length >= 2) {
    const prev = recent[recent.length - 2];
    const curr = recent[recent.length - 1];

    // Bullish Engulfing
    if (
      prev.close < prev.open &&
      curr.close > curr.open &&
      curr.close > prev.open &&
      curr.open < prev.close
    ) {
      patterns.push({
        type: "Bullish Engulfing",
        confidence: "HIGH",
        target: currentPrice * 1.08,
        invalidation: curr.low,
        description:
          "Strong bullish reversal - bulls overwhelmed bears completely",
        category: "candlestick",
        formationProgress: 100,
      });
    }

    // Bearish Engulfing
    if (
      prev.close > prev.open &&
      curr.close < curr.open &&
      curr.close < prev.open &&
      curr.open > prev.close
    ) {
      patterns.push({
        type: "Bearish Engulfing",
        confidence: "HIGH",
        target: currentPrice * 0.92,
        invalidation: curr.high,
        description:
          "Strong bearish reversal - bears overwhelmed bulls completely",
        category: "candlestick",
        formationProgress: 100,
      });
    }
  }

  // Three candle patterns
  if (recent.length >= 3) {
    const c0 = recent[recent.length - 3];
    const c1 = recent[recent.length - 2];
    const c2 = recent[recent.length - 1];

    // Morning Star (3-candle bullish reversal)
    if (
      c0.close < c0.open &&
      Math.abs(c1.close - c1.open) < (c1.high - c1.low) * 0.3 &&
      c2.close > c2.open &&
      c2.close > (c0.open + c0.close) / 2
    ) {
      patterns.push({
        type: "Morning Star",
        confidence: "HIGH",
        target: currentPrice * 1.08,
        invalidation: Math.min(c0.low, c1.low, c2.low),
        description:
          "Three-candle bullish reversal pattern - strong buy signal",
        category: "candlestick",
        formationProgress: 100,
      });
    }

    // Evening Star (3-candle bearish reversal)
    if (
      c0.close > c0.open &&
      Math.abs(c1.close - c1.open) < (c1.high - c1.low) * 0.3 &&
      c2.close < c2.open &&
      c2.close < (c0.open + c0.close) / 2
    ) {
      patterns.push({
        type: "Evening Star",
        confidence: "HIGH",
        target: currentPrice * 0.92,
        invalidation: Math.max(c0.high, c1.high, c2.high),
        description:
          "Three-candle bearish reversal pattern - strong sell signal",
        category: "candlestick",
        formationProgress: 100,
      });
    }

    // Three White Soldiers
    if (
      c0.close > c0.open &&
      c1.close > c1.open &&
      c2.close > c2.open &&
      c1.close > c0.close &&
      c2.close > c1.close
    ) {
      patterns.push({
        type: "Three White Soldiers",
        confidence: "MEDIUM",
        target: currentPrice * 1.06,
        invalidation: c0.low,
        description:
          "Three consecutive bullish candles - strong buying momentum",
        category: "candlestick",
        formationProgress: 100,
      });
    }

    // Three Black Crows
    if (
      c0.close < c0.open &&
      c1.close < c1.open &&
      c2.close < c2.open &&
      c1.close < c0.close &&
      c2.close < c1.close
    ) {
      patterns.push({
        type: "Three Black Crows",
        confidence: "MEDIUM",
        target: currentPrice * 0.94,
        invalidation: c0.high,
        description:
          "Three consecutive bearish candles - strong selling momentum",
        category: "candlestick",
        formationProgress: 100,
      });
    }
  }

  return patterns;
}

/**
 * Detect volume patterns (Wyckoff, climax, divergence)
 */
function detectVolumePatterns(
  candles: CandleData[],
  currentPrice: number
): Pattern[] {
  const patterns: Pattern[] = [];

  if (candles.length < 20) return patterns;

  const volumes = candles.map((c) => c.volume);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const lastVolume = volumes[volumes.length - 1];

  // Volume Climax (extremely high volume)
  if (lastVolume > avgVolume * 3) {
    const lastCandle = candles[candles.length - 1];
    const isBullish = lastCandle.close > lastCandle.open;

    patterns.push({
      type: isBullish ? "Bullish Volume Climax" : "Bearish Volume Climax",
      confidence: "MEDIUM",
      target: isBullish ? currentPrice * 1.06 : currentPrice * 0.94,
      invalidation: isBullish ? lastCandle.low : lastCandle.high,
      description: `Extreme volume spike suggests ${isBullish ? "strong buying" : "heavy selling"} pressure`,
      category: "volume",
      formationProgress: 100,
    });
  }

  // Volume Divergence (price rising on falling volume = weak)
  const recentCandles = candles.slice(-10);
  const priceChange =
    recentCandles[recentCandles.length - 1].close - recentCandles[0].close;
  const volumeChange =
    recentCandles[recentCandles.length - 1].volume - recentCandles[0].volume;

  if (priceChange > 0 && volumeChange < -avgVolume * 0.2) {
    patterns.push({
      type: "Bearish Volume Divergence",
      confidence: "MEDIUM",
      target: currentPrice * 0.96,
      invalidation: currentPrice * 1.03,
      description: "Price rising on declining volume suggests weak rally",
      category: "volume",
      formationProgress: 80,
    });
  } else if (priceChange < 0 && volumeChange < -avgVolume * 0.2) {
    patterns.push({
      type: "Bullish Volume Divergence",
      confidence: "MEDIUM",
      target: currentPrice * 1.04,
      invalidation: currentPrice * 0.97,
      description:
        "Price falling on declining volume suggests selling exhaustion",
      category: "volume",
      formationProgress: 80,
    });
  }

  return patterns;
}

// Helper functions for chart patterns

function findDoubleBottom(
  lows: number[],
  closes: number[],
  currentPrice: number
): Pattern | null {
  // Simplified: find two similar lows with a rally in between
  if (lows.length < 30) return null;

  const recent = lows.slice(-30);
  const min1Idx = recent.indexOf(Math.min(...recent.slice(0, 15)));
  const min2Idx = 15 + recent.slice(15).indexOf(Math.min(...recent.slice(15)));

  const min1 = recent[min1Idx];
  const min2 = recent[min2Idx];

  if (Math.abs(min1 - min2) / min1 < 0.03 && min1 < currentPrice) {
    return {
      type: "Double Bottom",
      confidence: "MEDIUM",
      target: currentPrice + (currentPrice - min1),
      invalidation: Math.min(min1, min2) * 0.99,
      description:
        "Double bottom suggests strong support and potential reversal",
      category: "chart",
      formationProgress: 85,
    };
  }

  return null;
}

function findDoubleTop(
  highs: number[],
  closes: number[],
  currentPrice: number
): Pattern | null {
  if (highs.length < 30) return null;

  const recent = highs.slice(-30);
  const max1Idx = recent.indexOf(Math.max(...recent.slice(0, 15)));
  const max2Idx = 15 + recent.slice(15).indexOf(Math.max(...recent.slice(15)));

  const max1 = recent[max1Idx];
  const max2 = recent[max2Idx];

  if (Math.abs(max1 - max2) / max1 < 0.03 && max1 > currentPrice) {
    return {
      type: "Double Top",
      confidence: "MEDIUM",
      target: currentPrice - (max1 - currentPrice),
      invalidation: Math.max(max1, max2) * 1.01,
      description:
        "Double top indicates strong resistance and potential reversal",
      category: "chart",
      formationProgress: 85,
    };
  }

  return null;
}

function findHeadAndShoulders(
  highs: number[],
  lows: number[],
  closes: number[],
  currentPrice: number
): Pattern | null {
  // Simplified H&S detection
  if (highs.length < 50) return null;

  const recent = highs.slice(-50);
  const third = Math.floor(recent.length / 3);

  const leftShoulder = Math.max(...recent.slice(0, third));
  const head = Math.max(...recent.slice(third, third * 2));
  const rightShoulder = Math.max(...recent.slice(third * 2));

  if (
    head > leftShoulder * 1.03 &&
    head > rightShoulder * 1.03 &&
    Math.abs(leftShoulder - rightShoulder) / leftShoulder < 0.05
  ) {
    const neckline = Math.min(...lows.slice(-50));

    return {
      type: "Head and Shoulders",
      confidence: "HIGH",
      target: neckline - (head - neckline),
      invalidation: head,
      description:
        "Classic reversal pattern indicating potential trend change to downside",
      category: "chart",
      formationProgress: 90,
    };
  }

  return null;
}

function findAscendingTriangle(
  highs: number[],
  lows: number[],
  currentPrice: number
): Pattern | null {
  if (highs.length < 30) return null;

  const recentHighs = highs.slice(-30);
  const recentLows = lows.slice(-30);

  // Check if highs are flat (resistance)
  const maxHigh = Math.max(...recentHighs);
  const highsNearMax = recentHighs.filter((h) => h > maxHigh * 0.98).length;

  // Check if lows are rising
  const firstThird = recentLows.slice(0, 10);
  const lastThird = recentLows.slice(-10);
  const lowsRising = Math.min(...lastThird) > Math.min(...firstThird) * 1.01;

  if (highsNearMax >= 3 && lowsRising && currentPrice < maxHigh) {
    return {
      type: "Ascending Triangle",
      confidence: "HIGH",
      target: maxHigh + (maxHigh - Math.min(...recentLows)),
      invalidation: Math.min(...lastThird),
      description:
        "Bullish continuation pattern - breakout above resistance likely",
      category: "chart",
      formationProgress: 75,
    };
  }

  return null;
}

function findDescendingTriangle(
  highs: number[],
  lows: number[],
  currentPrice: number
): Pattern | null {
  if (lows.length < 30) return null;

  const recentHighs = highs.slice(-30);
  const recentLows = lows.slice(-30);

  // Check if lows are flat (support)
  const minLow = Math.min(...recentLows);
  const lowsNearMin = recentLows.filter((l) => l < minLow * 1.02).length;

  // Check if highs are falling
  const firstThird = recentHighs.slice(0, 10);
  const lastThird = recentHighs.slice(-10);
  const highsFalling = Math.max(...lastThird) < Math.max(...firstThird) * 0.99;

  if (lowsNearMin >= 3 && highsFalling && currentPrice > minLow) {
    return {
      type: "Descending Triangle",
      confidence: "HIGH",
      target: minLow - (Math.max(...recentHighs) - minLow),
      invalidation: Math.max(...lastThird),
      description:
        "Bearish continuation pattern - breakdown below support likely",
      category: "chart",
      formationProgress: 75,
    };
  }

  return null;
}
