/**
 * Market Movers API Route (Gainers, Losers, Actives)
 * GET /api/market/movers
 * Returns top gainers, losers, and most active stocks
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume?: number;
}

interface MoversResponse {
  success: boolean;
  gainers: MarketMover[];
  losers: MarketMover[];
  actives: MarketMover[];
  timestamp: number;
  error?: string;
}

async function fetchFromFMP(
  endpoint: string,
  apiKey: string
): Promise<MarketMover[]> {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/${endpoint}?apikey=${apiKey}`,
    { next: { revalidate: 60 } } // Cache for 1 minute
  );

  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status}`);
  }

  const data = await response.json();
  return data.slice(0, 10); // Top 10
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FMP_API_KEY;
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "FMP API key is not configured",
          gainers: [],
          losers: [],
          actives: [],
          timestamp: Date.now(),
        } as MoversResponse,
        { status: 503 }
      );
    }

    const { data, cache } = await getOrComputeTtlCache({
      key: "market:movers:v1",
      ttlSeconds: 60, // 1 minute shared cache
      forceRefresh,
      compute: async () => {
        const [gainers, losers, actives] = await Promise.all([
          fetchFromFMP("stock_market/gainers", apiKey),
          fetchFromFMP("stock_market/losers", apiKey),
          fetchFromFMP("stock_market/actives", apiKey),
        ]);

        return { gainers, losers, actives };
      },
    });

    const result: MoversResponse & { cache?: unknown } = {
      success: true,
      gainers: data.gainers,
      losers: data.losers,
      actives: data.actives,
      cache,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/market/movers:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        gainers: [],
        losers: [],
        actives: [],
        timestamp: Date.now(),
      } as MoversResponse,
      { status: 500 }
    );
  }
}
