/**
 * AI Strategy Generator
 * Uses GPT-4 to generate multiple distinct trading strategies
 */

import OpenAI from "openai";
import type { TradingStrategy, StrategyType } from "../../types/strategies";
import type { FactorScores } from "./multi-factor-scoring";
import type { MarketRegimeData } from "../analysis/market-regime";
import { adjustForRegime } from "../analysis/market-regime";

export interface StrategyGenerationInput {
  symbol: string;
  currentPrice: number;

  // Analysis layers
  factorScores: FactorScores;
  marketRegime: MarketRegimeData;

  // Technical data
  keyLevels: {
    support: number[];
    resistance: number[];
    pivotPoint: number;
  };

  technicals: {
    trend: string;
    rsi: number;
    macd: any;
    sma20: number;
    sma50: number;
    sma200: number;
  };

  // Fundamental data
  fundamentals: {
    companyName: string;
    sector: string;
    marketCap?: number;
    peRatio?: number;
    revenueGrowth?: number;
    profitMargin?: number;
  };

  // Sentiment
  sentiment: {
    score: number;
    interpretation: string;
    momentum: string;
  };

  // Patterns
  patterns: Array<{
    type: string;
    confidence: string;
    target: number;
    invalidation: number;
    description: string;
  }>;

  // News/Catalysts
  upcomingCatalysts?: Array<{
    date: string;
    event: string;
    importance: string;
  }>;
}

/**
 * Generate 5 distinct trading strategies using AI
 */
export async function generateMultipleStrategies(
  input: StrategyGenerationInput
): Promise<TradingStrategy[]> {
  const prompt = buildStrategyPrompt(input);

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured - using fallback strategies");
      return generateFallbackStrategies(input);
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert institutional trader and quantitative analyst. You generate multiple distinct trading strategies based on comprehensive market analysis. Each strategy must be unique, evidence-based, and actionable.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the raw JSON object.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    const strategies = parsed.strategies || [];

    // Post-process and validate
    const processedStrategies = strategies.map((s: any, idx: number) => {
      const strategy = normalizeStrategy(s, input.currentPrice, idx);
      // Adjust for market regime
      return adjustForRegime(strategy, input.marketRegime);
    });

    return processedStrategies;
  } catch (error) {
    console.error("Error generating AI strategies:", error);

    // Fallback: generate basic strategies without AI
    return generateFallbackStrategies(input);
  }
}

/**
 * Build comprehensive prompt for strategy generation
 */
