import { NextRequest, NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { polygonClient } from "@/lib/api/clients/polygon-client";
import { getEtDateString } from "@/lib/server/time";
import {
  getOrComputeDailyCache,
  getOrComputeTtlCache,
} from "@/lib/server/api-cache";
import { calculateAllIndicators } from "@/lib/analysis/technical-indicators";
import { detectAllPatterns } from "@/lib/analysis/pattern-recognition";
import { calculateSentiment } from "@/lib/analysis/sentiment-engine";
import { detectMarketRegime } from "@/lib/analysis/market-regime";
import {
  identifyCatalysts,
  analyzeCatalystRisk,
} from "@/lib/analysis/catalyst-tracker";
import {
  generateFactorScores,
  calculateFundamentalScore,
} from "@/lib/ai/multi-factor-scoring";
import { generateMultipleStrategies } from "@/lib/ai/strategy-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

/**
 * GET /api/stock/research/[symbol]
 *
 * Comprehensive research endpoint that orchestrates all analysis layers
 * and generates multiple AI-powered trading strategies
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { symbol: rawSymbol } = await context.params;
    const symbol = rawSymbol.toUpperCase();
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get("timeframe") || "1M";
    const generateStrategies = searchParams.get("strategies") === "1";
    const forceRefresh = searchParams.get("refresh") === "1";

    console.log(
      `🔬 Comprehensive research for ${symbol} (strategies: ${generateStrategies})...`
    );

    const dateEt = getEtDateString(new Date());
    const baseKey = `stock:research:${symbol}:${timeframe}:base:v1`;

    // Layer 1: Base Research (30 min cache)
    const { data: baseResearch } = await getOrComputeTtlCache({
      key: baseKey,
      ttlSeconds: 30 * 60,
      forceRefresh,
      compute: async () => {
        console.log(`📊 Fetching all data layers for ${symbol}...`);

        // Fetch historical chart data (2 years)
        const chartData = await fetchHistoricalData(symbol);

        // Parallel fetch all data layers
        const [
          quote,
          profile,
          comprehensiveFinancials,
          news,
          analystData,
          insiderTrading,
          institutionalOwnership,
          technicals,
          marketStatus,
          sectorPerformance,
          economicCalendar,
          marketBreadth,
        ] = await Promise.all([
          fmpClient.getQuote(symbol),
          fmpClient.getCompanyProfile(symbol),
          fmpClient.getComprehensiveFinancials(symbol),
          fmpClient.getStockNews(symbol, 30),
          fmpClient.getAnalystRatings(symbol),
          fmpClient.getInsiderTrading(symbol),
          fmpClient.getInstitutionalOwnership(symbol),
          polygonClient.getTechnicalAnalysis(symbol),
          fetchMarketStatus(),
          fetchSectorPerformance(),
          fetchEconomicCalendar(),
          fetchMarketBreadth(),
        ]);

        if (!quote || !chartData || chartData.length < 200) {
          throw new Error(`Insufficient data for research on ${symbol}`);
        }

        const currentPrice = quote.price;

        // Calculate all technical indicators
        const technicalIndicators = calculateAllIndicators(
          chartData,
          currentPrice
        );

        // Detect all patterns
        const patterns = detectAllPatterns(chartData, currentPrice);

        // Calculate sentiment
        const sentiment = calculateSentiment({
          news: news || [],
          analystRatings: analystData?.ratings || [],
          insiderTrading: insiderTrading || [],
          socialMentions: [],
        });

        // Detect market regime
        const marketRegime = detectMarketRegime({
          spyPrice: marketStatus.spyPrice,
          spyChange: marketStatus.spyChange,
          vix: marketStatus.vix,
          advancers: marketBreadth.advancers,
          decliners: marketBreadth.decliners,
          newHighs: marketBreadth.newHighs,
          newLows: marketBreadth.newLows,
        });

        // Calculate fundamental score
        const fundamentalAnalysis = calculateFundamentalScore(
          comprehensiveFinancials
        );

        // Identify catalysts
        const catalysts = identifyCatalysts({
          symbol,
          earningsDate: (profile as any)?.earningsDate,
          dividendDate: (profile as any)?.dividendDate,
          economicEvents: economicCalendar,
          news: news || [],
        });

        // Generate factor scores
        const factorScores = generateFactorScores({
          financials: comprehensiveFinancials,
          technicals: technicalIndicators,
          sentiment,
          patterns,
        });

        // Calculate key levels
        const keyLevels = calculateKeyLevels(chartData, currentPrice);

        return {
          symbol,
          timestamp: Date.now(),
          currentPrice,

          // Company Info
          profile: {
            name: (profile as any)?.companyName || symbol,
            sector: (profile as any)?.sector || "Unknown",
            industry: (profile as any)?.industry || "Unknown",
            description: (profile as any)?.description,
            marketCap: quote.marketCap,
            ceo: (profile as any)?.ceo,
          },

          // Market Context
          marketContext: {
            regime: marketRegime,
            spyPrice: marketStatus.spyPrice,
            spyChange: marketStatus.spyChange,
            vix: marketStatus.vix,
            breadth: marketBreadth,
            sectorPerformance,
          },

          // Analysis Layers
          technicals: technicalIndicators,
          patterns,
          sentiment,
          keyLevels,
          catalysts,

          // Financials
          financials: {
            ...comprehensiveFinancials,
            fundamentalScore: fundamentalAnalysis.score,
            components: fundamentalAnalysis.components,
          },

          // Composite Scores
          scores: factorScores,

          // Raw data for strategy generation
          _chartData: chartData,
          _analystData: analystData,
        };
      },
    });

    // Layer 2: AI Strategies (daily cache, only if requested)
    let strategies = null;
    if (generateStrategies) {
      const strategiesKey = `stock:strategies:${symbol}:${timeframe}:v1`;

      const { data: strategyData } = await getOrComputeDailyCache({
        key: strategiesKey,
        dateEt,
        forceRefresh,
        compute: async () => {
          console.log(`🤖 Generating AI strategies for ${symbol}...`);

          const strategies = await generateMultipleStrategies({
            symbol,
            currentPrice: baseResearch.currentPrice,
            factorScores: baseResearch.scores,
            marketRegime: baseResearch.marketContext.regime,
            keyLevels: baseResearch.keyLevels,
            technicals: {
              trend: baseResearch.technicals.trendAlignment.daily,
              rsi: baseResearch.technicals.rsi,
              macd: baseResearch.technicals.macd,
              sma20: baseResearch.technicals.sma20,
              sma50: baseResearch.technicals.sma50,
              sma200: baseResearch.technicals.sma200,
            },
            fundamentals: {
              companyName: baseResearch.profile.name,
              sector: baseResearch.profile.sector,
              marketCap: baseResearch.profile.marketCap,
              peRatio: baseResearch.financials.ratios?.peRatio,
              revenueGrowth: baseResearch.financials.ratios?.revenueGrowth,
              profitMargin: baseResearch.financials.ratios?.netProfitMargin,
            },
            sentiment: {
              score: baseResearch.sentiment.score,
              interpretation: baseResearch.sentiment.interpretation,
              momentum: baseResearch.sentiment.momentum,
            },
            patterns: baseResearch.patterns,
            upcomingCatalysts: baseResearch.catalysts,
          });

          return strategies;
        },
      });

      strategies = strategyData;
    }

    // Build response
    const response = {
      success: true,
      data: {
        ...baseResearch,
        strategies: strategies || [],
      },
      cache: {
        baseResearch: "30min TTL",
        strategies: strategies ? "Daily cache (ET date)" : "Not generated",
      },
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in comprehensive research:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error generating comprehensive research",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

// Helper Functions

async function fetchHistoricalData(symbol: string) {
  // Fetch 2 years of daily data
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 2);

  const fromStr = from.toISOString().split("T")[0];
  const toStr = to.toISOString().split("T")[0];

  let bars = await polygonClient.getAggregateBars(
    symbol,
    fromStr,
    toStr,
    "day"
  );

  // Fallback to FMP if Polygon fails
  if (!bars || bars.length === 0) {
    console.log(`Falling back to FMP for historical data...`);
    const fmpUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fromStr}&to=${toStr}&apikey=${process.env.FMP_API_KEY}`;
    const fmpResponse = await fetch(fmpUrl);
    const fmpData = await fmpResponse.json();

    if (fmpData.historical && Array.isArray(fmpData.historical)) {
      bars = fmpData.historical.map((bar: any) => ({
        t: new Date(bar.date).getTime(),
        o: bar.open,
        h: bar.high,
        l: bar.low,
        c: bar.close,
        v: bar.volume,
      }));
    }
  }

  return bars.map((bar) => ({
    time: bar.t,
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
  }));
}

async function fetchMarketStatus() {
  const [spyQuote, vixQuote] = await Promise.all([
    fmpClient.getQuote("SPY"),
    fmpClient.getQuote("^VIX"),
  ]);

  return {
    spyPrice: spyQuote?.price || 500,
    spyChange: spyQuote?.changesPercentage || 0,
    vix: vixQuote?.price || 15,
  };
}

async function fetchSectorPerformance() {
  // Simplified sector performance
  return {
    technology: 0.5,
    healthcare: 0.2,
    financials: -0.1,
    energy: 0.8,
    consumer: 0.3,
  };
}

async function fetchEconomicCalendar() {
  // Would fetch from economic calendar API
  return [];
}

async function fetchMarketBreadth() {
  // Simplified breadth metrics
  return {
    advancers: 1800,
    decliners: 1200,
    newHighs: 120,
    newLows: 45,
  };
}

function calculateKeyLevels(chartData: any[], currentPrice: number) {
  const highs = chartData.map((c) => c.high);
  const lows = chartData.map((c) => c.low);

  // Find support/resistance
  const support = findSupport(lows, currentPrice);
  const resistance = findResistance(highs, currentPrice);

  // Pivot point
  const high = Math.max(...highs.slice(-1));
  const low = Math.min(...lows.slice(-1));
  const close = chartData[chartData.length - 1].close;
  const pivotPoint = (high + low + close) / 3;

  return {
    support,
    resistance,
    pivotPoint,
  };
}

function findSupport(lows: number[], currentPrice: number): number[] {
  const candidates = lows.filter((l) => l < currentPrice);
  const sorted = [...new Set(candidates)].sort((a, b) => b - a);
  return sorted.slice(0, 5);
}

function findResistance(highs: number[], currentPrice: number): number[] {
  const candidates = highs.filter((h) => h > currentPrice);
  const sorted = [...new Set(candidates)].sort((a, b) => a - b);
  return sorted.slice(0, 5);
}
