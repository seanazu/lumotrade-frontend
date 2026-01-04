/**
 * ML Current Prediction Proxy
 * Proxies request to backend /api/predictions/latest and transforms to MLPrediction format
 */
import { NextRequest, NextResponse } from "next/server";
import { ML_BACKEND_URL, ML_API_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const mlUrl = new URL(`${ML_BACKEND_URL}/api/predictions/latest`);
    const healthUrl = new URL(`${ML_BACKEND_URL}/api/model-health`);
    const statusUrl = new URL(`${ML_BACKEND_URL}/api/model/status`);

    console.log('[ML Current Proxy] Fetching latest predictions from ML backend');

    const [predictionsRes, healthRes, statusRes] = await Promise.all([
      fetch(mlUrl.toString(), {
        headers: { "X-API-Key": ML_API_KEY },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(healthUrl.toString(), {
        headers: { "X-API-Key": ML_API_KEY },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(statusUrl.toString(), {
        headers: { "X-API-Key": ML_API_KEY },
        signal: AbortSignal.timeout(10000),
      })
    ]);

    if (!predictionsRes.ok) {
        console.error(`ML Backend predictions error: ${predictionsRes.status}`);
        return NextResponse.json({ error: "Failed to fetch predictions" }, { status: predictionsRes.status });
    }

    const predictionsData = await predictionsRes.json();
    const healthData = healthRes.ok ? await healthRes.json() : { health: { accuracy: 0 } };
    const statusData = statusRes.ok ? await statusRes.json() : { version: "1.0.0" };

    // Transform to Client expected format
    const transformedPredictions: Record<string, any> = {};
    
    if (predictionsData.predictions && Array.isArray(predictionsData.predictions)) {
        predictionsData.predictions.forEach((p: any) => {
            if (p.ticker) {
                // Map direction: UP->bullish, DOWN->bearish, HOLD->neutral
                let direction = "neutral";
                if (p.direction === "UP") direction = "bullish";
                else if (p.direction === "DOWN") direction = "bearish";

                // Map confidence from p_up or confidence field
                let confidence = p.confidence || 0.5;

                transformedPredictions[p.ticker] = {
                    direction,
                    confidence,
                    expected_move: p.spread || 0,
                    price_target: p.entry_price || 0 // Use entry price as reference since we don't have explicit target
                };
            }
        });
    }

    const result = {
        timestamp: predictionsData.date || new Date().toISOString(),
        predictions: transformedPredictions,
        model_version: statusData.version || "1.0.0",
        model_accuracy: healthData.health?.accuracy || 0
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });

  } catch (error: any) {
    console.error("Error proxying ML current prediction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

