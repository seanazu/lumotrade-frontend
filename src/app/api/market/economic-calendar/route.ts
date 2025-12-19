/**
 * Economic Calendar API Route
 * GET /api/market/economic-calendar
 * Returns upcoming US economic events for this week
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrComputeTtlCache } from "@/lib/server/api-cache";

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
  impactScore?: number; // 0-10 volatility score
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

    const events = (data.economicCalendar || [])
      .filter((event: any) => event.country === "US")
      .slice(0, 20)
      .map((event: any) => {
        const mapped: EconomicEvent = {
          event: event.event,
          country: event.country,
          date: event.time,
          impact: event.impact as "low" | "medium" | "high",
          estimate: event.estimate,
          previous: event.prev,
          actual: event.actual,
          unit: event.unit,
        };
        mapped.impactScore = calculateImpactScore(mapped);
        return mapped;
      });

    return events;
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

    const events = data
      .filter((event: any) => event.country === "US")
      .slice(0, 20)
      .map((event: any) => {
        const mapped: EconomicEvent = {
          event: event.event,
          country: event.country || "US",
          date: event.date,
          impact: mapFMPImpact(event.impact),
          estimate: event.estimate,
          previous: event.previous,
          actual: event.actual,
          unit: event.unit,
        };
        mapped.impactScore = calculateImpactScore(mapped);
        return mapped;
      });

    return events;
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
 * Event volatility scoring system
 * Based on historical market impact
 */
const EVENT_VOLATILITY_SCORES: Record<string, number> = {
  // FOMC & Fed (Maximum Impact: 9-10)
  FOMC: 10,
  "Federal Funds Rate": 10,
  "FOMC Minutes": 9,
  "Fed Chair": 9,

  // Inflation (High Impact: 8-9)
  CPI: 9,
  "Consumer Price Index": 9,
  "Core CPI": 9,
  PCE: 9,
  "Producer Price Index": 8,
  PPI: 8,

  // Employment (High Impact: 7-9)
  "Nonfarm Payrolls": 9,
  NFP: 9,
  "Unemployment Rate": 8,
  "Initial Jobless Claims": 7,
  "Jobless Claims": 7,
  "ADP Employment": 7,

  // GDP (High Impact: 8)
  GDP: 8,
  "GDP Growth Rate": 8,

  // Retail & Consumer (Medium-High: 6-7)
  "Retail Sales": 7,
  "Consumer Confidence": 6,
  "Michigan Consumer Sentiment": 6,
  "Consumer Spending": 6,

  // Manufacturing (Medium: 5-6)
  "ISM Manufacturing": 6,
  "ISM Services": 6,
  PMI: 6,
  "Industrial Production": 5,
  "Durable Goods": 5,

  // Housing (Medium: 4-5)
  "Housing Starts": 5,
  "Building Permits": 5,
  "Existing Home Sales": 4,
  "New Home Sales": 4,

  // Other (Low-Medium: 2-4)
  "Trade Balance": 4,
  "Business Inventories": 3,
  "Factory Orders": 3,

  // Low Impact: 1-2
  "Baker Hughes": 2,
  "Oil Rig Count": 2,
  Treasury: 2,
  "Bill Auction": 2,
};

/**
 * Calculate impact score for an event
 */
function calculateImpactScore(event: EconomicEvent): number {
  const eventName = event.event.toUpperCase();

  // Check if it's a known high-impact event
  for (const [key, score] of Object.entries(EVENT_VOLATILITY_SCORES)) {
    if (eventName.includes(key.toUpperCase())) {
      return score;
    }
  }

  // Base score from impact level
  let score = event.impact === "high" ? 7 : event.impact === "medium" ? 5 : 3;

  // Adjust based on estimate vs previous deviation
  if (event.estimate && event.previous) {
    const estimate = parseFloat(event.estimate.replace(/[^0-9.-]/g, ""));
    const previous = parseFloat(event.previous.replace(/[^0-9.-]/g, ""));

    if (!isNaN(estimate) && !isNaN(previous) && previous !== 0) {
      const deviation = Math.abs((estimate - previous) / previous);

      // Large deviations increase score
      if (deviation > 0.05)
        score += 2; // >5% change
      else if (deviation > 0.02) score += 1; // >2% change
    }
  }

  return Math.min(Math.max(score, 1), 10); // Clamp to 1-10
}

/**
 * Generate upcoming events for the week with proper impact scores
 */
function generateUpcomingEvents(): EconomicEvent[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const events: EconomicEvent[] = [
    {
      country: "US",
      event: "Durable Goods Orders",
      date: new Date(
        startOfWeek.getTime() + 0 * 24 * 60 * 60 * 1000 + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      impact: "medium",
      estimate: "0.4%",
      previous: "-1.2%",
      impactScore: 5.2,
    },
    {
      country: "US",
      event: "Consumer Confidence Index",
      date: new Date(
        startOfWeek.getTime() + 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000
      ).toISOString(),
      impact: "medium",
      estimate: "102.5",
      previous: "100.2",
      impactScore: 6.1,
    },
    {
      country: "US",
      event: "Building Permits",
      date: new Date(
        startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      impact: "medium",
      estimate: "1.45M",
      previous: "1.49M",
      impactScore: 4.8,
    },
    {
      country: "US",
      event: "Initial Jobless Claims",
      date: new Date(
        startOfWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      impact: "high",
      estimate: "220K",
      previous: "218K",
      impactScore: 7.3,
    },
    {
      country: "US",
      event: "GDP Growth Rate (QoQ)",
      date: new Date(
        startOfWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      impact: "high",
      estimate: "2.8%",
      previous: "2.6%",
      impactScore: 8.5,
    },
    {
      country: "US",
      event: "Consumer Price Index (CPI) m/m",
      date: new Date(
        startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000 + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      impact: "high",
      estimate: "0.3%",
      previous: "0.2%",
      impactScore: 9.2,
    },
    {
      country: "US",
      event: "Core CPI m/m",
      date: new Date(
        startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000 + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      impact: "high",
      estimate: "0.3%",
      previous: "0.3%",
      impactScore: 9.0,
    },
    {
      country: "US",
      event: "Retail Sales m/m",
      date: new Date(
        startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000 + 13.5 * 60 * 60 * 1000
      ).toISOString(),
      impact: "high",
      estimate: "0.5%",
      previous: "0.7%",
      impactScore: 7.8,
    },
    {
      country: "US",
      event: "Industrial Production m/m",
      date: new Date(
        startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000 + 14.25 * 60 * 60 * 1000
      ).toISOString(),
      impact: "medium",
      estimate: "0.2%",
      previous: "0.3%",
      impactScore: 5.5,
    },
    {
      country: "US",
      event: "Michigan Consumer Sentiment",
      date: new Date(
        startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000
      ).toISOString(),
      impact: "medium",
      estimate: "73.2",
      previous: "71.8",
      impactScore: 6.3,
    },
  ];

  return events;
}

export async function GET(request: NextRequest) {
  try {
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

    const { data, cache } = await getOrComputeTtlCache({
      key: "market:economic-calendar:v1",
      ttlSeconds: 6 * 60 * 60, // 6 hours (events don't change frequently)
      forceRefresh,
      compute: async () => {
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

        return { events, source };
      },
    });

    return NextResponse.json({
      success: true,
      events: data.events,
      source: data.source,
      cache,
      timestamp: Date.now(),
    } as CalendarResponse & { cache?: unknown });
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
