/**
 * Market Breadth API Route
 * GET /api/market/breadth
 * Returns sector performance and market breadth data
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SectorPerformance {
  sector: string;
  changesPercentage: string;
}

interface SectorData {
  name: string;
  symbol: string;
  change: number;
}

interface BreadthResponse {
  success: boolean;
  sectors: SectorData[];
  summary: {
    upSectors: number;
    downSectors: number;
    averageChange: number;
  };
  timestamp: number;
  error?: string;
}

// Map FMP sector names to our display names and ETF symbols
const SECTOR_MAP: Record<string, { name: string; symbol: string }> = {
  Technology: { name: "Technology", symbol: "XLK" },
  Healthcare: { name: "Healthcare", symbol: "XLV" },
  "Financial Services": { name: "Financials", symbol: "XLF" },
  "Consumer Cyclical": { name: "Consumer Disc.", symbol: "XLY" },
  "Communication Services": { name: "Communication", symbol: "XLC" },
  Industrials: { name: "Industrials", symbol: "XLI" },
  "Consumer Defensive": { name: "Consumer Stap.", symbol: "XLP" },
  Energy: { name: "Energy", symbol: "XLE" },
  Utilities: { name: "Utilities", symbol: "XLU" },
  "Real Estate": { name: "Real Estate", symbol: "XLRE" },
  "Basic Materials": { name: "Materials", symbol: "XLB" },
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FMP_API_KEY;
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "FMP API is not configured",
          timestamp: Date.now(),
        },
        { status: 503 }
      );
    }

    const { data, cache } = await getOrComputeTtlCache({
      key: "market:breadth:v1",
      ttlSeconds: 5 * 60, // 5 minutes
      forceRefresh,
      compute: async () => {
        // Fetch sector performance from FMP
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${apiKey}`,
          { next: { revalidate: 60 } } // upstream cache hint
        );

        if (!response.ok) {
          throw new Error(`FMP API error: ${response.status}`);
        }

        const raw: SectorPerformance[] = await response.json();

        // Transform to our format
        const sectors: SectorData[] = raw
          .filter((s) => SECTOR_MAP[s.sector])
          .map((s) => ({
            name: SECTOR_MAP[s.sector].name,
            symbol: SECTOR_MAP[s.sector].symbol,
            change: parseFloat(s.changesPercentage),
          }));

        const upSectors = sectors.filter((s) => s.change > 0).length;
        const downSectors = sectors.filter((s) => s.change < 0).length;
        const averageChange =
          sectors.reduce((sum, s) => sum + s.change, 0) / sectors.length;

        return {
          sectors,
          summary: {
            upSectors,
            downSectors,
            averageChange,
          },
        } satisfies Omit<BreadthResponse, "success" | "timestamp">;
      },
    });

    const result: BreadthResponse & { cache?: unknown } = {
      success: true,
      sectors: data.sectors,
      summary: data.summary,
      cache,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/market/breadth:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
