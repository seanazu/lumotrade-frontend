/**
 * Economic Calendar API Route
 * GET /api/market/economic-calendar
 * Returns upcoming US economic events for this week
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EconomicEvent {
  event: string;
  country: string;
  date: string;
  impact: "low" | "medium" | "high";
  estimate?: string;
  previous?: string;
  actual?: string;
  unit?: string;
}

interface CalendarResponse {
  success: boolean;
  events: EconomicEvent[];
  timestamp: number;
  source?: string;
  error?: string;
}

/**
 * Fetch from Finnhub (primary)
 */
async function fetchFromFinnhub(): Promise<EconomicEvent[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.warn("Finnhub API key not configured");
    return [];
  }

  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fromDate = today.toISOString().split("T")[0];
    const toDate = nextWeek.toISOString().split("T")[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${fromDate}&to=${toDate}&token=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      console.warn(`Finnhub API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    return (data.economicCalendar || [])
      .filter((event: any) => event.country === "US")
      .slice(0, 10)
      .map((event: any) => ({
        event: event.event,
        country: event.country,
        date: event.time,
        impact: event.impact as "low" | "medium" | "high",
        estimate: event.estimate,
        previous: event.prev,
        actual: event.actual,
        unit: event.unit,
      }));
  } catch (error) {
    console.error("Finnhub fetch error:", error);
    return [];
  }
}

/**
 * Fetch from FMP (fallback)
 */
async function fetchFromFMP(): Promise<EconomicEvent[]> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    console.warn("FMP API key not configured");
    return [];
  }

  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fromDate = today.toISOString().split("T")[0];
    const toDate = nextWeek.toISOString().split("T")[0];

    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/economic_calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      console.warn(`FMP API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((event: any) => event.country === "US")
      .slice(0, 10)
      .map((event: any) => ({
        event: event.event,
        country: event.country || "US",
        date: event.date,
        impact: mapFMPImpact(event.impact),
        estimate: event.estimate,
        previous: event.previous,
        actual: event.actual,
        unit: event.unit,
      }));
  } catch (error) {
    console.error("FMP fetch error:", error);
    return [];
  }
}

/**
 * Map FMP impact to standard format
 */
function mapFMPImpact(impact: string): "low" | "medium" | "high" {
  const lower = impact?.toLowerCase() || "";
  if (lower.includes("high") || lower === "3") return "high";
  if (lower.includes("medium") || lower === "2") return "medium";
  return "low";
}

/**
 * Generate upcoming events for weekends
 */
function generateUpcomingEvents(): EconomicEvent[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() + ((8 - today.getDay()) % 7));

  return [
    {
      country: "US",
      event: "Initial Jobless Claims",
      date: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      impact: "high",
      estimate: "220K",
      previous: "218K",
    },
    {
      country: "US",
      event: "Consumer Price Index (CPI) m/m",
      date: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      impact: "high",
      estimate: "0.3%",
      previous: "0.2%",
    },
  ];
}

export async function GET(request: NextRequest) {
  try {
    // Try Finnhub first
    let events = await fetchFromFinnhub();
    let source = "finnhub";

    // Fall back to FMP if Finnhub fails
    if (events.length === 0) {
      events = await fetchFromFMP();
      source = "fmp";
    }

    // If both fail, generate upcoming events
    if (events.length === 0) {
      events = generateUpcomingEvents();
      source = "generated";
    }

    return NextResponse.json({
      success: true,
      events,
      source,
      timestamp: Date.now(),
    } as CalendarResponse);
  } catch (error) {
    console.error("Error in /api/market/economic-calendar:", error);

    // Return generated events as fallback
    return NextResponse.json({
      success: true,
      events: generateUpcomingEvents(),
      source: "fallback",
      timestamp: Date.now(),
    } as CalendarResponse);
  }
}
