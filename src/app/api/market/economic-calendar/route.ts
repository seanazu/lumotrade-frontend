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
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        events: [],
        timestamp: Date.now(),
        error: "Finnhub API key is not configured",
      } as CalendarResponse);
    }

    // Calculate date range (today + 7 days)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fromDate = today.toISOString().split("T")[0];
    const toDate = nextWeek.toISOString().split("T")[0];

    // Fetch economic calendar from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${fromDate}&to=${toDate}&token=${apiKey}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter and map US events
    const events: EconomicEvent[] = (data.economicCalendar || [])
      .filter((event: any) => event.country === "US") // US events only
      .slice(0, 10) // Top 10 upcoming
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

    return NextResponse.json({
      success: true,
      events,
      timestamp: Date.now(),
    } as CalendarResponse);
  } catch (error) {
    console.error("Error in /api/market/economic-calendar:", error);
    return NextResponse.json({
      success: false,
      events: [],
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : "Unknown error",
    } as CalendarResponse);
  }
}

