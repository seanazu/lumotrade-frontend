import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

/**
 * POST /api/broker/connect
 * Securely connect broker - credentials stored server-side only
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, apiKey, secretKey, isPaper, broker = "alpaca" } = body;

    if (!userId || !apiKey || !secretKey) {
      return NextResponse.json(
        { error: "Missing required fields: userId, apiKey, secretKey" },
        { status: 400 }
      );
    }

    // Forward to ML backend (credentials will be encrypted there)
    const response = await fetch(`${ML_BACKEND_URL}/api/broker/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ML_API_KEY,
      },
      body: JSON.stringify({
        user_id: userId,
        broker_api_key: apiKey,
        broker_secret_key: secretKey,
        is_paper: isPaper ?? true,
        broker,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || "Failed to connect broker" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Broker connect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
