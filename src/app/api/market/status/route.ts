/**
 * Market Status API Route
 * GET /api/market/status
 * Returns dynamic market status for page header subtitle
 */

import { NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MarketStatus {
  isOpen: boolean;
  session: "pre" | "regular" | "after" | "closed";
  subtitle: string;
}

interface MarketStatusResponse {
  success: boolean;
  data?: MarketStatus;
  error?: string;
  source: string;
  timestamp: number;
}

/**
 * Get current market session
 */
function getMarketSession(): {
  isOpen: boolean;
  session: "pre" | "regular" | "after" | "closed";
} {
  const now = new Date();

  // Convert to ET timezone
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = etTime.getDay();
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();
  const currentTime = hours * 60 + minutes;

  // Weekend
  if (day === 0 || day === 6) {
    return { isOpen: false, session: "closed" };
  }

  // Market times in ET
  const preMarketStart = 4 * 60; // 4:00 AM
  const regularMarketStart = 9 * 60 + 30; // 9:30 AM
  const regularMarketEnd = 16 * 60; // 4:00 PM
  const afterHoursEnd = 20 * 60; // 8:00 PM

  if (currentTime >= preMarketStart && currentTime < regularMarketStart) {
    return { isOpen: true, session: "pre" };
  } else if (
    currentTime >= regularMarketStart &&
    currentTime < regularMarketEnd
  ) {
    return { isOpen: true, session: "regular" };
  } else if (currentTime >= regularMarketEnd && currentTime < afterHoursEnd) {
    return { isOpen: true, session: "after" };
  } else {
    return { isOpen: false, session: "closed" };
  }
}

/**
 * Generate dynamic subtitle based on market conditions
 */
async function generateSubtitle(
  session: "pre" | "regular" | "after" | "closed",
  spyVolume?: number,
  spyAvgVolume?: number,
  spyChange?: number
): Promise<string> {
  // Calculate volume comparison
  let volumeText = "";
  if (spyVolume && spyAvgVolume && spyAvgVolume > 0) {
    const volumeRatio = spyVolume / spyAvgVolume;
    const volumeChange = ((volumeRatio - 1) * 100).toFixed(0);

    if (volumeRatio > 1.15) {
      volumeText = `Volume is up +${volumeChange}% vs 30-day avg.`;
    } else if (volumeRatio < 0.85) {
      volumeText = `Volume is down ${volumeChange}% vs 30-day avg.`;
    } else {
      volumeText = `Volume is normal vs 30-day avg.`;
    }
  }

  // Build subtitle based on session
  switch (session) {
    case "pre":
      return `Pre-market trading is active. ${volumeText || "Futures indicate mixed open."}`;

    case "regular":
      if (spyChange !== undefined) {
        const direction = spyChange > 0 ? "up" : "down";
        const changeText = `${Math.abs(spyChange).toFixed(2)}%`;
        return `Markets are open. S&P 500 ${direction} ${changeText}. ${volumeText}`;
      }
      return `Markets are open. ${volumeText || "Trading is active."}`;

    case "after":
      return `After-hours trading is active. ${volumeText || "Extended hours in session."}`;

    case "closed":
      const now = new Date();
      const day = now.getDay();

      if (day === 0 || day === 6) {
        return "Markets are closed for the weekend. Futures available.";
      } else {
        return "Markets are closed. Pre-market opens at 4:00 AM ET.";
      }

    default:
      return "Market status unavailable.";
  }
}

export async function GET() {
  try {
    // Get market session info
    const { isOpen, session } = getMarketSession();

    // Check if FMP is configured
    if (!fmpClient.isConfigured()) {
      console.error("FMP API not configured.");

      // Return basic status without live data
      const basicSubtitle = await generateSubtitle(session);

      return NextResponse.json({
        success: true,
        data: {
          isOpen,
          session,
          subtitle: basicSubtitle,
        },
        source: "static",
        timestamp: Date.now(),
      } as MarketStatusResponse);
    }

    // Fetch SPY data for volume and price info
    const spyQuote = await fmpClient.getQuote("SPY");

    // Generate dynamic subtitle
    const subtitle = await generateSubtitle(
      session,
      spyQuote?.volume,
      spyQuote?.avgVolume,
      spyQuote?.changesPercentage
    );

    const status: MarketStatus = {
      isOpen,
      session,
      subtitle,
    };

    return NextResponse.json({
      success: true,
      data: status,
      source: "fmp",
      timestamp: Date.now(),
    } as MarketStatusResponse);
  } catch (error) {
    console.error("Error in /api/market/status:", error);

    // Fallback to basic status
    const { isOpen, session } = getMarketSession();
    const fallbackSubtitle = await generateSubtitle(session);

    return NextResponse.json({
      success: true,
      data: {
        isOpen,
        session,
        subtitle: fallbackSubtitle,
      },
      source: "fallback",
      timestamp: Date.now(),
    } as MarketStatusResponse);
  }
}
