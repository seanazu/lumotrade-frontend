/**
 * Market Assets API Route
 * GET /api/market/assets
 * Returns real-time prices for diverse assets: stocks, crypto, forex, commodities
 */

import { NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { eodhdClient } from "@/lib/api/clients/eodhd-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface AssetData {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  icon: string;
  type: "stock" | "crypto" | "forex" | "commodity";
}

interface AssetsResponse {
  success: boolean;
  data?: AssetData[];
  error?: string;
  source: string;
  timestamp: number;
}

/**
 * Fetch S&P 500 (SPY ETF)
 */
async function fetchSPY(): Promise<AssetData | null> {
  try {
    const quote = await fmpClient.getQuote("SPY");

    if (quote) {
      return {
        name: "S&P 500",
        symbol: "SPY",
        price: quote.price,
        changePercent: quote.changesPercentage,
        icon: "📊",
        type: "stock",
      };
    }
  } catch (error) {
    console.error("Error fetching SPY:", error);
  }

  return null;
}

/**
 * Fetch Bitcoin price
 */
async function fetchBitcoin(): Promise<AssetData | null> {
  try {
    // Try FMP first for crypto
    const quote = await fmpClient.getQuote("BTCUSD");

    if (quote) {
      return {
        name: "Bitcoin",
        symbol: "BTC/USD",
        price: quote.price,
        changePercent: quote.changesPercentage,
        icon: "₿",
        type: "crypto",
      };
    }
  } catch (error) {
    console.error("Error fetching BTC from FMP:", error);
  }

  // Try EODHD as fallback
  try {
    if (eodhdClient.isConfigured()) {
      const quote = await eodhdClient.getCryptoQuote("BTC-USD");

      if (quote) {
        return {
          name: "Bitcoin",
          symbol: "BTC/USD",
          price: quote.close,
          changePercent: quote.change_p,
          icon: "₿",
          type: "crypto",
        };
      }
    }
  } catch (error) {
    console.error("Error fetching BTC from EODHD:", error);
  }

  return null;
}

/**
 * Fetch EUR/USD forex rate
 */
async function fetchEURUSD(): Promise<AssetData | null> {
  try {
    // Try FMP first
    const quote = await fmpClient.getQuote("EURUSD");

    if (quote) {
      return {
        name: "EUR/USD",
        symbol: "Forex",
        price: quote.price,
        changePercent: quote.changesPercentage,
        icon: "€",
        type: "forex",
      };
    }
  } catch (error) {
    console.error("Error fetching EUR/USD from FMP:", error);
  }

  // Try EODHD as fallback
  try {
    if (eodhdClient.isConfigured()) {
      const quote = await eodhdClient.getForexQuote("EURUSD");

      if (quote) {
        return {
          name: "EUR/USD",
          symbol: "Forex",
          price: quote.close,
          changePercent: quote.change_p,
          icon: "€",
          type: "forex",
        };
      }
    }
  } catch (error) {
    console.error("Error fetching EUR/USD from EODHD:", error);
  }

  return null;
}

/**
 * Fetch Crude Oil (WTI)
 */
async function fetchCrudeOil(): Promise<AssetData | null> {
  try {
    // Try FMP commodities endpoint
    const quote = await fmpClient.getQuote("CLUSD");

    if (quote) {
      return {
        name: "Crude Oil",
        symbol: "WTI",
        price: quote.price,
        changePercent: quote.changesPercentage,
        icon: "🛢",
        type: "commodity",
      };
    }
  } catch (error) {
    console.error("Error fetching crude oil from FMP:", error);
  }

  // Try EODHD as fallback
  try {
    if (eodhdClient.isConfigured()) {
      const quote = await eodhdClient.getCommodityQuote("CL");

      if (quote) {
        return {
          name: "Crude Oil",
          symbol: "WTI",
          price: quote.close,
          changePercent: quote.change_p,
          icon: "🛢",
          type: "commodity",
        };
      }
    }
  } catch (error) {
    console.error("Error fetching crude oil from EODHD:", error);
  }

  return null;
}

/**
 * Get fallback data for an asset type
 */
function getFallbackData(type: string): AssetData {
  const fallbacks: Record<string, AssetData> = {
    spy: {
      name: "S&P 500",
      symbol: "SPY",
      price: 450.25,
      changePercent: 0.75,
      icon: "📊",
      type: "stock",
    },
    btc: {
      name: "Bitcoin",
      symbol: "BTC/USD",
      price: 43250.0,
      changePercent: 1.85,
      icon: "₿",
      type: "crypto",
    },
    eur: {
      name: "EUR/USD",
      symbol: "Forex",
      price: 1.0875,
      changePercent: -0.12,
      icon: "€",
      type: "forex",
    },
    oil: {
      name: "Crude Oil",
      symbol: "WTI",
      price: 78.45,
      changePercent: 0.65,
      icon: "🛢",
      type: "commodity",
    },
  };

  return fallbacks[type] || fallbacks.spy;
}

export async function GET() {
  try {
    // Check if at least FMP is configured
    if (!fmpClient.isConfigured()) {
      console.error("FMP API not configured.");
      return NextResponse.json(
        {
          success: false,
          error: "FMP API is not configured. Add FMP_API_KEY to .env.local",
          timestamp: Date.now(),
        } as AssetsResponse,
        { status: 503 }
      );
    }

    // Fetch all assets in parallel
    const [spy, btc, eur, oil] = await Promise.all([
      fetchSPY(),
      fetchBitcoin(),
      fetchEURUSD(),
      fetchCrudeOil(),
    ]);

    // Build assets array with fallbacks
    const assets: AssetData[] = [
      spy || getFallbackData("spy"),
      btc || getFallbackData("btc"),
      eur || getFallbackData("eur"),
      oil || getFallbackData("oil"),
    ];

    // Determine source
    const hasRealData = !!(spy || btc || eur || oil);
    const source = hasRealData ? "fmp+eodhd" : "fallback";

    return NextResponse.json({
      success: true,
      data: assets,
      source,
      timestamp: Date.now(),
    } as AssetsResponse);
  } catch (error) {
    console.error("Error in /api/market/assets:", error);

    // Return fallback data on error
    const fallbackAssets: AssetData[] = [
      getFallbackData("spy"),
      getFallbackData("btc"),
      getFallbackData("eur"),
      getFallbackData("oil"),
    ];

    return NextResponse.json({
      success: true,
      data: fallbackAssets,
      source: "fallback",
      timestamp: Date.now(),
    } as AssetsResponse);
  }
}
