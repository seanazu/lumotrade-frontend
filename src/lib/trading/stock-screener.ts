import { fmpClient } from "@/lib/api/clients/fmp-client";
import { openaiClient } from "@/lib/api/clients/openai-client";
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

/**
 * Dynamic screening criteria based on market regime
 */
function getCriteriaForRegime(marketContext: MarketContext): ScreeningCriteria {
  const baseMinMarketCap = 200_000_000; // $200M minimum (much lower)
  const baseMaxMarketCap = 100_000_000_000; // $100B maximum

  switch (marketContext.regime) {
    case "breakout_trending":
      // Trending market - look for momentum plays
      return {
        minPrice: 5,
        maxPrice: 500,
        minVolume: 500_000,
        minVolumeMultiple: 1.5, // Good momentum
        minChange: 2, // Bigger moves
        maxChange: 30,
        minMarketCap: baseMinMarketCap,
        maxMarketCap: baseMaxMarketCap,
      };

    case "high_volatility":
      // Volatile market - look for quality with unusual activity
      return {
        minPrice: 5,
        maxPrice: 300,
        minVolume: 600_000,
        minVolumeMultiple: 1.5, // Reasonable volume increase
        minChange: 2,
        maxChange: 30,
        minMarketCap: 500_000_000, // Slightly higher quality
        maxMarketCap: baseMaxMarketCap,
      };

    case "risk_off":
      // Risk-off - look for defensive growth with value
      return {
        minPrice: 5,
        maxPrice: 300,
        minVolume: 500_000,
        minVolumeMultiple: 1.3,
        minChange: 0.5,
        maxChange: 15,
        minMarketCap: 1_000_000_000, // Higher quality
        maxMarketCap: baseMaxMarketCap,
      };

    default: // range_bound
      // Range-bound - cast wider net for breakout potential
      return {
        minPrice: 3,
        maxPrice: 500,
        minVolume: 300_000, // Much lower
        minVolumeMultiple: 1.2, // Very lenient
        minChange: 0.5, // Accept small moves
        maxChange: 30,
        minMarketCap: 100_000_000, // $100M minimum
        maxMarketCap: baseMaxMarketCap,
      };
  }
}

/**
 * AI-powered stock screener - finds opportunities dynamically using real-time data
 * NO HARDCODED STOCK LISTS - discovers opportunities from market data
 */
export class StockScreener {
  /**
   * Screen for high-potential stock candidates using AI and real-time market data
   * 
   * Process:
   * 1. Get top gainers/losers/actives from FMP (real-time movers)
   * 2. Get sector performance to identify hot sectors
   * 3. Filter by quality criteria (volume, price, market cap)
   * 4. Use AI to search web for trending stocks and catalysts
   * 5. Combine and rank by potential
   */
  static async screenCandidates(
    marketContext: MarketContext,
    maxResults = 25
  ): Promise<string[]> {
    try {
      console.log("🔍 Screening market for opportunities...");
      
      // Get dynamic criteria based on current market regime
      const criteria = getCriteriaForRegime(marketContext);
      
      // Fetch multiple data sources in parallel
      const [
        gainers,
        sectorPerformance,
        aiDiscoveredStocks,
      ] = await Promise.all([
        fmpClient.getGainers(),
        fmpClient.getSectorPerformance(),
        this.discoverTrendingStocksWithAI(marketContext), // AI web search
      ]);

      console.log(`📊 Found ${gainers.length} gainers`);
      console.log(`🤖 AI discovered ${aiDiscoveredStocks.length} trending stocks`);

      // Get top sectors for sector rotation plays
      const topSectors = this.getTopSectors(sectorPerformance);
      console.log(`🎯 Hot sectors: ${topSectors.join(", ")}`);

      // Filter all candidates by quality criteria
      const qualityGainers = this.filterStocks(gainers, criteria);

      // Combine sources with intelligent prioritization
      const combined = this.intelligentCombine({
        aiDiscovered: aiDiscoveredStocks,
        qualityGainers,
        topSectors,
        marketContext,
      });

      console.log(`✅ Screened down to ${combined.length} final candidates`);
      
      return combined.slice(0, maxResults);
    } catch (error) {
      console.error("Error screening candidates:", error);
      // Fallback to actives if AI fails
      return this.getFallbackStocks();
    }
  }

