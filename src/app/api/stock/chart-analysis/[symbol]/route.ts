import { NextRequest, NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { polygonClient } from "@/lib/api/clients/polygon-client";
import { getEtDateString } from "@/lib/server/time";
import {
  getOrComputeDailyCache,
  getOrComputeTtlCache,
} from "@/lib/server/api-cache";

const CACHE_DURATION = 300; // 5 minutes
const STALE_WHILE_REVALIDATE = 600; // 10 minutes

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

/**
 * Chart Analysis Endpoint
 * Identifies key levels, patterns, and generates a trading plan
 * Like an experienced trader marking up a chart
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const timeframe = request.nextUrl.searchParams.get("timeframe") || "1M";
    const { symbol: rawSymbol } = await context.params;
    const symbol = rawSymbol.toUpperCase();
    const enableAI = request.nextUrl.searchParams.get("analyze") === "1";
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

    const baseKey = `stock:chart-analysis:${symbol}:${timeframe}:base:v1`;
    const dateEt = getEtDateString(new Date());

    const { data: base } = await getOrComputeTtlCache({
      key: baseKey,
      ttlSeconds: 30 * 60, // 30 minutes
      forceRefresh,
      compute: async () => {
        console.log(`📊 Analyzing chart for ${symbol} (${timeframe})...`);

        // Fetch data needed for analysis
        const [quote, technicals, chartData] = await Promise.all([
          fmpClient.getQuote(symbol),
          polygonClient.getTechnicalAnalysis(symbol),
          fetchCandles(symbol, timeframe),
        ]);

        if (!quote || !chartData || chartData.length === 0) {
          throw new Error(
            `Insufficient data for chart analysis (${symbol}, ${timeframe}).`
          );
        }

        const currentPrice = quote.price;

        // Calculate key technical levels
        const keyLevels = calculateKeyLevels(chartData, currentPrice);

        // Identify chart patterns
        const patterns = identifyPatterns(chartData, currentPrice);

        // Calculate Fibonacci retracements
        const fibonacci = calculateFibonacci(chartData);

        // Identify trend lines
        const trendLines = identifyTrendLines(chartData);

        // Determine current market structure
        const marketStructure = analyzeMarketStructure(chartData, currentPrice);

        // Generate trading plan (non-AI baseline)
        const tradingPlan = generateTradingPlan({
          symbol,
          currentPrice,
          keyLevels,
          patterns,
          fibonacci,
          trendLines,
          marketStructure,
          technicals,
        });

        return {
          symbol,
          currentPrice,
          timeframe,
          timestamp: Date.now(),
          _candlesForAI: chartData,
          _aiInputs: {
            keyLevels,
            fibonacci,
            patterns,
            marketStructure,
          },

          // Key levels to draw on chart
          keyLevels: {
            resistance: keyLevels.resistance,
            support: keyLevels.support,
            pivotPoint: keyLevels.pivotPoint,
          },

          // Fibonacci levels
          fibonacci: {
            levels: fibonacci.levels,
            high: fibonacci.high,
            low: fibonacci.low,
          },

          // Trend lines
          trendLines: {
            uptrend: trendLines.uptrend,
            downtrend: trendLines.downtrend,
            channel: trendLines.channel,
          },

          // Identified patterns
          patterns: patterns.map((p) => ({
            type: p.type,
            confidence: p.confidence,
            target: p.target,
            invalidation: p.invalidation,
            description: p.description,
          })),

          // Market structure
          marketStructure: {
            trend: marketStructure.trend,
            phase: marketStructure.phase,
            strength: marketStructure.strength,
            description: marketStructure.description,
          },

          // Trading zones
          tradingZones: {
            buyZone: tradingPlan.buyZone,
            sellZone: tradingPlan.sellZone,
            noTradeZone: tradingPlan.noTradeZone,
          },

          // Complete trading plan
          tradingPlan: {
            setup: tradingPlan.setup,
            entries: tradingPlan.entries,
            targets: tradingPlan.targets,
            stopLoss: tradingPlan.stopLoss,
            riskReward: tradingPlan.riskReward,
            timeframe: tradingPlan.timeframe,
            notes: tradingPlan.notes,
          },
        };
      },
    });

    // Strip internal fields by default
    let analysis: any = { ...base };
    delete analysis._candlesForAI;
    delete analysis._aiInputs;

    // Only run OpenAI when user explicitly asks to analyze
    if (enableAI) {
      const aiKey = `stock:chart-analysis:${symbol}:${timeframe}:ai:v1`;
      const { data: enhancedPlan } = await getOrComputeDailyCache({
        key: aiKey,
        dateEt,
        forceRefresh,
        compute: async () => {
          const enhanced = await generateAIChartPlan({
            symbol,
            timeframe,
            currentPrice: base.currentPrice,
            chartData: base._candlesForAI,
            keyLevels: base._aiInputs.keyLevels,
            fibonacci: base._aiInputs.fibonacci,
            patterns: base._aiInputs.patterns,
            marketStructure: base._aiInputs.marketStructure,
          });

          return enhanced || null;
        },
      });

      if (enhancedPlan) {
        analysis = {
          ...analysis,
          tradingPlan: {
            ...analysis.tradingPlan,
            setup: enhancedPlan.setup ?? analysis.tradingPlan.setup,
            timeframe: enhancedPlan.timeframe ?? analysis.tradingPlan.timeframe,
            entries: enhancedPlan.entries?.length
              ? enhancedPlan.entries
              : analysis.tradingPlan.entries,
            targets: enhancedPlan.targets?.length
              ? enhancedPlan.targets
              : analysis.tradingPlan.targets,
            stopLoss: enhancedPlan.stopLoss ?? analysis.tradingPlan.stopLoss,
            riskReward:
              enhancedPlan.riskReward ?? analysis.tradingPlan.riskReward,
            notes: enhancedPlan.notes?.length
              ? enhancedPlan.notes
              : analysis.tradingPlan.notes,
          },
          aiEnhanced: true,
        };
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: analysis,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        },
      }
    );
  } catch (error) {
    console.error("Error in chart analysis:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch candles for a timeframe. No mock/fallback: return [] if unavailable.
 */
async function fetchCandles(symbol: string, timeframe: string) {
  try {
    const to = new Date();
    const from = new Date();

    // Always fetch 2 years for comprehensive analysis
    // Timeframe only affects what's visible on the chart
    const lookbackDays = 730; // 2 years

    from.setDate(from.getDate() - lookbackDays);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    // Try Polygon first
    let bars = await polygonClient.getAggregateBars(
      symbol,
      fromStr,
      toStr,
      "day"
    );

    // Fallback to FMP if Polygon returns no data
    if (!bars || bars.length === 0) {
      console.log(
        `⚠️ Polygon returned no data for analysis, falling back to FMP...`
      );

      const fmpUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fromStr}&to=${toStr}&apikey=${process.env.FMP_API_KEY}`;

      try {
        const fmpResponse = await fetch(fmpUrl);
        const fmpData = await fmpResponse.json();

        if (fmpData.historical && Array.isArray(fmpData.historical)) {
          bars = fmpData.historical.map((bar: any) => ({
            t: new Date(bar.date).getTime(),
            o: bar.open,
            h: bar.high,
            l: bar.low,
            c: bar.close,
            v: bar.volume,
          }));
        }
      } catch (fmpError) {
        console.error(`❌ FMP fallback failed:`, fmpError);
      }
    }

    return bars.map((bar) => ({
      date: new Date(bar.t),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
}

async function generateAIChartPlan(input: {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  chartData: Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  keyLevels: { resistance: number[]; support: number[]; pivotPoint: number };
  fibonacci: any;
  patterns: any[];
  marketStructure: any;
}): Promise<{
  setup?: string;
  timeframe?: "SWING" | "DAY" | "POSITION";
  entries?: Array<{ type: "LONG" | "SHORT"; price: number; rationale: string }>;
  targets?: Array<{ level: number; rationale: string }>;
  stopLoss?: { level: number; rationale: string };
  riskReward?: string;
  notes?: string[];
} | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey });

  const candles = input.chartData.slice(-80).map((c) => ({
    t: c.date.toISOString(),
    o: c.open,
    h: c.high,
    l: c.low,
    c: c.close,
    v: c.volume,
  }));

  const prompt = {
    symbol: input.symbol,
    timeframe: input.timeframe,
    currentPrice: input.currentPrice,
    keyLevels: input.keyLevels,
    fibonacci: input.fibonacci?.levels,
    patternsDetected: input.patterns?.slice(0, 5) ?? [],
    marketStructure: input.marketStructure,
    candles,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an elite discretionary trader. Given OHLCV candles plus computed support/resistance/fibonacci and rough pattern candidates, produce a precise chart-based trading plan. Be concrete: entries, targets, stop, invalidation, and short notes. Do not invent prices outside a reasonable range. Output strict JSON only.",
      },
      {
        role: "user",
        content: `Analyze this chart and return JSON with keys: setup (string), timeframe (\"DAY\"|\"SWING\"|\"POSITION\"), entries (array of {type:\"LONG\"|\"SHORT\", price:number, rationale:string}), targets (array of {level:number, rationale:string}), stopLoss ({level:number, rationale:string}), riskReward (string like \"1:2.30\"), notes (string[]). Data:\n\n${JSON.stringify(
          prompt
        )}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) return null;
  const parsed = JSON.parse(text);

  return {
    setup: parsed.setup,
    timeframe: parsed.timeframe,
    entries: Array.isArray(parsed.entries) ? parsed.entries : undefined,
    targets: Array.isArray(parsed.targets) ? parsed.targets : undefined,
    stopLoss: parsed.stopLoss,
    riskReward: parsed.riskReward,
    notes: Array.isArray(parsed.notes) ? parsed.notes : undefined,
  };
}

