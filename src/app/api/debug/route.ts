import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars: {
      POLYGON_API_KEY: !!process.env.POLYGON_API_KEY,
      MARKETAUX_API_KEY: !!process.env.MARKETAUX_API_KEY,
      FMP_API_KEY: !!process.env.FMP_API_KEY,
      FINNHUB_API_KEY: !!process.env.FINNHUB_API_KEY,
      ORATS_API_KEY: !!process.env.ORATS_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      INSTANT_APP_ID: !!process.env.NEXT_PUBLIC_INSTANT_APP_ID,
      INSTANT_ADMIN_TOKEN: !!process.env.INSTANT_ADMIN_TOKEN,
    },
    tests: {} as any,
  };

  // Test 1: Import modules
  try {
    const { MarketAnalyzer } = await import("@/lib/trading");
    diagnostics.tests.marketAnalyzer = "✅ OK";
  } catch (error: any) {
    diagnostics.tests.marketAnalyzer = `❌ ${error.message}`;
  }

  // Test 2: Advanced Screener
  try {
    const { AdvancedStockScreener } = await import("@/lib/trading/advanced-screener");
    diagnostics.tests.advancedScreener = "✅ OK";
  } catch (error: any) {
    diagnostics.tests.advancedScreener = `❌ ${error.message}`;
  }

  // Test 3: OpenAI Client
  try {
    const { openaiClient } = await import("@/lib/api/clients/openai-client");
    diagnostics.tests.openaiClient = "✅ OK";
  } catch (error: any) {
    diagnostics.tests.openaiClient = `❌ ${error.message}`;
  }

  // Test 4: File Cache
  try {
    const { getOrComputeDailyCache } = await import("@/lib/server/file-cache");
    diagnostics.tests.fileCache = "✅ OK";
  } catch (error: any) {
    diagnostics.tests.fileCache = `❌ ${error.message}`;
  }

  // Test 5: FMP Client
  try {
    const { fmpClient } = await import("@/lib/api/clients/fmp-client");
    const gainers = await fmpClient.getGainers();
    diagnostics.tests.fmpClient = `✅ OK (${gainers.length} gainers)`;
  } catch (error: any) {
    diagnostics.tests.fmpClient = `❌ ${error.message}`;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}

