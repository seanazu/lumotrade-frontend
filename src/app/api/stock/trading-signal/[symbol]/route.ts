import { NextRequest, NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { polygonClient } from "@/lib/api/clients/polygon-client";

const CACHE_DURATION = 120; // 2 minutes
const STALE_WHILE_REVALIDATE = 300; // 5 minutes

/**
 * GET /api/stock/trading-signal/[symbol]
 *
 * Generates actionable trading signal with entry/exit levels
 * Based on technical analysis, support/resistance, and risk management
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await context.params;
    const symbol = rawSymbol.toUpperCase();
    console.log(`📊 Generating trading signal for ${symbol}...`);

    // Fetch necessary data
    const [quote, technicals] = await Promise.all([
      fmpClient.getQuote(symbol),
      polygonClient.getTechnicalAnalysis(symbol),
    ]);

    if (!quote || !technicals) {
      return NextResponse.json(
        {
          success: false,
          error: `Unable to generate signal for ${symbol}`,
        },
        { status: 404 }
      );
    }

    // Generate trading signal
    const signal = generateTradingSignal(quote, technicals);

    return NextResponse.json(
      {
        success: true,
        data: signal,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        },
      }
    );
  } catch (error) {
    console.error("Error generating trading signal:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate trading signal",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateTradingSignal(quote: any, technicals: any) {
  const currentPrice = quote.price;
  const rsi = technicals.rsi?.value;
  const macd = technicals.macd;
  const trend = technicals.trend;

  // Determine signal type based on technical indicators
  let signal = "Neutral - Wait for Setup";
  let conviction = "LOW";
  let timeframe = "1-3 days";

  // Bullish signals
  if (
    trend === "bullish" &&
    rsi &&
    rsi > 50 &&
    rsi < 70 &&
    macd?.histogram > 0
  ) {
    signal = "Bullish Momentum Setup";
    conviction = rsi > 60 && macd?.histogram > 1 ? "HIGH" : "MEDIUM";
    timeframe = "2-5 days";
  }
  // Bearish signals
  else if (
    trend === "bearish" &&
    rsi &&
    rsi < 50 &&
    rsi > 30 &&
    macd?.histogram < 0
  ) {
    signal = "Bearish Reversal Setup";
    conviction = rsi < 40 && macd?.histogram < -1 ? "HIGH" : "MEDIUM";
    timeframe = "2-5 days";
  }
  // Oversold bounce
  else if (rsi && rsi < 30) {
    signal = "Oversold Bounce Opportunity";
    conviction = "MEDIUM";
    timeframe = "1-2 days";
  }
  // Overbought pullback
  else if (rsi && rsi > 70) {
    signal = "Overbought - Take Profit Zone";
    conviction = "MEDIUM";
    timeframe = "1-2 days";
  }

  // Calculate entry, target, and stop loss levels
  const atr = currentPrice * 0.02; // Approximate ATR as 2% of price
  const entryZone = {
    min: currentPrice * 0.99, // 1% below current
    max: currentPrice * 1.01, // 1% above current
  };

  const isLong = trend === "bullish" || (rsi && rsi < 30);
  const target = {
    price: isLong ? currentPrice * 1.05 : currentPrice * 0.95, // 5% move
    percentage: 5,
  };

  const stopLoss = {
    price: isLong ? currentPrice * 0.97 : currentPrice * 1.03, // 3% risk
    percentage: 3,
  };

  const riskReward = (
    Math.abs(target.price - currentPrice) /
    Math.abs(stopLoss.price - currentPrice)
  ).toFixed(2);

  // Only recommend trade if conviction is MEDIUM or HIGH and R:R >= 2:1
  const shouldTrade =
    (conviction === "HIGH" || conviction === "MEDIUM") &&
    parseFloat(riskReward) >= 2.0;

  if (!shouldTrade) {
    conviction = "LOW";
  }

  return {
    signal,
    conviction,
    timeframe,
    entryZone,
    target,
    stopLoss,
    riskReward: `1:${riskReward}`,
    shouldTrade,
  };
}
