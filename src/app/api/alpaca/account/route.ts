import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { apiKey, secretKey, isPaper } = await request.json();

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "API Key and Secret Key are required" },
        { status: 400 }
      );
    }

    const baseUrl = isPaper
      ? "https://paper-api.alpaca.markets"
      : "https://api.alpaca.markets";

    // Fetch multiple data sources in parallel
    const [accountResponse, positionsResponse, ordersResponse] = await Promise.all([
      fetch(`${baseUrl}/v2/account`, {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": secretKey,
        },
      }),
      fetch(`${baseUrl}/v2/positions`, {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": secretKey,
        },
      }),
      fetch(`${baseUrl}/v2/orders?status=all&limit=10`, {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": secretKey,
        },
      }),
    ]);

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.error("Alpaca account API error:", accountResponse.status, errorText);
      return NextResponse.json(
        { error: `Alpaca API error: ${accountResponse.status}` },
        { status: accountResponse.status }
      );
    }

    const accountData = await accountResponse.json();
    const positions = positionsResponse.ok ? await positionsResponse.json() : [];
    const orders = ordersResponse.ok ? await ordersResponse.json() : [];

    return NextResponse.json({
      // Account basics
      equity: parseFloat(accountData.equity),
      cash: parseFloat(accountData.cash),
      buyingPower: parseFloat(accountData.buying_power),
      portfolioValue: parseFloat(accountData.portfolio_value),
      
      // Trading stats
      daytradeCount: parseInt(accountData.daytrade_count || "0"),
      pattern_day_trader: accountData.pattern_day_trader || false,
      
      // Account status
      account_number: accountData.account_number,
      status: accountData.status,
      created_at: accountData.created_at,
      
      // Performance
      last_equity: parseFloat(accountData.last_equity || accountData.equity),
      
      // Positions
      positions: positions.slice(0, 10).map((pos: any) => ({
        symbol: pos.symbol,
        qty: parseFloat(pos.qty),
        market_value: parseFloat(pos.market_value),
        cost_basis: parseFloat(pos.cost_basis),
        unrealized_pl: parseFloat(pos.unrealized_pl),
        unrealized_plpc: parseFloat(pos.unrealized_plpc),
        current_price: parseFloat(pos.current_price),
        side: pos.side,
      })),
      
      // Recent orders
      recent_orders: orders.slice(0, 10).map((order: any) => ({
        id: order.id,
        symbol: order.symbol,
        qty: parseFloat(order.qty),
        side: order.side,
        type: order.type,
        status: order.status,
        filled_avg_price: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null,
        submitted_at: order.submitted_at,
        filled_at: order.filled_at,
      })),
    });
  } catch (error) {
    console.error("Alpaca account fetch error:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch account data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
