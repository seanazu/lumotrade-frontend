import { NextRequest, NextResponse } from "next/server";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { polygonClient } from "@/lib/api/clients/polygon-client";
import type { StockAnalysisData } from "@/hooks/useStockAnalysis";

const CACHE_DURATION = 120; // 2 minutes during market hours
const STALE_WHILE_REVALIDATE = 300; // 5 minutes

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

/**
 * GET /api/stock/analyze/[symbol]
 *
 * Comprehensive stock analysis endpoint
 * Returns all data needed for the analyzer page
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { symbol: rawSymbol } = await context.params;
    const symbol = rawSymbol.toUpperCase();
    console.log(`🔍 Analyzing ${symbol}...`);

    const includeAI = request.nextUrl.searchParams.get("includeAI") === "1";

    // Fetch all data in parallel for speed
    const [quote, profile, technicals, news, earnings] = await Promise.all([
      fmpClient.getQuote(symbol),
      fmpClient.getCompanyProfile(symbol),
      polygonClient.getTechnicalAnalysis(symbol),
      fmpClient.getStockNews(symbol, 10),
      fetchEarningsData(symbol),
    ]);

    if (!quote) {
      return NextResponse.json(
        {
          success: false,
          error: `Unable to find quote data for ${symbol}`,
          timestamp: Date.now(),
        },
        { status: 404 }
      );
    }

    // Build comprehensive analysis object
    const analysis: StockAnalysisData = {
      symbol,
      quote: {
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changesPercentage || 0,
        high: quote.dayHigh || quote.price || 0,
        low: quote.dayLow || quote.price || 0,
        volume: quote.volume || 0,
        previousClose: quote.previousClose || quote.price || 0,
        marketCap: quote.marketCap,
        pe: (quote as any).pe,
        eps: (quote as any).eps,
      },
      profile: {
        name: (profile as any)?.companyName || symbol,
        sector: (profile as any)?.sector || "Unknown",
        industry: (profile as any)?.industry || "Unknown",
        description: (profile as any)?.description,
        website: (profile as any)?.website,
        ceo: (profile as any)?.ceo,
        employees: (profile as any)?.fullTimeEmployees,
      },
      technicals: {
        rsi: technicals?.rsi?.value,
        rsiInterpretation: technicals?.rsi?.interpretation,
        macd: technicals?.macd
          ? {
              value: technicals.macd.value,
              signal: technicals.macd.signal,
              histogram: technicals.macd.histogram,
              interpretation: technicals.macd.interpretation,
            }
          : undefined,
        movingAverages: {
          sma20: technicals?.movingAverages.sma20,
          sma50: technicals?.movingAverages.sma50,
          sma200: technicals?.movingAverages.sma200,
          ema20: technicals?.movingAverages.ema20,
        },
        trend: technicals?.trend || "neutral",
        summary: technicals?.summary || "Insufficient data for analysis",
      },
      keyLevels: calculateKeyLevels(quote),
      catalysts: await fetchCatalysts(symbol, earnings),
      news: news.slice(0, 10).map((article) => ({
        title: article.title,
        publishedDate:
          article.publishedDate || article.date || new Date().toISOString(),
        url: article.url || article.link || "",
        source: article.site || article.source,
        sentiment: article.sentiment,
      })),
      financials: await fetchFinancials(symbol),
      earnings: earnings,
      riskProfile: calculateRiskProfile(quote, profile as any),
    };

    // IMPORTANT: AI calls are expensive and slow; load them lazily per-component.
    // For backwards compatibility, allow includeAI=1
    if (includeAI) {
      try {
        const [aiThesisResponse, tradingSignalResponse] = await Promise.all([
          fetch(`${request.nextUrl.origin}/api/stock/ai-thesis/${symbol}`).then(
            (r) => r.json()
          ),
          fetch(
            `${request.nextUrl.origin}/api/stock/trading-signal/${symbol}`
          ).then((r) => r.json()),
        ]);

        if (aiThesisResponse.success) {
          analysis.aiThesis = aiThesisResponse.data;
        }

        if (tradingSignalResponse.success) {
          analysis.tradingSignal = tradingSignalResponse.data;
        }
      } catch (error) {
        console.warn("AI/Trading signal generation failed:", error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: analysis,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        },
      }
    );
  } catch (error) {
    console.error("Error in stock analysis endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch earnings data from FMP
 */
