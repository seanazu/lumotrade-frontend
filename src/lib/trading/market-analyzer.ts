import { fmpClient } from "@/lib/api/clients/fmp-client";
import type { MarketContext } from "@/hooks/useTradingOpportunities";

interface MarketData {
  spyQuote: any;
  vixQuote: any;
  sectorPerformance: Array<{ sector: string; changesPercentage: string }>;
}

/**
 * Analyzes current market conditions and determines regime & sentiment
 */
export class MarketAnalyzer {
  /**
   * Get comprehensive market context
   */
  static async getMarketContext(): Promise<MarketContext> {
    try {
      const marketData = await this.fetchMarketData();
      return this.analyzeMarket(marketData);
    } catch (error) {
      console.error("Error getting market context:", error);
      return this.getDefaultContext();
    }
  }

  /**
   * Fetch all required market data in parallel
   */
  private static async fetchMarketData(): Promise<MarketData> {
    const [spyQuote, vixQuote, sectorPerformance] = await Promise.all([
      fmpClient.getQuote("SPY"),
      fmpClient.getQuote("^VIX"),
      fmpClient.getSectorPerformance(),
    ]);

    return { spyQuote, vixQuote, sectorPerformance };
  }

  /**
   * Analyze market data and classify regime/sentiment
   */
  private static analyzeMarket(data: MarketData): MarketContext {
    const spyChange = data.spyQuote?.changesPercentage || 0;
    const vixLevel = data.vixQuote?.price || 15;

    return {
      regime: this.classifyRegime(spyChange, vixLevel),
      sentiment: this.classifySentiment(spyChange, vixLevel),
      vixLevel,
      spyPerformance: spyChange,
      topSectors: this.getTopSectors(data.sectorPerformance),
    };
  }

  /**
   * Classify market regime based on price action and volatility
   */
  private static classifyRegime(
    spyChange: number,
    vixLevel: number
  ): MarketContext["regime"] {
    if (Math.abs(spyChange) > 1.5 && vixLevel < 20) {
      return spyChange > 0 ? "breakout_trending" : "risk_off";
    }
    if (vixLevel > 25) {
      return "high_volatility";
    }
    return "range_bound";
  }

  /**
   * Classify market sentiment
   */
  private static classifySentiment(
    spyChange: number,
    vixLevel: number
  ): MarketContext["sentiment"] {
    if (spyChange > 0.5 && vixLevel < 18) return "bullish";
    if (spyChange < -0.5 || vixLevel > 22) return "bearish";
    return "neutral";
  }

  /**
   * Get top performing sectors
   */
  private static getTopSectors(
    sectorPerformance: Array<{ sector: string; changesPercentage: string }>
  ): string[] {
    return sectorPerformance
      .sort(
        (a, b) =>
          parseFloat(b.changesPercentage) - parseFloat(a.changesPercentage)
      )
      .slice(0, 3)
      .map((s) => s.sector);
  }

  /**
   * Default fallback context
   */
  private static getDefaultContext(): MarketContext {
    return {
      regime: "range_bound",
      sentiment: "neutral",
      vixLevel: 15,
      spyPerformance: 0,
      topSectors: ["Technology", "Healthcare", "Financials"],
    };
  }
}
