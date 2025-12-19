import { NextRequest, NextResponse } from "next/server";
import { polygonClient } from "@/lib/api/clients/polygon-client";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

const CACHE_DURATION = 60; // 1 minute
const STALE_WHILE_REVALIDATE = 300; // 5 minutes

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

/**
 * GET /api/stock/chart/[symbol]
 *
 * Fetches historical OHLC data for charting
 * Supports multiple timeframes via query params
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { symbol: rawSymbol } = await context.params;
    const symbol = rawSymbol.toUpperCase();
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get("timeframe") || "1M";
    const interval = searchParams.get("interval") || "1day";

    const forceRefresh = searchParams.get("refresh") === "1";
    const cacheKey = `stock:chart:${symbol}:${timeframe}:${interval}:v2`;

    const { data: chartData } = await getOrComputeTtlCache({
      key: cacheKey,
      ttlSeconds: 5 * 60, // 5 minutes for all daily charts
      forceRefresh,
      compute: async () => {
        console.log(
          `📈 Fetching chart data for ${symbol} (${timeframe}, ${interval})...`
        );

        // Always use Polygon daily aggregates
        const to = new Date();
        const from = new Date();

        // Always fetch at least 2 years of data for proper technical analysis
        // The timeframe parameter controls the visible range on the chart, not what we fetch
        from.setFullYear(from.getFullYear() - 2);

        const fromStr = from.toISOString().split("T")[0];
        const toStr = to.toISOString().split("T")[0];

        console.log(`📅 Date range: ${fromStr} to ${toStr}`);

        // Try Polygon first
        let bars = await polygonClient.getAggregateBars(
          symbol,
          fromStr,
          toStr,
          "day"
        );

        console.log(`📊 Received ${bars.length} bars from Polygon`);

        // Fallback to FMP if Polygon returns no data
        if (!bars || bars.length === 0) {
          console.log(`⚠️ Polygon returned no data, falling back to FMP...`);

          // FMP historical endpoint: /historical-price-full/{symbol}?from={from}&to={to}
          const fmpUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fromStr}&to=${toStr}&apikey=${process.env.FMP_API_KEY}`;

          try {
            const fmpResponse = await fetch(fmpUrl);
            const fmpData = await fmpResponse.json();

            if (fmpData.historical && Array.isArray(fmpData.historical)) {
              console.log(`📊 FMP returned ${fmpData.historical.length} bars`);

              // Transform FMP format to our format
              bars = fmpData.historical.map((bar: any) => ({
                t: new Date(bar.date).getTime(),
                o: bar.open,
                h: bar.high,
                l: bar.low,
                c: bar.close,
                v: bar.volume,
              }));
            }
          } catch (fmpError) {
            console.error(`❌ FMP fallback also failed:`, fmpError);
          }
        }

        if (!bars || bars.length === 0) {
          throw new Error(
            `No chart data available for ${symbol} from ${fromStr} to ${toStr}. Both Polygon and FMP returned no data.`
          );
        }

        const chartData = bars.map((bar) => ({
          time: new Date(bar.t).toISOString().split("T")[0],
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v,
        }));

        // Sort ascending by time for lightweight-charts
        chartData.sort((a, b) => a.time.localeCompare(b.time));
        return chartData;
      },
    });

    if (!chartData || chartData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No chart data available for ${symbol} (${timeframe}). Check your API keys, rate limits, or symbol.`,
          timestamp: Date.now(),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: chartData,
        symbol,
        timeframe,
        interval,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching chart data:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error fetching chart data from upstream provider",
        timestamp: Date.now(),
      },
      { status: 502 }
    );
  }
}