async function fetchEarningsData(symbol: string) {
  try {
    const [calendar, historical] = await Promise.all([
      fmpClient.getEarningsCalendar(symbol),
      fmpClient.getHistoricalEarnings(symbol, 2),
    ]);

    // Get last earnings data for comparison
    const lastEarnings =
      historical && historical.length > 0 ? historical[0] : null;

    return {
      nextDate: calendar?.date,
      nextTiming: calendar?.time || "N/A",
      estimate: calendar?.epsEstimated,
      revenueEstimate: calendar?.revenueEstimated,
      lastActual: lastEarnings?.eps,
      lastEstimate: lastEarnings?.epsEstimated,
      surprise: lastEarnings
        ? ((lastEarnings.eps - lastEarnings.epsEstimated) /
            lastEarnings.epsEstimated) *
          100
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return {
      nextDate: undefined,
      nextTiming: undefined,
      estimate: undefined,
      lastActual: undefined,
      lastEstimate: undefined,
      surprise: undefined,
    };
  }
}

/**
 * Fetch financial metrics from FMP
 */
async function fetchFinancials(symbol: string) {
  try {
    const incomeStatement = await fmpClient.getIncomeStatement(
      symbol,
      "quarter",
      4
    );

    if (!incomeStatement || incomeStatement.length === 0) {
      return {
        revenue: undefined,
        revenueGrowth: undefined,
        netIncome: undefined,
        netIncomeGrowth: undefined,
        eps: undefined,
        epsGrowth: undefined,
        grossMargin: undefined,
        operatingMargin: undefined,
      };
    }

    const latest = incomeStatement[0];
    const previous = incomeStatement[1];

    // Calculate growth rates
    const revenueGrowth =
      previous && latest.revenue && previous.revenue
        ? ((latest.revenue - previous.revenue) / previous.revenue) * 100
        : undefined;

    const netIncomeGrowth =
      previous && latest.netIncome && previous.netIncome
        ? ((latest.netIncome - previous.netIncome) / previous.netIncome) * 100
        : undefined;

    const epsGrowth =
      previous && latest.eps && previous.eps
        ? ((latest.eps - previous.eps) / previous.eps) * 100
        : undefined;

    return {
      revenue: latest.revenue,
      revenueGrowth,
      netIncome: latest.netIncome,
      netIncomeGrowth,
      eps: latest.eps,
      epsGrowth,
      grossMargin: latest.grossProfitRatio
        ? latest.grossProfitRatio * 100
        : undefined,
      operatingMargin: latest.operatingIncomeRatio
        ? latest.operatingIncomeRatio * 100
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching financials:", error);
    return {
      revenue: undefined,
      revenueGrowth: undefined,
      netIncome: undefined,
      netIncomeGrowth: undefined,
      eps: undefined,
      epsGrowth: undefined,
      grossMargin: undefined,
      operatingMargin: undefined,
    };
  }
}

/**
 * Fetch catalysts (earnings, dividends, events)
 */
async function fetchCatalysts(symbol: string, earnings: any) {
  const catalysts: any[] = [];

  try {
    // Fetch dividend calendar
    const dividend = await fmpClient.getDividendCalendar(symbol);

    // Add earnings as a catalyst if available
    if (earnings.nextDate) {
      catalysts.push({
        date: earnings.nextDate,
        event: "Earnings Report",
        importance: "HIGH" as const,
        description: earnings.estimate
          ? `Estimated EPS: $${earnings.estimate.toFixed(2)}`
          : earnings.nextTiming
            ? `Timing: ${earnings.nextTiming}`
            : undefined,
      });
    }

    // Add dividend as a catalyst if available
    if (dividend && dividend.date) {
      catalysts.push({
        date: dividend.date,
        event: "Ex-Dividend Date",
        importance: "MEDIUM" as const,
        description: dividend.dividend
          ? `Dividend: $${dividend.dividend.toFixed(2)}`
          : undefined,
      });
    }

    // Sort catalysts by date (closest first)
    catalysts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  } catch (error) {
    console.error("Error fetching catalysts:", error);
  }

  return catalysts;
}

/**
 * Calculate support/resistance levels using pivot points
 */
function calculateKeyLevels(quote: any) {
  if (!quote) return {};

  const high = quote.dayHigh || quote.yearHigh || quote.price;
  const low = quote.dayLow || quote.yearLow || quote.price;
  const close = quote.price;

  // Simple pivot point calculation
  const pivot = (high + low + close) / 3;
  const range = high - low;

  return {
    support1: pivot - range * 0.382, // Fibonacci level
    support2: pivot - range * 0.618,
    resistance1: pivot + range * 0.382,
    resistance2: pivot + range * 0.618,
  };
}

/**
 * Calculate risk profile metrics
 */
function calculateRiskProfile(quote: any, profile: any) {
  const high52 = quote?.fiftyTwoWeekHigh || quote?.yearHigh;
  const low52 = quote?.fiftyTwoWeekLow || quote?.yearLow;
  const price = quote?.price || 0;

  return {
    beta: profile?.beta,
    volatility: calculateVolatility(quote),
    shortInterest: profile?.shortInterest,
    distance52WeekHigh:
      high52 && price ? ((high52 - price) / high52) * 100 : undefined,
    distance52WeekLow:
      low52 && price ? ((price - low52) / low52) * 100 : undefined,
  };
}

/**
 * Calculate volatility classification
 */
function calculateVolatility(quote: any): "HIGH" | "MEDIUM" | "LOW" {
  const changePercent = Math.abs(quote?.changesPercentage || 0);

  if (changePercent > 5) return "HIGH";
  if (changePercent > 2) return "MEDIUM";
  return "LOW";
}
