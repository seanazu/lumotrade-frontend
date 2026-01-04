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

    // Validate credentials with Alpaca API
    const baseUrl = isPaper
      ? "https://paper-api.alpaca.markets"
      : "https://api.alpaca.markets";

    const response = await fetch(`${baseUrl}/v2/account`, {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": secretKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Invalid Alpaca credentials" },
        { status: 401 }
      );
    }

    const accountData = await response.json();

    return NextResponse.json({
      valid: true,
      accountNumber: accountData.account_number,
      status: accountData.status,
    });
  } catch (error) {
    console.error("Alpaca validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate Alpaca credentials" },
      { status: 500 }
    );
  }
}

