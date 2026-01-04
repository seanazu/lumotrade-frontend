import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

/**
 * POST /api/broker/account
 * Get broker account data using server-stored credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const response = await fetch(`${ML_BACKEND_URL}/api/broker/account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ML_API_KEY,
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || "Failed to fetch account" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Broker account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