/**
 * Calculate key support and resistance levels
 */
function calculateKeyLevels(data: any[], currentPrice: number) {
  if (data.length === 0) {
    return { resistance: [], support: [], pivotPoint: currentPrice };
  }

  // Get recent high and low
  const recentData = data.slice(-20); // Last 20 days
  const allData = data.slice(-60); // Last 60 days

  const recentHigh = Math.max(...recentData.map((d) => d.high));
  const recentLow = Math.min(...recentData.map((d) => d.low));
  const allTimeHigh = Math.max(...allData.map((d) => d.high));
  const allTimeLow = Math.min(...allData.map((d) => d.low));

  // Calculate pivot point (PP = (H + L + C) / 3)
  const lastBar = data[data.length - 1];
  const pivotPoint = (lastBar.high + lastBar.low + lastBar.close) / 3;

  // Find resistance levels (swing highs)
  const resistance: number[] = [];
  for (let i = 2; i < allData.length - 2; i++) {
    const bar = allData[i];
    const isSwingHigh =
      bar.high > allData[i - 1].high &&
      bar.high > allData[i - 2].high &&
      bar.high > allData[i + 1].high &&
      bar.high > allData[i + 2].high;

    if (isSwingHigh && bar.high > currentPrice) {
      resistance.push(bar.high);
    }
  }

  // Find support levels (swing lows)
  const support: number[] = [];
  for (let i = 2; i < allData.length - 2; i++) {
    const bar = allData[i];
    const isSwingLow =
      bar.low < allData[i - 1].low &&
      bar.low < allData[i - 2].low &&
      bar.low < allData[i + 1].low &&
      bar.low < allData[i + 2].low;

    if (isSwingLow && bar.low < currentPrice) {
      support.push(bar.low);
    }
  }

  // Add major levels
  resistance.push(recentHigh);
  if (allTimeHigh > recentHigh) resistance.push(allTimeHigh);
  support.push(recentLow);
  if (allTimeLow < recentLow) support.push(allTimeLow);

  // Remove duplicates and sort
  const uniqueResistance = [...new Set(resistance)]
    .filter((r) => r > currentPrice)
    .sort((a, b) => a - b)
    .slice(0, 3); // Top 3 resistance levels

  const uniqueSupport = [...new Set(support)]
    .filter((s) => s < currentPrice)
    .sort((a, b) => b - a)
    .slice(0, 3); // Top 3 support levels

  return {
    resistance: uniqueResistance,
    support: uniqueSupport,
    pivotPoint,
  };
}

