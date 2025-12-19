import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface IntradayPoint {
  timestamp: string;
  price: number;
  session: "pre" | "regular" | "after";
}

interface IntradaySeries {
  symbol: string;
  sessionStart: string;
  regularStart: string;
  regularEnd: string;
  sessionEnd: string;
  points: IntradayPoint[];
}

// Market hours in ET
const EXTENDED_START = "04:00";
const REGULAR_START = "09:30";
const REGULAR_END = "16:00";
const EXTENDED_END = "20:00";

function getSession(time: string): "pre" | "regular" | "after" {
  const [hour, minute] = time.split(":").map(Number);
  const minutes = hour * 60 + minute;
  const regularStartMin = 9 * 60 + 30;
  const regularEndMin = 16 * 60;

  if (minutes < regularStartMin) return "pre";
  if (minutes > regularEndMin) return "after";
  return "regular";
}

function getTodayET(): { date: string; time: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

/**
 * Validate data point
 */
function isValidDataPoint(item: any): boolean {
  if (!item) return false;
  if (!item.date || typeof item.date !== "string") return false;
  if (item.close === null || item.close === undefined) return false;
  if (isNaN(parseFloat(item.close))) return false;
  if (parseFloat(item.close) <= 0) return false;
  return true;
}

/**
 * Remove duplicate timestamps
 */
function deduplicateByTimestamp(points: IntradayPoint[]): IntradayPoint[] {
  const seen = new Set<string>();
  return points.filter((point) => {
    if (seen.has(point.timestamp)) {
      return false;
    }
    seen.add(point.timestamp);
    return true;
  });
}

async function fetchFMPIntraday(
  symbol: string,
  limit: number = 390
): Promise<IntradayPoint[]> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    console.warn("FMP_API_KEY not configured - returning empty data");
    return [];
  }

  try {
    const url = `https://financialmodelingprep.com/api/v3/historical-chart/1min/${symbol}?apikey=${apiKey}`;
    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`FMP API error for ${symbol}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`No intraday data returned for ${symbol}`);
      return [];
    }

    // Filter out invalid data points
    const validData = data.filter(isValidDataPoint);

    if (validData.length === 0) {
      console.warn(`All data points invalid for ${symbol}`);
      return [];
    }

    // Take most recent valid data points
    const recentData = validData.slice(0, limit);

    // Convert to our format
    const points: IntradayPoint[] = recentData.map((item: any) => {
      const timestamp = new Date(item.date).toISOString();
      const time = item.date.split(" ")[1]; // Extract time portion
      const session = getSession(time);

      return {
        timestamp,
        price: parseFloat(item.close),
        session,
      };
    });

    // Remove duplicates
    const uniquePoints = deduplicateByTimestamp(points);

    // Sort chronologically (FMP returns newest first, so reverse)
    const sortedPoints = uniquePoints.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    console.log(
      `✓ Fetched ${sortedPoints.length} valid intraday points for ${symbol}`
    );

    return sortedPoints;
  } catch (error) {
    console.error(`Error fetching intraday data for ${symbol}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get("symbols");
    const limitParam = searchParams.get("limit");

    if (!symbolsParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: symbols",
        },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim());
    const limit = limitParam ? parseInt(limitParam) : 390;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid limit parameter. Must be between 1 and 1000",
        },
        { status: 400 }
      );
    }

    const { date, time } = getTodayET();

    // Fetch data for all symbols in parallel
    const dataPromises = symbols.map(async (symbol) => {
      const points = await fetchFMPIntraday(symbol, limit);

      // Create session boundaries for today
      const sessionStart = `${date}T${EXTENDED_START}:00`;
      const regularStart = `${date}T${REGULAR_START}:00`;
      const regularEnd = `${date}T${REGULAR_END}:00`;
      const sessionEnd = `${date}T${EXTENDED_END}:00`;

      const series: IntradaySeries = {
        symbol,
        sessionStart: new Date(sessionStart).toISOString(),
        regularStart: new Date(regularStart).toISOString(),
        regularEnd: new Date(regularEnd).toISOString(),
        sessionEnd: new Date(sessionEnd).toISOString(),
        points,
      };

      return series;
    });

    const data = await Promise.all(dataPromises);

    // Calculate data quality metrics
    const totalPoints = data.reduce(
      (sum, series) => sum + series.points.length,
      0
    );
    const avgPointsPerSymbol = totalPoints / data.length;

    console.log(
      `📈 Intraday data summary: ${symbols.length} symbols, ${totalPoints} total points, ${avgPointsPerSymbol.toFixed(0)} avg per symbol`
    );

    // Return response with caching headers
    const response = NextResponse.json({
      success: true,
      data,
      source: "fmp",
      cached: false,
      timestamp: Date.now(),
    });

    // Set cache headers (cache for 1 minute)
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=30"
    );

    return response;
  } catch (error) {
    console.error("Error in intraday API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
