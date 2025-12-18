/**
 * Options Market Sentiment API Route
 * GET /api/market/options-sentiment
 * Returns VIX, Put/Call Ratio, IV Rank, and overall sentiment
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VIXData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface OptionsMarketSentiment {
  vix: VIXData | null;
  putCallRatio: number;
  sentiment: "FEARFUL" | "NEUTRAL" | "GREEDY";
  ivRank: number;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      // Return default values if no API key
      return NextResponse.json({
        vix: null,
        putCallRatio: 0.9,
        sentiment: "NEUTRAL" as const,
        ivRank: 50,
        timestamp: Date.now(),
      } as OptionsMarketSentiment);
    }

    // Fetch VIX from Finnhub
    const vixResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=^VIX&token=${apiKey}`,
      { next: { revalidate: 60 } }
    );

    let vix: VIXData | null = null;
    if (vixResponse.ok) {
      const vixData = await vixResponse.json();
      vix = {
        symbol: "VIX",
        price: vixData.c || 0,
        change: vixData.d || 0,
        changePercent: vixData.dp || 0,
      };
    }

    // Estimate Put/Call Ratio (could be enhanced with real data)
    const putCallRatio = 0.9; // Default neutral value

    // Calculate IV Rank from VIX (0-100 scale)
    const ivRank = vix ? Math.min(100, Math.max(0, (vix.price - 10) * 2.5)) : 50;

    // Determine sentiment
    let sentiment: "FEARFUL" | "NEUTRAL" | "GREEDY" = "NEUTRAL";
    if (vix && vix.price > 25) {
      sentiment = "FEARFUL";
    } else if (vix && vix.price < 15 && putCallRatio < 0.8) {
      sentiment = "GREEDY";
    } else if (putCallRatio > 1.1) {
      sentiment = "FEARFUL";
    }

    const result: OptionsMarketSentiment = {
      vix,
      putCallRatio,
      sentiment,
      ivRank,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/market/options-sentiment:", error);
    // Return default values on error
    return NextResponse.json({
      vix: null,
      putCallRatio: 0.9,
      sentiment: "NEUTRAL" as const,
      ivRank: 50,
      timestamp: Date.now(),
    } as OptionsMarketSentiment);
  }
}