/**
 * Identify chart patterns
 */
function identifyPatterns(data: any[], currentPrice: number) {
  const patterns: any[] = [];

  if (data.length < 20) return patterns;

  // Check for ascending triangle
  const ascendingTriangle = checkAscendingTriangle(data, currentPrice);
  if (ascendingTriangle) patterns.push(ascendingTriangle);

  // Check for descending triangle
  const descendingTriangle = checkDescendingTriangle(data, currentPrice);
  if (descendingTriangle) patterns.push(descendingTriangle);

  // Check for bull flag
  const bullFlag = checkBullFlag(data, currentPrice);
  if (bullFlag) patterns.push(bullFlag);

  // Check for bear flag
  const bearFlag = checkBearFlag(data, currentPrice);
  if (bearFlag) patterns.push(bearFlag);

  // Check for double bottom
  const doubleBottom = checkDoubleBottom(data, currentPrice);
  if (doubleBottom) patterns.push(doubleBottom);

  // Check for double top
  const doubleTop = checkDoubleTop(data, currentPrice);
  if (doubleTop) patterns.push(doubleTop);

  return patterns;
}

function checkAscendingTriangle(data: any[], currentPrice: number) {
  const recent = data.slice(-20);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);

  // Flat top (resistance)
  const resistanceLevel = Math.max(...highs);
  const resistanceTouches = highs.filter(
    (h) => Math.abs(h - resistanceLevel) / resistanceLevel < 0.02
  ).length;

  // Rising lows (support trend)
  const firstLow = lows[0];
  const lastLow = lows[lows.length - 1];
  const risingLows = lastLow > firstLow;

  if (resistanceTouches >= 2 && risingLows) {
    return {
      type: "Ascending Triangle",
      confidence: "HIGH",
      target: resistanceLevel + (resistanceLevel - firstLow),
      invalidation: lastLow * 0.97,
      description:
        "Bullish continuation pattern. Breakout above resistance likely leads to strong upside move.",
    };
  }

  return null;
}

