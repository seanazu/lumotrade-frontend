/**
 * Technical Analysis API Route
 * GET /api/market/technical?symbols=SPY,QQQ
 * Returns technical indicators from Polygon + ML prediction
 */

import { NextRequest, NextResponse } from "next/server";
import { polygonClient, CompleteTechnicalAnalysis } from "@/lib/api/clients/polygon-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ML Backend URL
const ML_BACKEND_URL = process.env.NEXT_PUBLIC_ML_BACKEND_URL || "http://localhost:8000";

interface MLPrediction {
  direction: "UP" | "DOWN";
  confidence: number;
  magnitude: number;
  trade_signal: string;
  signal_strength: string;
  recommendation: string;
}

interface TechnicalAnalysisResponse {
  ticker: string;
  analysis: CompleteTechnicalAnalysis | null;
  prediction?: MLPrediction;
  marketSentiment: "bullish" | "bearish" | "neutral";
  plainEnglishSummary: string;
}

/**
 * Fetch ML prediction from backend
 */
async function fetchMLPrediction(): Promise<MLPrediction | null> {
  try {
    const response = await fetch(`${ML_BACKEND_URL}/predict/today`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn("ML backend not available");
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching ML prediction:", error);
    return null;
  }
}

/**
 * Generate plain English summary combining technical analysis and ML prediction
 */
function generatePlainEnglishSummary(
  analysis: CompleteTechnicalAnalysis | null,
  prediction: MLPrediction | null
): string {
  const parts: string[] = [];

  // Start with ML prediction if available
  if (prediction) {
    const direction = prediction.direction === "UP" ? "upward" : "downward";
    const confidence = Math.round(prediction.confidence * 100);
    parts.push(
      `Our AI model predicts the market will move ${direction} today with ${confidence}% confidence.`
    );
  }

  if (analysis) {
    // Add RSI interpretation
    if (analysis.rsi) {
      const rsi = analysis.rsi.value;
      if (rsi >= 70) {
        parts.push(
          "The RSI indicator shows the market is overbought, which often means prices may pull back soon."
        );
      } else if (rsi <= 30) {
        parts.push(
          "The RSI indicator shows the market is oversold, which often means prices may bounce back."
        );
      } else if (rsi >= 50) {
        parts.push("Momentum is positive with RSI above 50.");
      } else {
        parts.push("Momentum is weakening with RSI below 50.");
      }
    }

    // Add trend context
    if (analysis.trend === "bullish") {
      parts.push(
        "The overall trend is bullish - prices are trading above key moving averages."
      );
    } else if (analysis.trend === "bearish") {
      parts.push(
        "The overall trend is bearish - prices are trading below key moving averages."
      );
    }

    // Add MACD interpretation
    if (analysis.macd) {
      if (analysis.macd.histogram > 0) {
        parts.push("MACD shows positive momentum, supporting the bullish case.");
      } else {
        parts.push("MACD shows negative momentum, suggesting caution.");
      }
    }
  }

  if (parts.length === 0) {
    return "Market data is being analyzed. Check back shortly for insights.";
  }

  return parts.join(" ");
}

/**
 * Determine overall market sentiment
 */
function determineMarketSentiment(
  analysis: CompleteTechnicalAnalysis | null,
  prediction: MLPrediction | null
): "bullish" | "bearish" | "neutral" {
  let bullishScore = 0;
  let bearishScore = 0;

  // Weight ML prediction heavily
  if (prediction) {
    if (prediction.direction === "UP") bullishScore += 2;
    else bearishScore += 2;
  }

  // Add technical analysis
  if (analysis) {
    if (analysis.trend === "bullish") bullishScore += 1;
    else if (analysis.trend === "bearish") bearishScore += 1;

    if (analysis.rsi && analysis.rsi.value > 50) bullishScore += 0.5;
    else if (analysis.rsi) bearishScore += 0.5;

    if (analysis.macd && analysis.macd.histogram > 0) bullishScore += 0.5;
    else if (analysis.macd) bearishScore += 0.5;
  }

  if (bullishScore > bearishScore + 1) return "bullish";
  if (bearishScore > bullishScore + 1) return "bearish";
  return "neutral";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get("symbols") || "SPY";
    const symbols = symbolsParam.split(",").map((s) => s.trim());

    // Check if Polygon is configured
    if (!polygonClient.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Polygon API is not configured. Add POLYGON_API_KEY to .env.local",
          timestamp: Date.now(),
        },
        { status: 503 }
      );
    }

    // Fetch ML prediction (shared across all tickers)
    const mlPrediction = await fetchMLPrediction();

    // Fetch technical analysis for all symbols in parallel
    const analysisPromises = symbols.map(async (ticker): Promise<TechnicalAnalysisResponse> => {
      const analysis = await polygonClient.getTechnicalAnalysis(ticker);

      return {
        ticker,
        analysis,
        prediction: mlPrediction || undefined,
        marketSentiment: determineMarketSentiment(analysis, mlPrediction),
        plainEnglishSummary: generatePlainEnglishSummary(analysis, mlPrediction),
      };
    });

    const results = await Promise.all(analysisPromises);

    // Generate overall market summary
    const primaryAnalysis = results[0];
    const overallSummary = {
      headline: mlPrediction
        ? `Market expected to move ${mlPrediction.direction === "UP" ? "higher" : "lower"} today`
        : "Analyzing market conditions...",
      confidence: mlPrediction ? Math.round(mlPrediction.confidence * 100) : null,
      sentiment: primaryAnalysis?.marketSentiment || "neutral",
      recommendation: mlPrediction?.recommendation || "Awaiting signal",
    };

    return NextResponse.json({
      success: true,
      data: results,
      summary: overallSummary,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error in /api/market/technical:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

