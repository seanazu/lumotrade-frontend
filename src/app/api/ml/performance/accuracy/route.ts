/**
 * ML Model Accuracy Proxy
 * Proxies request to backend /api/model-health and transforms to ModelAccuracy format
 */
import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const mlUrl = new URL(`${ML_BACKEND_URL}/api/model-health`);

    const response = await fetch(mlUrl.toString(), {
      headers: { "X-API-Key": ML_API_KEY },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch model health" }, { status: response.status });
    }

    const data = await response.json();
    const health = data.health || {};

    // Client expects:
    // accuracy_30d: number;
    // direction_accuracy: number;
    // magnitude_rmse: number;
    // confidence_calibration: number;
    // total_predictions: number;

    const result = {
        accuracy_30d: health.accuracy || 0,
        direction_accuracy: health.accuracy || 0, // Fallback
        magnitude_rmse: 0, // Not available
        confidence_calibration: health.avg_confidence || 0,
        total_predictions: health.total_predictions || 0
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

