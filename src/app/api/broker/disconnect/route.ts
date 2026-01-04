import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

/**
 * DELETE /api/broker/disconnect?userId=xxx
 * Disconnect broker (deletes stored credentials)
 */
export async function DELETE(request: NextRequest) {
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
      `${ML_BACKEND_URL}/api/broker/disconnect?user_id=${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: {
          "X-API-Key": ML_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || "Failed to disconnect broker" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Broker disconnect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