function buildStrategyPrompt(input: StrategyGenerationInput): string {
  return `You are a professional hedge fund analyst generating 5 DISTINCT, HIGH-PROBABILITY trading strategies for ${input.symbol} (${input.fundamentals.companyName}). Current price: $${input.currentPrice.toFixed(2)}.

Your strategies should be:
✓ Evidence-based using the comprehensive data provided below
✓ Focused on actual profit opportunities, not speculation
✓ Grounded in real market conditions and company fundamentals
✓ Designed to make money for professional traders
✓ Clear about risk vs reward trade-offs

Think like a professional investor: What makes THIS stock attractive RIGHT NOW? What are the real catalysts? What's the genuine value proposition?

# COMPREHENSIVE ANALYSIS DATA

## Market Context
- Market Regime: ${input.marketRegime.regime} (confidence: ${input.marketRegime.confidence}%)
- Volatility: ${input.marketRegime.volatilityLevel}
- Trend Strength: ${input.marketRegime.trendStrength}
- Suggestions: ${input.marketRegime.strategySuggestions.join(", ")}

## Company Fundamentals
- Sector: ${input.fundamentals.sector}
- Market Cap: $${input.fundamentals.marketCap?.toLocaleString() || "N/A"}
- P/E Ratio: ${input.fundamentals.peRatio?.toFixed(2) || "N/A"}
- Revenue Growth: ${input.fundamentals.revenueGrowth?.toFixed(1) || "N/A"}%
- Profit Margin: ${input.fundamentals.profitMargin?.toFixed(1) || "N/A"}%
- Fundamental Score: ${input.factorScores.fundamental.score}/100

## Technical Analysis
- Trend: ${input.technicals.trend}
- RSI: ${input.technicals.rsi.toFixed(1)}
- MACD: ${input.technicals.macd.histogram > 0 ? "Bullish" : "Bearish"}
- Price vs SMA20: ${((input.currentPrice / input.technicals.sma20 - 1) * 100).toFixed(1)}%
- Price vs SMA50: ${((input.currentPrice / input.technicals.sma50 - 1) * 100).toFixed(1)}%
- Price vs SMA200: ${((input.currentPrice / input.technicals.sma200 - 1) * 100).toFixed(1)}%
- Technical Score: ${input.factorScores.technical.score}/100

## Key Levels
- Support: ${input.keyLevels.support.map((s) => `$${s.toFixed(2)}`).join(", ")}
- Resistance: ${input.keyLevels.resistance.map((r) => `$${r.toFixed(2)}`).join(", ")}
- Pivot Point: $${input.keyLevels.pivotPoint.toFixed(2)}

## Sentiment Analysis
- Sentiment Score: ${input.sentiment.score}/100
- Interpretation: ${input.sentiment.interpretation}
- Momentum: ${input.sentiment.momentum}

## Detected Patterns
${input.patterns.map((p) => `- ${p.type} (${p.confidence}): ${p.description} | Target: $${p.target.toFixed(2)} | Stop: $${p.invalidation.toFixed(2)}`).join("\n")}

## Upcoming Catalysts
${input.upcomingCatalysts?.map((c) => `- ${c.date}: ${c.event} (${c.importance})`).join("\n") || "None identified"}

## Overall Assessment
- Composite Score: ${input.factorScores.composite}/100
- Rating: ${input.factorScores.rating.toUpperCase()}

# INVESTMENT QUALITY SIGNALS

Focus your analysis on these REAL VALUE INDICATORS:

**Value Signals:**
- Is the stock undervalued vs peers? (P/E, P/B, P/S ratios)
- Strong earnings growth with reasonable valuation? (PEG ratio)
- Improving profit margins and operational efficiency?
- Solid balance sheet with low debt?

**Growth Signals:**
- Accelerating revenue and earnings growth?
- Expanding market share or TAM (Total Addressable Market)?
- New products/services driving future growth?
- Positive guidance and analyst upgrades?

**Momentum Signals:**
- Technical breakout from consolidation?
- Increasing institutional ownership?
- Strong volume confirming price moves?
- Trend alignment across timeframes?

**Risk Assessment:**
- What could go wrong? (competition, regulation, macro)
- How exposed is the stock to market conditions?
- What's the downside protection? (support levels, valuation floor)
- Event risks? (earnings, FDA, economic data)

# YOUR TASK

Generate 5 DISTINCT trading strategies with these characteristics:

1. **Conservative**: High probability, tight stops, 1-2 week timeframe, lower R:R (2-3:1)
2. **Moderate**: Balanced approach, 2-4 week timeframe, medium R:R (3-4:1)
3. **Aggressive**: Higher risk/reward, 1-2 month timeframe, high R:R (5-8:1)
4. **Swing**: Pattern-based, 3-10 day holds, medium R:R (3-5:1)
5. **Position**: Fundamental-driven, 3-6 month timeframe, variable R:R based on thesis

Each strategy MUST be meaningfully different in:
- Entry criteria and price levels
- Target objectives
- Timeframe
- Risk management approach
- Underlying thesis

Return JSON in this EXACT format:
{
  "strategies": [
    {
      "name": "Strategy Name",
      "type": "conservative|moderate|aggressive|swing|position",
      "confidence": 0-100,
      "timeframe": "1-2 weeks",
      "thesis": {
        "bullCase": "Why this will work...",
        "bearCase": "What could go wrong...",
        "catalysts": ["catalyst 1", "catalyst 2"],
        "risks": ["risk 1", "risk 2"]
      },
      "entries": [
        {
          "price": 180.50,
          "condition": "On pullback to support",
          "rationale": "Why enter here..."
        }
      ],
      "targets": [
        {
          "price": 186.50,
          "percentage": 3.32,
          "probability": 65,
          "rationale": "First resistance level"
        },
        {
          "price": 190.00,
          "percentage": 5.26,
          "probability": 45,
          "rationale": "Major resistance"
        }
      ],
      "stopLoss": {
        "initial": {
          "price": 178.00,
          "percentage": -1.38
        },
        "trailing": {
          "type": "ATR-based",
          "percentage": 2.0
        },
        "rationale": "Below key support"
      },
      "sizing": {
        "recommendedPosition": 5,
        "maxPosition": 8,
        "scaling": "in"
      },
      "riskReward": "3.2:1",
      "technicalBasis": {
        "supportingIndicators": ["RSI oversold", "MACD bullish cross"],
        "patterns": ["Hammer", "Ascending Triangle"],
        "keyLevels": [179.50, 183.00]
      },
      "fundamentalBasis": {
        "strengthMetrics": ["Strong revenue growth", "High margins"],
        "concernMetrics": ["Elevated P/E"],
        "valuation": "fair"
      },
      "sentimentBasis": {
        "score": 65,
        "interpretation": "Moderately positive",
        "momentum": "positive"
      },
      "updates": [
        {
          "condition": "If price breaks above $185",
          "action": "Move stop to breakeven"
        }
      ]
    }
  ]
}`;
}