  /**
   * Use AI with web search to discover trending stocks and catalysts
   * This is the KEY innovation - let AI find opportunities, don't hardcode them
   */
  private static async discoverTrendingStocksWithAI(
    marketContext: MarketContext
  ): Promise<string[]> {
    try {
      console.log("🌐 Using AI to search web for trending stocks...");
      
      // Use OpenAI with web search to find hot stocks RIGHT NOW
      const symbols = await openaiClient.discoverTrendingStocks(marketContext);
      
      console.log(`🎯 AI found trending: ${symbols.join(", ")}`);
      return symbols;
    } catch (error) {
      console.error("Error discovering stocks with AI:", error);
      return [];
    }
  }

  /**
   * Filter stocks based on quality criteria
   */
  private static filterStocks(
    stocks: any[],
    criteria: ScreeningCriteria
  ): string[] {
    console.log(`🔍 Filtering with criteria:`, JSON.stringify(criteria, null, 2));
    
    const filtered = stocks.filter((stock) => {
      const price = stock.price || 0;
      const volume = stock.volume || 0;
      const avgVolume = stock.avgVolume || 1;
      const change = Math.abs(stock.changesPercentage || 0);
      const marketCap = stock.marketCap || 0;

      const passesPrice = price >= criteria.minPrice && price <= criteria.maxPrice;
      const passesVolume = volume > criteria.minVolume;
      const passesVolumeMultiple = volume / avgVolume >= criteria.minVolumeMultiple;
      const passesChange = change >= criteria.minChange && change <= criteria.maxChange;
      const passesMinMC = criteria.minMarketCap ? marketCap >= criteria.minMarketCap : true;
      const passesMaxMC = criteria.maxMarketCap ? marketCap <= criteria.maxMarketCap : true;

      const passes = passesPrice && passesVolume && passesVolumeMultiple && 
                     passesChange && passesMinMC && passesMaxMC;

      if (!passes && stocks.indexOf(stock) < 3) {
        // Log first 3 rejections with actual values for debugging
        console.log(`❌ ${stock.symbol}: price=$${price} (${passesPrice}), vol=${volume.toLocaleString()} (${passesVolume}), volMult=${(volume/avgVolume).toFixed(2)}x (${passesVolumeMultiple}), change=${change.toFixed(2)}% (${passesChange}), MC=$${(marketCap/1e9).toFixed(2)}B (${passesMinMC && passesMaxMC})`);
      }

      return passes;
    });

    console.log(`🔍 Filtered ${stocks.length} stocks down to ${filtered.length}`);
    return filtered.map((stock) => stock.symbol);
  }

  /**
   * Intelligently combine multiple sources
   * Priority: AI discoveries > Quality gainers
   */
  private static intelligentCombine(params: {
    aiDiscovered: string[];
    qualityGainers: string[];
    topSectors: string[];
    marketContext: MarketContext;
  }): string[] {
    const {
      aiDiscovered,
      qualityGainers,
    } = params;

    // Build a prioritized list
    const prioritized: string[] = [];

    // 1. AI-discovered stocks (highest priority - these are trending NOW)
    prioritized.push(...aiDiscovered);

    // 2. Quality gainers with momentum
    prioritized.push(...qualityGainers.slice(0, 20));

    // Remove duplicates while preserving order (priority)
    return [...new Set(prioritized)];
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
   * Fallback stocks if everything fails
   * Use market-wide leaders as backup
   */
  private static async getFallbackStocks(): Promise<string[]> {
    try {
      const gainers = await fmpClient.getGainers();
      return gainers.slice(0, 15).map((s: any) => s.symbol);
    } catch {
      // Last resort - return empty to force AI analysis on whatever data we have
      return [];
    }
  }
}
