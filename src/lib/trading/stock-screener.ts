import { fmpClient } from "@/lib/api/clients/fmp-client";
import type { MarketContext } from "@/hooks/useTradingOpportunities";

interface ScreeningCriteria {
  minPrice: number;
  maxPrice: number;
  minVolume: number;
  minVolumeMultiple: number;
  minChange: number;
  maxChange: number;
  minMarketCap?: number;
  maxMarketCap?: number;
}

const DEFAULT_CRITERIA: ScreeningCriteria = {
  minPrice: 5, // Lower to catch more growth stocks
  maxPrice: 200, // Cap at $200 to avoid mega-caps
  minVolume: 500_000, // Lower threshold for mid-caps
  minVolumeMultiple: 1.5, // Higher multiple = more momentum
  minChange: 1, // Lower to catch early movers
  maxChange: 20, // Allow bigger moves for momentum plays
  minMarketCap: 1_000_000_000, // $1B minimum (avoid penny stocks)
  maxMarketCap: 50_000_000_000, // $50B maximum (focus on growth)
};

// Growth stocks with breakout potential (similar to PLTR, SOFI, RKLB)
const GROWTH_WATCHLIST = [
  // Space & Aerospace
  "RKLB",
  "SPCE",
  "ASTS",
  // Fintech & Banking
  "SOFI",
  "UPST",
  "AFRM",
  "NU",
  // AI & Software
  "PLTR",
  "SNOW",
  "DDOG",
  "NET",
  "CRWD",
  // EV & Clean Energy
  "RIVN",
  "LCID",
  "ENPH",
  // Semiconductors
  "ARM",
  "SMCI",
  "MRVL",
  // Others
  "HOOD",
  "COIN",
  "RBLX",
];

/**
 * Screens stocks for trading opportunities based on volume, momentum, and quality
 * Focuses on growth stocks with breakout potential, not just mega-caps
 */
export class StockScreener {
  /**
   * Screen for high-potential stock candidates
   * Looks for the next PLTR, SOFI, RKLB - growth stocks before they explode
   */
  static async screenCandidates(
    marketContext: MarketContext,
    maxResults = 20
  ): Promise<string[]> {
    try {
      // Get both gainers and our curated growth watchlist
      const [gainers, sectorPerformance] = await Promise.all([
        fmpClient.getGainers(),
        fmpClient.getSectorPerformance(),
      ]);

      // Filter for quality momentum plays
      const momentumStocks = this.filterStocks(gainers, DEFAULT_CRITERIA);

      // Prioritize growth watchlist (these are high-potential plays)
      const combined = this.combineWithGrowthFocus(momentumStocks);

      return combined.slice(0, maxResults);
    } catch (error) {
      console.error("Error screening candidates:", error);
      return this.getFallbackStocks();
    }
  }

  /**
   * Filter stocks based on quality criteria
   * Focus on growth momentum with quality filters
   */
  private static filterStocks(stocks: any[], criteria: ScreeningCriteria) {
    return stocks
      .filter((stock) => {
        const price = stock.price || 0;
        const volume = stock.volume || 0;
        const avgVolume = stock.avgVolume || 1;
        const change = Math.abs(stock.changesPercentage || 0);
        const marketCap = stock.marketCap || 0;

        return (
          // Price range: avoid penny stocks, allow growth stocks
          price >= criteria.minPrice &&
          price <= criteria.maxPrice &&
          // Volume: needs liquidity but not requiring mega volume
          volume > criteria.minVolume &&
          volume / avgVolume >= criteria.minVolumeMultiple &&
          // Momentum: catching moves early
          change >= criteria.minChange &&
          change <= criteria.maxChange &&
          // Market cap: $1B-$50B sweet spot for growth
          (criteria.minMarketCap ? marketCap >= criteria.minMarketCap : true) &&
          (criteria.maxMarketCap ? marketCap <= criteria.maxMarketCap : true)
        );
      })
      .slice(0, 30)
      .map((stock) => stock.symbol);
  }

  /**
   * Combine with growth focus - prioritize high-potential stocks
   * Put growth watchlist FIRST, then add momentum stocks
   */
  private static combineWithGrowthFocus(momentumStocks: string[]): string[] {
    // Prioritize growth watchlist (these are curated high-potential plays)
    // Then add momentum stocks that passed our filters
    return [...new Set([...GROWTH_WATCHLIST, ...momentumStocks])];
  }

  /**
   * Fallback stocks if screening fails
   * Return growth stocks, not mega-caps
   */
  private static getFallbackStocks(): string[] {
    return GROWTH_WATCHLIST.slice(0, 10);
  }
}
