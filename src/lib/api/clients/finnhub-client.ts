/**
 * Finnhub API Client
 * Market sentiment, economic calendar, and financial data
 * Documentation: https://finnhub.io/docs/api
 */

import { apiConfig, isFinnhubConfigured } from "../config";
import { fetchWithRetry, buildUrl } from "../utils/http-client";
import { rateLimiter, rateLimitConfigs } from "../utils/rate-limiter";
import { cache, cacheKeys } from "../utils/cache";

// ============================================================================
// Finnhub Types
// ============================================================================

export interface FinnhubEconomicEvent {
  actual?: number;
  estimate?: number;
  prev?: number;
  country: string;
  unit: string;
  event: string;
  impact: "low" | "medium" | "high";
  time: string; // ISO date string
}

export interface FinnhubEconomicCalendar {
  economicCalendar: FinnhubEconomicEvent[];
}

export interface FinnhubMarketNews {
  category: string;
  datetime: number; // Unix timestamp
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

// ============================================================================
// Finnhub Client
// ============================================================================

class FinnhubClient {
  private baseUrl = apiConfig.finnhub.baseUrl;
  private apiKey = apiConfig.finnhub.apiKey;

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return isFinnhubConfigured();
  }

  /**
   * Get economic calendar events
   * @param from - Start date (YYYY-MM-DD)
   * @param to - End date (YYYY-MM-DD)
   * @returns Economic calendar events
   */
  async getEconomicCalendar(
    from: string,
    to: string
  ): Promise<FinnhubEconomicEvent[]> {
    if (!this.isConfigured()) {
      console.warn("Finnhub API not configured.");
      return [];
    }

    const cacheKey = `finnhub:calendar:${from}:${to}`;
    const cached = cache.get<FinnhubEconomicEvent[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "finnhub",
      rateLimitConfigs.finnhub
    );
    if (!allowed) {
      console.warn("Finnhub rate limit exceeded.");
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/calendar/economic`, {
        from,
        to,
        token: this.apiKey,
      });

      const response = await fetchWithRetry<FinnhubEconomicCalendar>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && response.economicCalendar) {
        // Cache for 5 minutes
        cache.set(cacheKey, response.economicCalendar, 300);
        return response.economicCalendar;
      }

      return [];
    } catch (error) {
      console.error("Error fetching Finnhub economic calendar:", error);
      return [];
    }
  }

  /**
   * Get market news
   * @param category - News category (general, forex, crypto, merger)
   * @param minId - Minimum news ID for pagination
   * @returns Market news articles
   */
  async getMarketNews(
    category: string = "general",
    minId?: number
  ): Promise<FinnhubMarketNews[]> {
    if (!this.isConfigured()) {
      console.warn("Finnhub API not configured.");
      return [];
    }

    const cacheKey = `finnhub:news:${category}:${minId || "latest"}`;
    const cached = cache.get<FinnhubMarketNews[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "finnhub",
      rateLimitConfigs.finnhub
    );
    if (!allowed) {
      console.warn("Finnhub rate limit exceeded for news.");
      return cached || [];
    }

    try {
      const params: Record<string, string> = {
        category,
        token: this.apiKey,
      };
      if (minId) {
        params.minId = minId.toString();
      }

      const url = buildUrl(`${this.baseUrl}/news`, params);

      const response = await fetchWithRetry<FinnhubMarketNews[]>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        // Cache news for 10 minutes
        cache.set(cacheKey, response, 600);
        return response;
      }

      return [];
    } catch (error) {
      console.error("Error fetching Finnhub market news:", error);
      return [];
    }
  }

  /**
   * Get real-time quote for a symbol
   * @param symbol - Stock symbol
   * @returns Quote data
   */
  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    if (!this.isConfigured()) {
      console.warn("Finnhub API not configured.");
      return null;
    }

    const cacheKey = `finnhub:quote:${symbol}`;
    const cached = cache.get<FinnhubQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "finnhub",
      rateLimitConfigs.finnhub
    );
    if (!allowed) {
      console.warn("Finnhub rate limit exceeded for quote.");
      return cached;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/quote`, {
        symbol,
        token: this.apiKey,
      });

      const response = await fetchWithRetry<FinnhubQuote>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response) {
        // Cache quote for 30 seconds
        cache.set(cacheKey, response, 30);
        return response;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Finnhub quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get company profile
   * @param symbol - Stock symbol
   * @returns Company profile data
   */
  async getCompanyProfile(
    symbol: string
  ): Promise<FinnhubCompanyProfile | null> {
    if (!this.isConfigured()) {
      console.warn("Finnhub API not configured.");
      return null;
    }

    const cacheKey = `finnhub:profile:${symbol}`;
    const cached = cache.get<FinnhubCompanyProfile>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "finnhub",
      rateLimitConfigs.finnhub
    );
    if (!allowed) {
      console.warn("Finnhub rate limit exceeded for company profile.");
      return cached;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/stock/profile2`, {
        symbol,
        token: this.apiKey,
      });

      const response = await fetchWithRetry<FinnhubCompanyProfile>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response) {
        // Cache profile for 1 hour (doesn't change often)
        cache.set(cacheKey, response, 3600);
        return response;
      }

      return null;
    } catch (error) {
      console.error(
        `Error fetching Finnhub company profile for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get market sentiment indicators
   * Note: Finnhub doesn't have a direct "fear & greed" endpoint,
   * but we can derive sentiment from news sentiment and market metrics
   */
  async getMarketSentiment(): Promise<{
    score: number; // 0-100 scale
    label: "fear" | "neutral" | "greed";
  }> {
    // This would typically involve aggregating multiple data points:
    // - VIX levels
    // - News sentiment
    // - Put/call ratios
    // For now, return a placeholder that will be implemented in the metrics API
    return {
      score: 50,
      label: "neutral",
    };
  }

  /**
   * Get insider transactions for a symbol
   * @param symbol - Stock symbol
   * @returns Insider transaction data
   */
  async getInsiderTransactions(symbol: string): Promise<
    Array<{
      name: string;
      share: number;
      change: number;
      filingDate: string;
      transactionDate: string;
      transactionCode: string;
    }>
  > {
    if (!this.isConfigured()) {
      return [];
    }

    const cacheKey = `finnhub:insider:${symbol}`;
    const cached = cache.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "finnhub",
      rateLimitConfigs.finnhub
    );
    if (!allowed) {
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/stock/insider-transactions`, {
        symbol,
        token: this.apiKey,
      });

      const response = await fetchWithRetry<{ data: any[] }>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && response.data) {
        // Cache for 1 hour
        cache.set(cacheKey, response.data, 3600);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error(
        `Error fetching insider transactions for ${symbol}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get recommendation trends for a symbol (analyst ratings)
   * @param symbol - Stock symbol
   * @returns Analyst recommendation trends
   */
  async getRecommendationTrends(symbol: string): Promise<
    Array<{
      buy: number;
      hold: number;
      sell: number;
      strongBuy: number;
      strongSell: number;
      period: string;
    }>
  > {
    if (!this.isConfigured()) {
      return [];
    }

    const cacheKey = `finnhub:recommendations:${symbol}`;
    const cached = cache.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "finnhub",
      rateLimitConfigs.finnhub
    );
    if (!allowed) {
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/stock/recommendation`, {
        symbol,
        token: this.apiKey,
      });

      const response = await fetchWithRetry<any[]>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        // Cache for 24 hours
        cache.set(cacheKey, response, 86400);
        return response;
      }

      return [];
    } catch (error) {
      console.error(
        `Error fetching recommendation trends for ${symbol}:`,
        error
      );
      return [];
    }
  }

  /**
   * Check for unusual options activity indicators
   * Note: This uses available data to infer unusual activity
   */
  async checkUnusualActivity(symbol: string): Promise<{
    hasUnusualActivity: boolean;
    confidence: number;
    indicators: string[];
  }> {
    // This would typically check:
    // - Volume spikes
    // - Large block trades
    // - Unusual call/put ratio
    // For now, we'll use news and insider data as proxies

    try {
      const [news, insider] = await Promise.all([
        this.getMarketNews("general"),
        this.getInsiderTransactions(symbol),
      ]);

      const indicators: string[] = [];
      let confidence = 0;

      // Check for recent insider buying (bullish signal)
      const recentInsiderBuys = insider.filter(
        (t) =>
          t.change > 0 &&
          new Date(t.transactionDate).getTime() >
            Date.now() - 30 * 24 * 60 * 60 * 1000
      );

      if (recentInsiderBuys.length > 0) {
        indicators.push(
          `${recentInsiderBuys.length} insider buys in last 30 days`
        );
        confidence += 30;
      }

      // Check for relevant news
      const symbolNews = news.filter((n) => n.related === symbol);
      if (symbolNews.length > 0) {
        indicators.push(`${symbolNews.length} recent news articles`);
        confidence += 20;
      }

      return {
        hasUnusualActivity: indicators.length > 0,
        confidence: Math.min(confidence, 100),
        indicators,
      };
    } catch (error) {
      console.error(`Error checking unusual activity for ${symbol}:`, error);
      return {
        hasUnusualActivity: false,
        confidence: 0,
        indicators: [],
      };
    }
  }
}

// Singleton instance
export const finnhubClient = new FinnhubClient();

// Also export the class for type access
export { FinnhubClient };