/**
 * Normalize strategy from AI response
 */
function normalizeStrategy(
  raw: any,
  currentPrice: number,
  index: number
): TradingStrategy {
  return {
    id: `strategy-${index}`,
    name: raw.name || `Strategy ${index + 1}`,
    type: raw.type || "moderate",
    confidence: raw.confidence || 50,
    timeframe: raw.timeframe || "1-4 weeks",
    thesis: raw.thesis || {
      bullCase: "",
      bearCase: "",
      catalysts: [],
      risks: [],
    },
    entries: raw.entries || [
      {
        price: currentPrice * 0.99,
        condition: "Market order",
        rationale: "Entry at current price",
      },
    ],
    targets: raw.targets || [
      {
        price: currentPrice * 1.05,
        percentage: 5,
        probability: 50,
        rationale: "Target 1",
      },
    ],
    stopLoss: raw.stopLoss || {
      initial: {
        price: currentPrice * 0.97,
        percentage: -3,
      },
      trailing: {
        type: "Percentage",
        percentage: 2,
      },
      rationale: "Stop below support",
    },
    sizing: raw.sizing || {
      recommendedPosition: 5,
      maxPosition: 10,
      scaling: "in",
    },
    riskReward: raw.riskReward || "2:1",
    technicalBasis: raw.technicalBasis || {
      supportingIndicators: [],
      patterns: [],
      keyLevels: [],
    },
    fundamentalBasis: raw.fundamentalBasis || {
      strengthMetrics: [],
      concernMetrics: [],
      valuation: "fair",
    },
    sentimentBasis: raw.sentimentBasis || {
      score: 50,
      interpretation: "Neutral",
      momentum: "neutral",
    },
    updates: raw.updates || [],
  };
}

/**
 * Generate fallback strategies if AI fails
 */
function generateFallbackStrategies(
  input: StrategyGenerationInput
): TradingStrategy[] {
  const { currentPrice, keyLevels, factorScores } = input;

  const support = keyLevels.support[0] || currentPrice * 0.97;
  const resistance = keyLevels.resistance[0] || currentPrice * 1.03;

  const strategies: TradingStrategy[] = [
    // Conservative
    {
      id: "fallback-1",
      name: "Support Bounce",
      type: "conservative",
      confidence: 60,
      timeframe: "1-2 weeks",
      thesis: {
        bullCase: "Price holding at key support with technical bounce expected",
        bearCase: "Support break would invalidate thesis",
        catalysts: [],
        risks: ["Support breakdown"],
      },
      entries: [
        {
          price: support * 1.002,
          condition: "Near support",
          rationale: "Entry at tested support level",
        },
      ],
      targets: [
        {
          price: resistance,
          percentage: (resistance / support - 1) * 100,
          probability: 60,
          rationale: "First resistance",
        },
      ],
      stopLoss: {
        initial: {
          price: support * 0.98,
          percentage: -2,
        },
        trailing: {
          type: "Fixed",
          percentage: 2,
        },
        rationale: "Below support",
      },
      sizing: {
        recommendedPosition: 5,
        maxPosition: 8,
        scaling: "in",
      },
      riskReward: "2.5:1",
      technicalBasis: {
        supportingIndicators: ["Support level"],
        patterns: [],
        keyLevels: [support],
      },
      fundamentalBasis: {
        strengthMetrics: [],
        concernMetrics: [],
        valuation: "fair",
      },
      sentimentBasis: {
        score: factorScores.sentiment.score,
        interpretation: factorScores.sentiment.interpretation,
        momentum: "neutral",
      },
      updates: [],
    },
  ];

  return strategies;
}
