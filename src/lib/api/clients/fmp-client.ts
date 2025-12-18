/**
 * Financial Modeling Prep (FMP) API Client
 * Financial statements, ratios, and advanced market data
 * Documentation: https://site.financialmodelingprep.com/developer/docs
 */

import { apiConfig, isFMPConfigured } from "../config";
import { FMPIntradayBar, FMPQuote, FMPNewsArticle } from "../types";
import { fetchWithRetry, buildUrl } from "../utils/http-client";
import { rateLimiter, rateLimitConfigs } from "../utils/rate-limiter";
import { cache, cacheKeys } from "../utils/cache";

class FMPClient {
  private baseUrl = apiConfig.fmp.baseUrl;
  private apiKey = apiConfig.fmp.apiKey;

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return isFMPConfigured();
  }

  /**
   * Get real-time quote for a symbol
   * @param symbol - Stock symbol
   * @returns Quote data
   */
  async getQuote(symbol: string): Promise<FMPQuote | null> {
    if (!this.isConfigured()) {
      console.warn("FMP API not configured.");
      return null;
    }

    // Check cache first
    const cacheKey = cacheKeys.stockQuote(symbol);
    const cached = cache.get<FMPQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limit
    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded. Using cached data.");
      return cached;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/quote/${symbol}`, {
        apikey: this.apiKey,
      });

      const response = await fetchWithRetry<FMPQuote[]>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && response.length > 0) {
        const quote = response[0];
        // Cache for 30 seconds
        cache.set(cacheKey, quote, 30);
        return quote;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching FMP quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get quotes for multiple symbols
   * @param symbols - Array of stock symbols
   * @returns Map of symbol to quote
   */
  async getQuotes(symbols: string[]): Promise<Map<string, FMPQuote>> {
    if (!this.isConfigured()) {
      return new Map();
    }

    // Check rate limit
    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded.");
      return new Map();
    }

    try {
      const symbolsParam = symbols.join(",");
      const url = buildUrl(`${this.baseUrl}/quote/${symbolsParam}`, {
        apikey: this.apiKey,
      });

      const response = await fetchWithRetry<FMPQuote[]>(url, {
        timeout: 8000,
        retries: 2,
      });

      const results = new Map<string, FMPQuote>();

      if (response && Array.isArray(response)) {
        response.forEach((quote) => {
          results.set(quote.symbol, quote);
          // Cache each quote
          const cacheKey = cacheKeys.stockQuote(quote.symbol);
          cache.set(cacheKey, quote, 30);
        });
      }

      return results;
    } catch (error) {
      console.error("Error fetching FMP quotes:", error);
      return new Map();
    }
  }

  /**
   * Get company profile
   * @param symbol - Stock symbol
   * @returns Company profile data
   */
  async getCompanyProfile(symbol: string): Promise<unknown | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/profile/${symbol}`, {
        apikey: this.apiKey,
      });

      const response = await fetchWithRetry<unknown[]>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && Array.isArray(response) && response.length > 0) {
        return response[0];
      }

      return null;
    } catch (error) {
      console.error(`Error fetching company profile for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get intraday chart data for a symbol
   * @param symbol - Index or stock symbol (e.g. ^GSPC)
   * @param interval - Chart interval (1min, 5min, 15min, etc.)
   * @param limit - Number of records to fetch
   */
  async getIntradayChart(
    symbol: string,
    interval: "1min" | "5min" | "15min" | "30min" | "1hour" = "1min",
    limit = 1300
  ): Promise<FMPIntradayBar[]> {
    if (!this.isConfigured()) {
      console.warn("FMP API not configured.");
      return [];
    }

    const cacheKey = cacheKeys.indexIntraday(symbol, interval);
    const cached = cache.get<FMPIntradayBar[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded for intraday chart.");
      return cached || [];
    }

    try {
      const encodedSymbol = encodeURIComponent(symbol);
      const url = buildUrl(
        `${this.baseUrl}/historical-chart/${interval}/${encodedSymbol}`,
        {
          apikey: this.apiKey,
          limit: limit.toString(),
          serietype: "all",
        }
      );

      const response = await fetchWithRetry<FMPIntradayBar[]>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        // Cache intraday chart briefly (10 seconds) to avoid hitting limits
        cache.set(cacheKey, response, 10);
        return response;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching FMP intraday chart for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get general stock market news
   * @param limit - Number of articles to fetch
   * @returns Array of news articles
   */
  async getGeneralNews(limit = 20): Promise<FMPNewsArticle[]> {
    if (!this.isConfigured()) {
      console.warn("FMP API not configured.");
      return [];
    }

    const cacheKey = `fmp:news:general:${limit}`;
    const cached = cache.get<FMPNewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded for news.");
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/fmp/articles`, {
        apikey: this.apiKey,
        page: "0",
        size: limit.toString(),
      });

      const response = await fetchWithRetry<{ content: FMPNewsArticle[] }>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && response.content && Array.isArray(response.content)) {
        // Cache news for 5 minutes
        cache.set(cacheKey, response.content, 300);
        return response.content;
      }

      return [];
    } catch (error) {
      console.error("Error fetching FMP general news:", error);
      return [];
    }
  }

  /**
   * Get stock-specific news
   * @param symbols - Stock symbols (comma-separated or array)
   * @param limit - Number of articles to fetch
   * @returns Array of news articles
   */
  async getStockNews(symbols: string | string[], limit = 20): Promise<FMPNewsArticle[]> {
    if (!this.isConfigured()) {
      console.warn("FMP API not configured.");
      return [];
    }

    const symbolsStr = Array.isArray(symbols) ? symbols.join(",") : symbols;
    const cacheKey = `fmp:news:stocks:${symbolsStr}:${limit}`;
    const cached = cache.get<FMPNewsArticle[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded for stock news.");
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/stock_news`, {
        apikey: this.apiKey,
        tickers: symbolsStr,
        limit: limit.toString(),
      });

      const response = await fetchWithRetry<FMPNewsArticle[]>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        // Cache news for 5 minutes
        cache.set(cacheKey, response, 300);
        return response;
      }

      return [];
    } catch (error) {
      console.error("Error fetching FMP stock news:", error);
      return [];
    }
  }

  /**
   * Map FMP sentiment to our sentiment type
   */
  static mapSentiment(sentiment: string): "bullish" | "bearish" | "neutral" {
    const lower = sentiment?.toLowerCase() || "";
    if (lower.includes("positive") || lower.includes("bullish")) return "bullish";
    if (lower.includes("negative") || lower.includes("bearish")) return "bearish";
    return "neutral";
  }

  /**
   * Map article to importance level based on content
   * Prioritizes macro/market-moving news over company-specific news
   */
  static mapImportance(article: FMPNewsArticle): "high" | "medium" | "low" {
    const title = article.title?.toLowerCase() || "";
    const text = (article.text || article.content || "").toLowerCase();
    const combined = `${title} ${text}`;

    // High priority: Major market-moving events
    const highPriorityKeywords = [
      "breaking", "urgent", "just in", "fed ", "fomc", "powell",
      "rate cut", "rate hike", "interest rate",
      "gdp", "inflation", "cpi", "ppi", "jobs report", "nonfarm",
      "unemployment", "recession", "economic data",
      "market crash", "market rally", "circuit breaker",
      "treasury yield", "yield curve", "inversion",
    ];

    // Medium priority: Broader market context
    const mediumPriorityKeywords = [
      "s&p 500", "dow jones", "nasdaq", "russell",
      "wall street", "stock market", "trading day",
      "sector", "earnings season", "volatility", "vix",
      "oil prices", "crude", "commodity", "gold",
      "dollar", "currency", "global markets",
    ];

    if (highPriorityKeywords.some((kw) => title.includes(kw))) return "high";
    if (highPriorityKeywords.some((kw) => combined.includes(kw))) return "high";
    if (mediumPriorityKeywords.some((kw) => title.includes(kw))) return "medium";
    if (mediumPriorityKeywords.some((kw) => combined.includes(kw))) return "medium";
    
    return "low";
  }
}

// Singleton instance
export const fmpClient = new FMPClient();

// Also export the class for static method access
export { FMPClient };