function checkDescendingTriangle(data: any[], currentPrice: number) {
  const recent = data.slice(-20);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);

  // Flat bottom (support)
  const supportLevel = Math.min(...lows);
  const supportTouches = lows.filter(
    (l) => Math.abs(l - supportLevel) / supportLevel < 0.02
  ).length;

  // Falling highs (resistance trend)
  const firstHigh = highs[0];
  const lastHigh = highs[highs.length - 1];
  const fallingHighs = lastHigh < firstHigh;

  if (supportTouches >= 2 && fallingHighs) {
    return {
      type: "Descending Triangle",
      confidence: "HIGH",
      target: supportLevel - (firstHigh - supportLevel),
      invalidation: lastHigh * 1.03,
      description:
        "Bearish continuation pattern. Breakdown below support likely leads to further downside.",
    };
  }

  return null;
}

function checkBullFlag(data: any[], currentPrice: number) {
  const recent = data.slice(-30);

  // Need strong uptrend (pole)
  const poleStart = recent[0].close;
  const poleEnd = Math.max(...recent.slice(0, 15).map((d) => d.high));
  const poleGain = (poleEnd - poleStart) / poleStart;

  // Followed by consolidation (flag)
  const flagData = recent.slice(15);
  const flagHigh = Math.max(...flagData.map((d) => d.high));
  const flagLow = Math.min(...flagData.map((d) => d.low));
  const flagRange = (flagHigh - flagLow) / flagHigh;

  if (poleGain > 0.1 && flagRange < 0.05) {
    // Strong pole, tight flag
    return {
      type: "Bull Flag",
      confidence: "MEDIUM",
      target: currentPrice + (poleEnd - poleStart),
      invalidation: flagLow * 0.98,
      description:
        "Bullish continuation pattern. Breakout likely continues the prior uptrend.",
    };
  }

  return null;
}

function checkBearFlag(data: any[], currentPrice: number) {
  const recent = data.slice(-30);

  // Need strong downtrend (pole)
  const poleStart = recent[0].close;
  const poleEnd = Math.min(...recent.slice(0, 15).map((d) => d.low));
  const poleDrop = (poleStart - poleEnd) / poleStart;

  // Followed by consolidation (flag)
  const flagData = recent.slice(15);
  const flagHigh = Math.max(...flagData.map((d) => d.high));
  const flagLow = Math.min(...flagData.map((d) => d.low));
  const flagRange = (flagHigh - flagLow) / flagHigh;

  if (poleDrop > 0.1 && flagRange < 0.05) {
    return {
      type: "Bear Flag",
      confidence: "MEDIUM",
      target: currentPrice - (poleStart - poleEnd),
      invalidation: flagHigh * 1.02,
      description:
        "Bearish continuation pattern. Breakdown likely continues the prior downtrend.",
    };
  }

  return null;
}

function checkDoubleBottom(data: any[], currentPrice: number) {
  const recent = data.slice(-40);
  const lows = recent.map((d, i) => ({ value: d.low, index: i }));

  // Find two significant lows
  const sortedLows = [...lows].sort((a, b) => a.value - b.value);
  const low1 = sortedLows[0];
  const low2 = sortedLows.find(
    (l) =>
      Math.abs(l.index - low1.index) > 10 &&
      Math.abs(l.value - low1.value) / low1.value < 0.03
  );

  if (low2) {
    const neckline = Math.max(
      ...recent.slice(low1.index, low2.index).map((d) => d.high)
    );
    if (currentPrice < neckline * 1.05) {
      return {
        type: "Double Bottom",
        confidence: "HIGH",
        target: neckline + (neckline - low1.value),
        invalidation: low1.value * 0.97,
        description:
          "Bullish reversal pattern. Breakout above neckline signals trend reversal.",
      };
    }
  }

  return null;
}

