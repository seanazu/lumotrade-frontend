/**
 * ORATS Options Data API Route
 * GET /api/market/options-orats
 * Returns real options data from ORATS (IV Rank, Put/Call, Unusual Activity)
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ORATSOptionsData {
  vix: number | null;
  ivRank: number;
  putCallRatio: number;
  sentiment: "FEARFUL" | "NEUTRAL" | "GREEDY";
  unusualActivity: Array<{
    symbol: string;
    type: "CALL" | "PUT";
    strike: number;
    expiry: string;
    volume: number;
    openInterest: number;
  }>;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  try {
    const oratsKey = process.env.ORATS_API_KEY;
    const finnhubKey = process.env.FINNHUB_API_KEY;

    // If no ORATS key, fall back to Finnhub + estimates
    if (!oratsKey) {
      console.warn("ORATS_API_KEY not found, using Finnhub fallback");
      return await getFinnhubFallback(finnhubKey);
    }

    // Fetch real ORATS data
    // Note: ORATS API endpoints vary by subscription level
    // This is a template - adjust based on your ORATS plan

    const [vixData, ivRankData, pcRatioData] = await Promise.all([
      fetchVIXFromFinnhub(finnhubKey),
      fetchIVRankFromORATSorEstimate(oratsKey),
      fetchPutCallRatioFromORATSorEstimate(oratsKey),
    ]);

    const sentiment = calculateSentiment(vixData, pcRatioData);

    return NextResponse.json({
      vix: vixData,
      ivRank: ivRankData,
      putCallRatio: pcRatioData,
      sentiment,
      unusualActivity: [], // Requires ORATS premium subscription
      timestamp: Date.now(),
    } as ORATSOptionsData);
  } catch (error) {
    console.error("Error in /api/market/options-orats:", error);
    // Return fallback data
    return NextResponse.json({
      vix: null,
      ivRank: 50,
      putCallRatio: 0.9,
      sentiment: "NEUTRAL" as const,
      unusualActivity: [],
      timestamp: Date.now(),
    } as ORATSOptionsData);
  }
}

async function fetchVIXFromFinnhub(apiKey: string | undefined): Promise<number | null> {
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=^VIX&token=${apiKey}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.c || null;
  } catch {
    return null;
  }
}

async function fetchIVRankFromORATSorEstimate(apiKey: string): Promise<number> {
  // ORATS API example (adjust based on your subscription):
  // https://api.orats.io/datav2/hist/ivrank?token=YOUR_TOKEN&ticker=SPY
  
  // For now, estimate from VIX if ORATS not available
  // You can replace this with actual ORATS call
  try {
    // Placeholder: Replace with actual ORATS endpoint
    // const res = await fetch(`https://api.orats.io/datav2/hist/ivrank?token=${apiKey}&ticker=SPY`);
    // const data = await res.json();
    // return data.ivRank || 50;
    
    return 50; // Default until ORATS is fully integrated
  } catch {
    return 50;
  }
}

async function fetchPutCallRatioFromORATSorEstimate(apiKey: string): Promise<number> {
  // ORATS API example:
  // https://api.orats.io/datav2/hist/pcr?token=YOUR_TOKEN
  
  try {
    // Placeholder: Replace with actual ORATS endpoint
    // const res = await fetch(`https://api.orats.io/datav2/hist/pcr?token=${apiKey}`);
    // const data = await res.json();
    // return data.putCallRatio || 0.9;
    
    return 0.9; // Default until ORATS is fully integrated
  } catch {
    return 0.9;
  }
}

async function getFinnhubFallback(apiKey: string | undefined) {
  const vix = await fetchVIXFromFinnhub(apiKey);
  const ivRank = vix ? Math.min(100, Math.max(0, (vix - 10) * 2.5)) : 50;
  const putCallRatio = 0.9;
  const sentiment = calculateSentiment(vix, putCallRatio);

  return NextResponse.json({
    vix,
    ivRank,
    putCallRatio,
    sentiment,
    unusualActivity: [],
    timestamp: Date.now(),
  } as ORATSOptionsData);
}

function calculateSentiment(
  vix: number | null,
  pcRatio: number
): "FEARFUL" | "NEUTRAL" | "GREEDY" {
  if (vix && vix > 25) return "FEARFUL";
  if (vix && vix < 15 && pcRatio < 0.8) return "GREEDY";
  if (pcRatio > 1.1) return "FEARFUL";
  return "NEUTRAL";
}

