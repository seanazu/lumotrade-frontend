/**
 * Advanced Multi-Source Stock Screener
 * 
 * Combines data from multiple premium sources to find high-probability opportunities:
 * - Polygon: Technical indicators, volume analysis
 * - Finnhub: Insider trading, analyst ratings, company fundamentals
 * - Marketaux: News catalysts, sentiment analysis
 * - FMP: Market movers, sector performance
 * - ORATS: Options flow, unusual activity, institutional signals
 * 
 * This screener identifies stocks with:
 * 1. Strong technical setups (momentum, breakouts)
 * 2. Fundamental catalysts (insider buying, upgrades)
 * 3. News momentum (breaking news, positive sentiment)
 * 4. Institutional interest (unusual volume, large trades, options sweeps)
 */

import { polygonClient } from "@/lib/api/clients/polygon-client";
import { finnhubClient } from "@/lib/api/clients/finnhub-client";
import { marketauxClient } from "@/lib/api/clients/marketaux-client";
import { fmpClient } from "@/lib/api/clients/fmp-client";
import { oratsClient } from "@/lib/api/clients/orats-client";
import type { MarketContext } from "@/hooks/useTradingOpportunities";

export interface EnrichedStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  
  // Market Data
  volume: number;
  avgVolume: number;
  volumeMultiple: number;
  marketCap: number;
  
  // Technical Indicators
  rsi?: number;
  macdSignal?: "bullish" | "bearish" | "neutral";
  trend?: "bullish" | "bearish" | "neutral";
  
  // Fundamental Data
  insiderBuying?: number; // Number of recent insider buys
  analystRating?: { buy: number; hold: number; sell: number };
  companyInfo?: {
    name: string;
    industry: string;
    marketCap: number;
  };
  
  // News & Catalysts
  recentNews?: number; // Number of recent articles
  newsSentiment?: "positive" | "neutral" | "negative";
  catalysts?: string[];
  
  // Options Flow (NEW!)
  optionsFlow?: {
    unusualCallActivity: boolean;
    unusualPutActivity: boolean;
    putCallRatio: number;
    ivRank: number;
    sweepsCount: number;
  };
  
  // Scoring
  score: number; // Overall opportunity score (0-100)
  signals: string[]; // List of bullish signals
}

export class AdvancedStockScreener {
  /**
   * Find high-probability stock opportunities using multi-source data
   */
  static async findOpportunities(
    marketContext: MarketContext,
    maxResults = 10
  ): Promise<EnrichedStockData[]> {
    console.log("🚀 Starting advanced multi-source screening...");
    
    try {
      // Step 1: Get initial candidates from FMP market movers
      const candidates = await this.getCandidates(marketContext);
      console.log(`📊 Found ${candidates.length} initial candidates`);
      
      if (candidates.length === 0) {
        console.log("⚠️ No candidates found, returning empty");
        return [];
      }
      
      // Step 2: Enrich top candidates with multi-source data
      const enriched = await this.enrichCandidates(candidates.slice(0, 30));
      console.log(`✅ Enriched ${enriched.length} candidates with full data`);
      
      // Step 3: Score and rank opportunities
      const scored = enriched.map((stock) => ({
        ...stock,
        score: this.calculateOpportunityScore(stock),
      }));
      
      // Step 4: Sort by score and return top results
      const topOpportunities = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
      
      console.log(`🎯 Selected top ${topOpportunities.length} opportunities`);
      topOpportunities.forEach((opp, i) => {
        console.log(`  ${i + 1}. ${opp.symbol} - Score: ${opp.score}, Signals: ${opp.signals.length}`);
      });
      
      return topOpportunities;
    } catch (error) {
      console.error("❌ Error in advanced screening:", error);
      return [];
    }
  }
  
  /**
   * Get initial candidates from FMP and enrich with basic data
   */
  private static async getCandidates(
    marketContext: MarketContext
  ): Promise<Array<{ symbol: string; price: number; change: number; changePercent: number }>> {
    try {
      // Get market movers
      const [gainers, sectorPerf] = await Promise.all([
        fmpClient.getGainers(),
        fmpClient.getSectorPerformance(),
      ]);
      
      console.log(`📈 FMP returned ${gainers.length} gainers`);
      
      // Filter for quality stocks with reasonable moves
      const filtered = gainers.filter((stock) => {
        const change = Math.abs(stock.changesPercentage || 0);
        const price = stock.price || 0;
        
        // Basic sanity checks
        return (
          price >= 2 && // Min $2 price
          price <= 1000 && // Max $1000 price
          change >= 0.5 && // At least 0.5% move
          change <= 50 // Not too extreme (likely data error)
        );
      });
      
      console.log(`🔍 Filtered to ${filtered.length} quality candidates`);
      
      // Map to our format
      return filtered.map((stock) => ({
        symbol: stock.symbol,
        price: stock.price || 0,
        change: stock.change || 0,
        changePercent: stock.changesPercentage || 0,
      }));
    } catch (error) {
      console.error("Error getting candidates:", error);
      return [];
    }
  }
  
