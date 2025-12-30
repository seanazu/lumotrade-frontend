/**
 * ML Trades API Proxy
 * Proxies requests to ML backend to keep API keys secure on server
 */

import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ml/trades
 * Fetch trades from ML backend
 * Query params: days, page, page_size, search, status, direction
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Forward all query params to ML backend
    const mlUrl = new URL(`${ML_BACKEND_URL}/api/trades`);
    searchParams.forEach((value, key) => {
      mlUrl.searchParams.append(key, value);
    });

    const response = await fetch(mlUrl.toString(), {
      headers: {
        "X-API-Key": ML_API_KEY,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`ML Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch trades from ML backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("Error proxying ML trades:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message,
        trades: [],
        stats: {
          total_trades: 0,
          winning_trades: 0,
          losing_trades: 0,
          win_rate: 0,
          total_pnl: 0,
          avg_win: 0,
          avg_loss: 0,
          sharpe_ratio: null,
          max_drawdown: null,
          current_balance: 10000,
          roi: 0,
        },
      },
      { status: 500 }
    );
  }
}