function checkDoubleTop(data: any[], currentPrice: number) {
  const recent = data.slice(-40);
  const highs = recent.map((d, i) => ({ value: d.high, index: i }));

  // Find two significant highs
  const sortedHighs = [...highs].sort((a, b) => b.value - a.value);
  const high1 = sortedHighs[0];
  const high2 = sortedHighs.find(
    (h) =>
      Math.abs(h.index - high1.index) > 10 &&
      Math.abs(h.value - high1.value) / high1.value < 0.03
  );

  if (high2) {
    const neckline = Math.min(
      ...recent.slice(high1.index, high2.index).map((d) => d.low)
    );
    if (currentPrice > neckline * 0.95) {
      return {
        type: "Double Top",
        confidence: "HIGH",
        target: neckline - (high1.value - neckline),
        invalidation: high1.value * 1.03,
        description:
          "Bearish reversal pattern. Breakdown below neckline signals trend reversal.",
      };
    }
  }

  return null;
}

/**
 * Calculate Fibonacci retracement levels
 */
function calculateFibonacci(data: any[]) {
  const recent = data.slice(-60); // Last 60 days

  const high = Math.max(...recent.map((d) => d.high));
  const low = Math.min(...recent.map((d) => d.low));
  const range = high - low;

  return {
    high,
    low,
    levels: {
      "0%": high,
      "23.6%": high - range * 0.236,
      "38.2%": high - range * 0.382,
      "50%": high - range * 0.5,
      "61.8%": high - range * 0.618,
      "78.6%": high - range * 0.786,
      "100%": low,
    },
  };
}

/**
 * Identify trend lines
 */
function identifyTrendLines(data: any[]) {
  const recent = data.slice(-40);

  // Simple linear regression for trend
  const closes = recent.map((d) => d.close);
  const n = closes.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = closes.reduce((a, b) => a + b, 0);
  const xySum = closes.reduce((sum, y, x) => sum + x * y, 0);
  const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  const trendStart = intercept;
  const trendEnd = slope * (n - 1) + intercept;

  const uptrend =
    slope > 0 ? { start: trendStart, end: trendEnd, slope } : null;
  const downtrend =
    slope < 0 ? { start: trendStart, end: trendEnd, slope } : null;

  // Identify channel (parallel lines)
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);
  const avgHigh = highs.reduce((a, b) => a + b, 0) / n;
  const avgLow = lows.reduce((a, b) => a + b, 0) / n;
  const channelWidth = avgHigh - avgLow;

  return {
    uptrend,
    downtrend,
    channel: {
      upper: trendEnd + channelWidth / 2,
      lower: trendEnd - channelWidth / 2,
      width: channelWidth,
    },
  };
}

/**
 * Analyze market structure
 */
function analyzeMarketStructure(data: any[], currentPrice: number) {
  const recent = data.slice(-20);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);

  // Identify higher highs and higher lows (uptrend)
  let higherHighs = 0;
  let higherLows = 0;
  for (let i = 1; i < recent.length; i++) {
    if (highs[i] > highs[i - 1]) higherHighs++;
    if (lows[i] > lows[i - 1]) higherLows++;
  }

  // Identify lower lows and lower highs (downtrend)
  let lowerLows = 0;
  let lowerHighs = 0;
  for (let i = 1; i < recent.length; i++) {
    if (lows[i] < lows[i - 1]) lowerLows++;
    if (highs[i] < highs[i - 1]) lowerHighs++;
  }

  const uptrendStrength = (higherHighs + higherLows) / (recent.length * 2);
  const downtrendStrength = (lowerLows + lowerHighs) / (recent.length * 2);

  let trend: "UPTREND" | "DOWNTREND" | "SIDEWAYS";
  let phase: "ACCUMULATION" | "MARKUP" | "DISTRIBUTION" | "MARKDOWN";
  let strength: "STRONG" | "MODERATE" | "WEAK";

  if (uptrendStrength > 0.6) {
    trend = "UPTREND";
    phase = "MARKUP";
    strength = uptrendStrength > 0.75 ? "STRONG" : "MODERATE";
  } else if (downtrendStrength > 0.6) {
    trend = "DOWNTREND";
    phase = "MARKDOWN";
    strength = downtrendStrength > 0.75 ? "STRONG" : "MODERATE";
  } else {
    trend = "SIDEWAYS";
    phase =
      uptrendStrength > downtrendStrength ? "ACCUMULATION" : "DISTRIBUTION";
    strength = "WEAK";
  }

  return {
    trend,
    phase,
    strength,
    description: `${trend} market in ${phase} phase with ${strength} momentum`,
  };
}

