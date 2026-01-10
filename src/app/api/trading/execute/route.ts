import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/trading/execute
 * Execute a trade on Alpaca
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, side, qty, type, limit_price, stop_loss, take_profit } = body;

    // Validate input
    if (!symbol || !side || !qty || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the backend to execute the trade
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const apiKey = process.env.ML_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/api/trading/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        symbol,
        side,
        qty,
        type,
        limit_price,
        stop_loss,
        take_profit,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Trade execution failed");
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        order_id: data.order_id,
        symbol: data.symbol,
        qty: data.qty,
        status: data.status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Trade execution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute trade" },
      { status: 500 }
    );
  }
}
