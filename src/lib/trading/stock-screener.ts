import { fmpClient } from "@/lib/api/clients/fmp-client";
import type { MarketContext } from "@/hooks/useTradingOpportunities";

interface ScreeningCriteria {
  minPrice: number;
  maxPrice: number;
  minVolume: number;
  minVolumeMultiple: number;
  minChange: number;
  maxChange: number;
}

const DEFAULT_CRITERIA: ScreeningCriteria = {
  minPrice: 10,
  maxPrice: 500,
  minVolume: 1_000_000,
  minVolumeMultiple: 1.2,
  minChange: 2,
  maxChange: 15,
};

const BLUE_CHIP_WATCHLIST = [
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "TSLA",
  "AMD",
  "META",
];

/**
 * Screens stocks for trading opportunities based on volume, momentum, and quality
 */
export class StockScreener {
  /**
   * Screen for quality stock candidates
   */
  static async screenCandidates(
    marketContext: MarketContext,
    maxResults = 15
  ): Promise<string[]> {
    try {
      const [gainers, sectorPerformance] = await Promise.all([
        fmpClient.getGainers(),
        fmpClient.getSectorPerformance(),
      ]);

      const filteredStocks = this.filterStocks(gainers, DEFAULT_CRITERIA);
      const combined = this.combineWithWatchlist(filteredStocks);

      return combined.slice(0, maxResults);
    } catch (error) {
      console.error("Error screening candidates:", error);
      return this.getFallbackStocks();
    }
  }

  /**
   * Filter stocks based on quality criteria
   */
  private static filterStocks(stocks: any[], criteria: ScreeningCriteria) {
    return stocks
      .filter((stock) => {
        const price = stock.price || 0;
        const volume = stock.volume || 0;
        const avgVolume = stock.avgVolume || 1;
        const change = Math.abs(stock.changesPercentage || 0);

        return (
          price >= criteria.minPrice &&
          price <= criteria.maxPrice &&
          volume > criteria.minVolume &&
          volume / avgVolume >= criteria.minVolumeMultiple &&
          change >= criteria.minChange &&
          change <= criteria.maxChange
        );
      })
      .slice(0, 20)
      .map((stock) => stock.symbol);
  }

  /**
   * Combine screened stocks with blue chip watchlist
   */
  private static combineWithWatchlist(symbols: string[]): string[] {
    return [...new Set([...symbols, ...BLUE_CHIP_WATCHLIST])];
  }

  /**
   * Fallback stocks if screening fails
   */
  private static getFallbackStocks(): string[] {
    return [...BLUE_CHIP_WATCHLIST, "SPY", "QQQ"];
  }
}