/**
 * Generate comprehensive trading plan
 */
function generateTradingPlan(params: {
  symbol: string;
  currentPrice: number;
  keyLevels: any;
  patterns: any[];
  fibonacci: any;
  trendLines: any;
  marketStructure: any;
  technicals: any;
}) {
  const {
    currentPrice,
    keyLevels,
    patterns,
    fibonacci,
    marketStructure,
    technicals,
  } = params;

  const isUptrend = marketStructure.trend === "UPTREND";
  const primaryPattern = patterns.length > 0 ? patterns[0] : null;

  // Determine trading zones
  const nearestSupport = keyLevels.support[0] || currentPrice * 0.95;
  const nearestResistance = keyLevels.resistance[0] || currentPrice * 1.05;

  const buyZone = {
    low: nearestSupport * 0.99,
    high: nearestSupport * 1.01,
    description: isUptrend
      ? "Buy on pullback to support"
      : "Wait for reversal confirmation",
  };

  const sellZone = {
    low: nearestResistance * 0.99,
    high: nearestResistance * 1.01,
    description: isUptrend
      ? "Take profits near resistance"
      : "Short near resistance",
  };

  const noTradeZone = {
    low: nearestSupport * 1.02,
    high: nearestResistance * 0.98,
    description: "Avoid trading in the middle of the range",
  };

  // Generate entries
  const entries = [];
  if (isUptrend) {
    entries.push({
      type: "LONG",
      price: buyZone.high,
      rationale: "Enter on pullback to support with confirmation",
    });
    if (primaryPattern) {
      entries.push({
        type: "LONG",
        price: currentPrice,
        rationale: `${primaryPattern.type} breakout`,
      });
    }
  } else {
    entries.push({
      type: "SHORT",
      price: sellZone.low,
      rationale: "Enter on bounce to resistance with rejection",
    });
  }

  // Generate targets
  const targets = isUptrend
    ? [
        { level: nearestResistance, rationale: "First resistance" },
        {
          level: primaryPattern?.target || nearestResistance * 1.05,
          rationale: "Pattern target",
        },
      ]
    : [
        { level: nearestSupport, rationale: "First support" },
        {
          level: primaryPattern?.target || nearestSupport * 0.95,
          rationale: "Pattern target",
        },
      ];

  // Generate stop loss
  const stopLoss = isUptrend
    ? {
        level: nearestSupport * 0.98,
        rationale: "Below key support",
      }
    : {
        level: nearestResistance * 1.02,
        rationale: "Above key resistance",
      };

  // Calculate risk:reward
  const avgEntry =
    entries.reduce((sum, e) => sum + e.price, 0) / entries.length;
  const avgTarget =
    targets.reduce((sum, t) => sum + t.level, 0) / targets.length;
  const reward = Math.abs(avgTarget - avgEntry);
  const risk = Math.abs(avgEntry - stopLoss.level);
  const riskReward = risk > 0 ? (reward / risk).toFixed(2) : "N/A";

  return {
    setup: primaryPattern?.type || `${marketStructure.trend} continuation`,
    entries,
    targets,
    stopLoss,
    riskReward: `1:${riskReward}`,
    timeframe: "SWING" as const,
    buyZone,
    sellZone,
    noTradeZone,
    notes: [
      `Market is in ${marketStructure.trend} with ${marketStructure.strength} momentum`,
      primaryPattern
        ? `${primaryPattern.type} pattern identified with ${primaryPattern.confidence} confidence`
        : "No clear pattern - trade support/resistance",
      `Key support at $${nearestSupport.toFixed(2)}, resistance at $${nearestResistance.toFixed(2)}`,
      technicals?.rsi
        ? `RSI at ${technicals.rsi.value.toFixed(1)} - ${technicals.rsi.interpretation}`
        : "",
      `Risk:Reward ratio of ${riskReward} - ${parseFloat(riskReward) >= 2 ? "Favorable" : "Needs improvement"}`,
    ].filter(Boolean),
  };
}
