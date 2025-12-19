import { fmpClient } from "@/lib/api/clients/fmp-client";
import { finnhubClient } from "@/lib/api/clients/finnhub-client";
import type { StockCandidate } from "@/lib/api/clients/openai-client";

/**
 * Performs deep analysis on stock candidates
 */
export class StockAnalyzer {
  /**
   * Analyze multiple candidates with full technical and fundamental data
   */
  static async analyzeCandidates(symbols: string[]): Promise<StockCandidate[]> {
    const results = await Promise.allSettled(
      symbols.map((symbol) => this.analyzeStock(symbol))
    );

    return results
      .filter(
        (result): result is PromiseFulfilledResult<StockCandidate> =>
          result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value);
  }

  /**
   * Analyze a single stock with comprehensive data
   */
  private static async analyzeStock(
    symbol: string
  ): Promise<StockCandidate | null> {
    try {
      const [quote, technicals, profile, news, unusualActivity] =
        await Promise.all([
          fmpClient.getQuote(symbol),
          fmpClient.getTechnicalIndicators(symbol, "daily"),
          fmpClient.getCompanyProfile(symbol),
          fmpClient.getStockNews(symbol, 3),
          finnhubClient.checkUnusualActivity(symbol),
        ]);

      if (!quote) return null;

      return {
        symbol,
        name: (profile as any)?.companyName || symbol,
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changesPercentage || 0,
        volume: quote.volume || 0,
        avgVolume: quote.avgVolume || 1,
        rsi: technicals?.rsi,
        macd: technicals?.macd?.macd,
        movingAverages: technicals
          ? {
              sma20: technicals.sma20 || 0,
              sma50: technicals.sma50 || 0,
              sma200: technicals.sma200 || 0,
            }
          : undefined,
        optionsFlow: {
          callVolume: 0,
          putVolume: 0,
          callPutRatio: 1.0,
          unusualActivity: unusualActivity.hasUnusualActivity,
        },
        news: news.slice(0, 2).map((article) => ({
          headline: article.title,
          sentiment: article.sentiment || "neutral",
          publishedAt: article.publishedDate,
        })),
        sector: (profile as any)?.sector || "Unknown",
      };
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);
      return null;
    }
  }
}
