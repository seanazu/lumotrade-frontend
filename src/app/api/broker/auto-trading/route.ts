import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

/**
 * POST /api/broker/auto-trading
 * Enable/disable automated trading on Alpaca
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, enabled } = body;

    if (!userId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Missing userId or enabled flag" },
        { status: 400 }
      );
    }

    const response = await fetch(`${ML_BACKEND_URL}/api/broker/auto-trading`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ML_API_KEY,
      },
      body: JSON.stringify({
        user_id: userId,
        enabled,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || "Failed to toggle auto-trading" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Auto-trading toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/broker/auto-trading?userId=xxx
 * Get auto-trading status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${ML_BACKEND_URL}/api/broker/auto-trading?user_id=${encodeURIComponent(userId)}`,
      {
        headers: {
          "X-API-Key": ML_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || "Failed to get auto-trading status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Auto-trading status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