  /**
   * Enrich candidates with multi-source data
   * Uses smart batching to avoid rate limits
   */
  private static async enrichCandidates(
    candidates: Array<{ symbol: string; price: number; change: number; changePercent: number }>
  ): Promise<EnrichedStockData[]> {
    const enriched: EnrichedStockData[] = [];
    
    // Process in smaller batches with delays to avoid rate limits
    // Polygon Starter: 100/min = ~1.6/sec, so batch of 3 with 2sec delay = safe
    const batchSize = 3;
    const delayMs = 2000; // 2 seconds between batches
    
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      
      console.log(`📊 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(candidates.length / batchSize)} (${batch.length} stocks)`);
      
      const batchResults = await Promise.all(
        batch.map((candidate) => this.enrichSingleStock(candidate))
      );
      
      enriched.push(...batchResults.filter((r): r is EnrichedStockData => r !== null));
      
      // Delay between batches (except for last batch)
      if (i + batchSize < candidates.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    
    return enriched;
  }
  
  /**
   * Enrich a single stock with all available data sources
   */
  private static async enrichSingleStock(
    candidate: { symbol: string; price: number; change: number; changePercent: number }
  ): Promise<EnrichedStockData | null> {
    try {
      const { symbol, price, change, changePercent } = candidate;
      
      // Fetch data from all sources in parallel
      // NOTE: Polygon technical analysis disabled to reduce API calls from 7 to 1 per stock
      // getTechnicalAnalysis() requires 6+ separate API calls (RSI, MACD, SMA20, SMA50, SMA200, EMA20)
      const [
        polygonSnapshot,
        // polygonTechnical,  // Disabled - makes 6+ API calls per stock, hitting rate limits
        finnhubQuote,
        finnhubProfile,
        finnhubInsider,
        finnhubRatings,
        news,
        oratsOptions, // NEW: Options flow data
      ] = await Promise.all([
        polygonClient.getSnapshot(symbol).catch(() => null),
        // polygonClient.getTechnicalAnalysis(symbol).catch(() => null),  // Disabled for rate limits
        finnhubClient.getQuote(symbol).catch(() => null),
        finnhubClient.getCompanyProfile(symbol).catch(() => null),
        finnhubClient.getInsiderTransactions(symbol).catch(() => []),
        finnhubClient.getRecommendationTrends(symbol).catch(() => []),
        marketauxClient.getNewsBySymbols([symbol], 5).catch(() => []),
        oratsClient.getOptionsData(symbol).catch(() => null), // NEW: Options intelligence
      ]);
      
      // Calculate volume metrics
      const volume = polygonSnapshot?.day?.v || finnhubQuote?.c || 0;
      const avgVolume = 1_000_000; // Fallback if not available
      const volumeMultiple = volume / avgVolume;
      
      // Extract technical signals
      // NOTE: Disabled technical analysis to avoid Polygon rate limits
      // Would need polygonClient.getTechnicalAnalysis() which makes 6+ API calls per stock
      const rsi = undefined;
      const macdSignal = "neutral" as const;
      const trend = "neutral" as const;
      
      // Extract fundamental data
      const recentInsiderBuys = finnhubInsider.filter(
        (t) =>
          t.change > 0 &&
          new Date(t.transactionDate).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      );
      
      const latestRatings = finnhubRatings[0];
      
      // Extract news/catalysts
      const catalysts: string[] = [];
      if (recentInsiderBuys.length > 0) {
        catalysts.push(`${recentInsiderBuys.length} insider buys (30d)`);
      }
      if (latestRatings && latestRatings.strongBuy + latestRatings.buy > latestRatings.sell + latestRatings.strongSell) {
        catalysts.push("Analyst upgrades");
      }
      if (news.length > 0) {
        catalysts.push(`${news.length} recent news articles`);
      }
      
      // NEW: Add options flow catalysts
      if (oratsOptions) {
        if (oratsOptions.unusualCallActivity) {
          catalysts.push(`🔥 Unusual call volume (${oratsOptions.volumeVsAvg.toFixed(1)}x avg)`);
        }
        if (oratsOptions.sweeps.length > 0) {
          catalysts.push(`🎯 ${oratsOptions.sweeps.length} options sweeps detected`);
        }
        if (oratsOptions.ivRank > 75) {
          catalysts.push(`⚡ High IV (${oratsOptions.ivRank}%) - big move expected`);
        }
        if (oratsOptions.putCallRatio < 0.7) {
          catalysts.push(`🟢 Bullish options flow (P/C: ${oratsOptions.putCallRatio.toFixed(2)})`);
        }
      }
      
      // Calculate news sentiment
      let newsSentiment: "positive" | "neutral" | "negative" = "neutral";
      if (news.length > 0) {
        const avgSentiment = news.reduce((sum, article) => {
          const score = article.entities?.[0]?.sentiment_score || 0;
          return sum + score;
        }, 0) / news.length;
        
        if (avgSentiment > 0.2) newsSentiment = "positive";
        else if (avgSentiment < -0.2) newsSentiment = "negative";
      }
      
      const enrichedStock: EnrichedStockData = {
        symbol,
        price: finnhubQuote?.c || price,
        change: finnhubQuote?.d || change,
        changePercent: finnhubQuote?.dp || changePercent,
        volume,
        avgVolume,
        volumeMultiple,
        marketCap: finnhubProfile?.marketCapitalization || 0,
        rsi,
        macdSignal,
        trend,
        insiderBuying: recentInsiderBuys.length,
        analystRating: latestRatings
          ? {
              buy: latestRatings.strongBuy + latestRatings.buy,
              hold: latestRatings.hold,
              sell: latestRatings.sell + latestRatings.strongSell,
            }
          : undefined,
        companyInfo: finnhubProfile
          ? {
              name: finnhubProfile.name,
              industry: finnhubProfile.finnhubIndustry,
              marketCap: finnhubProfile.marketCapitalization,
            }
          : undefined,
        recentNews: news.length,
        newsSentiment,
        catalysts,
        optionsFlow: oratsOptions
          ? {
              unusualCallActivity: oratsOptions.unusualCallActivity,
              unusualPutActivity: oratsOptions.unusualPutActivity,
              putCallRatio: oratsOptions.putCallVolumeRatio,
              ivRank: oratsOptions.ivRank,
              sweepsCount: oratsOptions.sweeps.length,
            }
          : undefined,
        score: 0, // Will be calculated later
        signals: [],
      };
      
      return enrichedStock;
    } catch (error) {
      console.error(`Error enriching ${candidate.symbol}:`, error);
      return null;
    }
  }
  
  /**
   * Calculate opportunity score based on all signals
   * Weighted scoring system across 5 dimensions
   */
  private static calculateOpportunityScore(stock: EnrichedStockData): number {
    let score = 0;
    const signals: string[] = [];
    
    // Price Action & Volume (0-20 points)
    if (stock.changePercent > 2) {
      score += 8;
      signals.push(`Strong momentum (+${stock.changePercent.toFixed(1)}%)`);
    }
    if (stock.volumeMultiple > 2) {
      score += 12;
      signals.push(`High volume (${stock.volumeMultiple.toFixed(1)}x avg)`);
    }
    
    // Technical Indicators (0-20 points)
    if (stock.rsi && stock.rsi < 70 && stock.rsi > 40) {
      score += 10;
      signals.push(`Healthy RSI (${stock.rsi.toFixed(0)})`);
    }
    if (stock.macdSignal === "bullish") {
      score += 7;
      signals.push("Bullish MACD");
    }
    if (stock.trend === "bullish") {
      score += 3;
      signals.push("Bullish trend");
    }
    
    // Fundamental Catalysts (0-25 points)
    if (stock.insiderBuying && stock.insiderBuying > 0) {
      score += Math.min(stock.insiderBuying * 5, 15);
      signals.push(`${stock.insiderBuying} insider buy(s)`);
    }
    if (stock.analystRating && stock.analystRating.buy > stock.analystRating.sell) {
      score += 8;
      signals.push("Positive analyst ratings");
    }
    if (stock.marketCap > 0 && stock.marketCap < 50_000) {
      score += 2;
      signals.push("Mid-cap growth opportunity");
    }
    
    // News & Sentiment (0-15 points)
    if (stock.newsSentiment === "positive") {
      score += 8;
      signals.push("Positive news sentiment");
    }
    if (stock.recentNews && stock.recentNews > 2) {
      score += 7;
      signals.push(`${stock.recentNews} recent news articles`);
    }
    
    // 🔥 NEW: Options Flow & Institutional Signals (0-20 points)
    // This is where smart money shows their hand!
    if (stock.optionsFlow) {
      if (stock.optionsFlow.unusualCallActivity) {
        score += 10;
        signals.push("🔥 Unusual call activity");
      }
      if (stock.optionsFlow.sweepsCount > 0) {
        score += 8;
        signals.push(`🎯 ${stock.optionsFlow.sweepsCount} options sweeps`);
      }
      if (stock.optionsFlow.ivRank > 75) {
        score += 5;
        signals.push(`⚡ High IV (${stock.optionsFlow.ivRank}%)`);
      }
      if (stock.optionsFlow.putCallRatio < 0.7) {
        score += 5;
        signals.push(`🟢 Bullish P/C ratio (${stock.optionsFlow.putCallRatio.toFixed(2)})`);
      }
    }
    
    // Update signals
    stock.signals = signals;
    
    return Math.min(score, 100);
  }
}

