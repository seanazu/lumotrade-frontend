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

      const response = await fetchWithRetry<{ content: FMPNewsArticle[] }>(
        url,
        {
          timeout: 8000,
          retries: 2,
        }
      );

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
  async getStockNews(
    symbols: string | string[],
    limit = 20
  ): Promise<FMPNewsArticle[]> {
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
    if (lower.includes("positive") || lower.includes("bullish"))
      return "bullish";
    if (lower.includes("negative") || lower.includes("bearish"))
      return "bearish";
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
      "breaking",
      "urgent",
      "just in",
      "fed ",
      "fomc",
      "powell",
      "rate cut",
      "rate hike",
      "interest rate",
      "gdp",
      "inflation",
      "cpi",
      "ppi",
      "jobs report",
      "nonfarm",
      "unemployment",
      "recession",
      "economic data",
      "market crash",
      "market rally",
      "circuit breaker",
      "treasury yield",
      "yield curve",
      "inversion",
    ];

    // Medium priority: Broader market context
    const mediumPriorityKeywords = [
      "s&p 500",
      "dow jones",
      "nasdaq",
      "russell",
      "wall street",
      "stock market",
      "trading day",
      "sector",
      "earnings season",
      "volatility",
      "vix",
      "oil prices",
      "crude",
      "commodity",
      "gold",
      "dollar",
      "currency",
      "global markets",
    ];

    if (highPriorityKeywords.some((kw) => title.includes(kw))) return "high";
    if (highPriorityKeywords.some((kw) => combined.includes(kw))) return "high";
    if (mediumPriorityKeywords.some((kw) => title.includes(kw)))
      return "medium";
    if (mediumPriorityKeywords.some((kw) => combined.includes(kw)))
      return "medium";

    return "low";
  }

  /**
   * Get technical indicators for a symbol
   * @param symbol - Stock symbol
   * @param interval - Time interval (daily, 1min, 5min, etc.)
   * @returns Technical indicator data
   */
  async getTechnicalIndicators(
    symbol: string,
    interval: "daily" | "1min" | "5min" | "15min" | "30min" | "1hour" = "daily"
  ): Promise<{
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number };
    sma20?: number;
    sma50?: number;
    sma200?: number;
    ema20?: number;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      // Fetch multiple indicators in parallel
      const [rsiData, macdData, sma20Data, sma50Data, sma200Data, ema20Data] =
        await Promise.all([
          this.fetchIndicator(symbol, "rsi", interval, 14),
          this.fetchIndicator(symbol, "macd", interval, 12, 26, 9),
          this.fetchIndicator(symbol, "sma", interval, 20),
          this.fetchIndicator(symbol, "sma", interval, 50),
          this.fetchIndicator(symbol, "sma", interval, 200),
          this.fetchIndicator(symbol, "ema", interval, 20),
        ]);

      return {
        rsi: rsiData?.[0]?.rsi,
        macd: macdData?.[0]
          ? {
              macd: macdData[0].macd,
              signal: macdData[0].signal,
              histogram: macdData[0].histogram,
            }
          : undefined,
        sma20: sma20Data?.[0]?.sma,
        sma50: sma50Data?.[0]?.sma,
        sma200: sma200Data?.[0]?.sma,
        ema20: ema20Data?.[0]?.ema,
      };
    } catch (error) {
      console.error(
        `Error fetching technical indicators for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Internal method to fetch a specific technical indicator
   */
  private async fetchIndicator(
    symbol: string,
    indicator: string,
    interval: string,
    ...periods: number[]
  ): Promise<any[] | null> {
    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded for technical indicator.");
      return null;
    }

    try {
      const params: Record<string, string> = {
        apikey: this.apiKey,
        period: interval,
      };

      // Add period parameters based on indicator
      if (periods.length > 0) {
        if (indicator === "macd") {
          params.fastPeriod = periods[0]?.toString() || "12";
          params.slowPeriod = periods[1]?.toString() || "26";
          params.signalPeriod = periods[2]?.toString() || "9";
        } else {
          params.period = periods[0]?.toString() || "14";
        }
      }

      const url = buildUrl(
        `${this.baseUrl}/technical_indicator/${interval}/${symbol}`,
        params
      );

      const response = await fetchWithRetry<any[]>(url, {
        timeout: 5000,
        retries: 1,
      });

      return response || null;
    } catch (error) {
      console.error(`Error fetching ${indicator} for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Screen stocks based on criteria (momentum, volume, breakouts)
   * @param criteria - Screening criteria
   * @returns Array of stock symbols matching criteria
   */
  async screenStocks(criteria: {
    marketCapMoreThan?: number;
    volumeMoreThan?: number;
    priceMoreThan?: number;
    betaMoreThan?: number;
    limit?: number;
  }): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded for stock screening.");
      return [];
    }

    try {
      const params: Record<string, string> = {
        apikey: this.apiKey,
        limit: (criteria.limit || 50).toString(),
      };

      if (criteria.marketCapMoreThan) {
        params.marketCapMoreThan = criteria.marketCapMoreThan.toString();
      }
      if (criteria.volumeMoreThan) {
        params.volumeMoreThan = criteria.volumeMoreThan.toString();
      }
      if (criteria.priceMoreThan) {
        params.priceMoreThan = criteria.priceMoreThan.toString();
      }
      if (criteria.betaMoreThan) {
        params.betaMoreThan = criteria.betaMoreThan.toString();
      }

      const url = buildUrl(`${this.baseUrl}/stock-screener`, params);

      const response = await fetchWithRetry<any[]>(url, {
        timeout: 10000,
        retries: 2,
      });

      return response || [];
    } catch (error) {
      console.error("Error screening stocks:", error);
      return [];
    }
  }

  /**
   * Get stock gainers (top performing stocks)
   */
  async getGainers(): Promise<FMPQuote[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const cacheKey = "fmp:gainers";
    const cached = cache.get<FMPQuote[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/stock_market/gainers`, {
        apikey: this.apiKey,
      });

      const response = await fetchWithRetry<FMPQuote[]>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        cache.set(cacheKey, response, 60); // Cache for 1 minute
        return response;
      }

      return [];
    } catch (error) {
      console.error("Error fetching gainers:", error);
      return [];
    }
  }

  /**
   * Get sector performance
   */
  async getSectorPerformance(): Promise<
    Array<{
      sector: string;
      changesPercentage: string;
    }>
  > {
    if (!this.isConfigured()) {
      return [];
    }

    const cacheKey = "fmp:sector-performance";
    const cached =
      cache.get<Array<{ sector: string; changesPercentage: string }>>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/sector-performance`, {
        apikey: this.apiKey,
      });

      const response = await fetchWithRetry<
        Array<{ sector: string; changesPercentage: string }>
      >(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        cache.set(cacheKey, response, 300); // Cache for 5 minutes
        return response;
      }

      return [];
    } catch (error) {
      console.error("Error fetching sector performance:", error);
      return [];
    }
  }

  /**
   * Get earnings calendar for a symbol
   * @param symbol - Stock symbol
   * @returns Upcoming earnings date and estimates
   */
  async getEarningsCalendar(symbol: string): Promise<{
    date?: string;
    epsEstimated?: number;
    revenueEstimated?: number;
    fiscalDateEnding?: string;
    time?: string;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const cacheKey = `fmp:earnings-calendar:${symbol}`;
    const cached = cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      return cached || null;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/v3/earning_calendar`, {
        apikey: this.apiKey,
        symbol: symbol,
      });

      const response = await fetchWithRetry<any[]>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && response.length > 0) {
        const nextEarnings = response[0];
        const result = {
          date: nextEarnings.date,
          epsEstimated: nextEarnings.epsEstimated,
          revenueEstimated: nextEarnings.revenueEstimated,
          fiscalDateEnding: nextEarnings.fiscalDateEnding,
          time: nextEarnings.time,
        };
        cache.set(cacheKey, result, 3600); // Cache for 1 hour
        return result;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching earnings calendar for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get income statement (financial data)
   * @param symbol - Stock symbol
   * @param period - annual or quarter
   * @param limit - Number of periods to fetch
   * @returns Income statement data
   */
  async getIncomeStatement(
    symbol: string,
    period: "annual" | "quarter" = "quarter",
    limit: number = 4
  ): Promise<any[] | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const cacheKey = `fmp:income-statement:${symbol}:${period}:${limit}`;
    const cached = cache.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      return cached || null;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/v3/income-statement/${symbol}`, {
        apikey: this.apiKey,
        period: period,
        limit: limit.toString(),
      });

      const response = await fetchWithRetry<any[]>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        cache.set(cacheKey, response, 3600); // Cache for 1 hour
        return response;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching income statement for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get dividend calendar for a symbol
   * @param symbol - Stock symbol
   * @returns Upcoming dividend information
   */
  async getDividendCalendar(symbol: string): Promise<{
    date?: string;
    dividend?: number;
    paymentDate?: string;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const cacheKey = `fmp:dividend-calendar:${symbol}`;
    const cached = cache.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      return cached || null;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/v3/stock_dividend_calendar`, {
        apikey: this.apiKey,
        symbol: symbol,
      });

      const response = await fetchWithRetry<any[]>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && response.length > 0) {
        const nextDividend = response[0];
        const result = {
          date: nextDividend.date,
          dividend: nextDividend.dividend,
          paymentDate: nextDividend.paymentDate,
        };
        cache.set(cacheKey, result, 3600); // Cache for 1 hour
        return result;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching dividend calendar for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get historical earnings for a symbol
   * @param symbol - Stock symbol
   * @param limit - Number of periods to fetch
   * @returns Historical earnings data
   */
  async getHistoricalEarnings(
    symbol: string,
    limit: number = 4
  ): Promise<any[] | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const cacheKey = `fmp:historical-earnings:${symbol}:${limit}`;
    const cached = cache.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      return cached || null;
    }

    try {
      const url = buildUrl(
        `${this.baseUrl}/v3/historical/earning_calendar/${symbol}`,
        {
          apikey: this.apiKey,
          limit: limit.toString(),
        }
      );

      const response = await fetchWithRetry<any[]>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        cache.set(cacheKey, response, 3600); // Cache for 1 hour
        return response;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching historical earnings for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get comprehensive financial data for fundamental analysis
   */
  async getComprehensiveFinancials(symbol: string) {
    if (!this.isConfigured()) {
      console.warn("FMP API not configured.");
      return null;
    }

    try {
      const [
        incomeAnnual,
        incomeQuarterly,
        balanceAnnual,
        balanceQuarterly,
        cashFlowAnnual,
        cashFlowQuarterly,
        ratios,
        keyMetrics,
      ] = await Promise.all([
        this.fetchFMP(`income-statement/${symbol}?limit=5`),
        this.fetchFMP(`income-statement/${symbol}?period=quarter&limit=8`),
        this.fetchFMP(`balance-sheet-statement/${symbol}?limit=5`),
        this.fetchFMP(
          `balance-sheet-statement/${symbol}?period=quarter&limit=8`
        ),
        this.fetchFMP(`cash-flow-statement/${symbol}?limit=5`),
        this.fetchFMP(`cash-flow-statement/${symbol}?period=quarter&limit=8`),
        this.fetchFMP(`ratios/${symbol}?limit=5`),
        this.fetchFMP(`key-metrics/${symbol}?limit=5`),
      ]);

      return {
        incomeStatements: {
          annual: incomeAnnual || [],
          quarterly: incomeQuarterly || [],
        },
        balanceSheets: {
          annual: balanceAnnual || [],
          quarterly: balanceQuarterly || [],
        },
        cashFlowStatements: {
          annual: cashFlowAnnual || [],
          quarterly: cashFlowQuarterly || [],
        },
        ratios: ratios?.[0] || null,
        keyMetrics: keyMetrics?.[0] || null,
      };
    } catch (error) {
      console.error(
        `Error fetching comprehensive financials for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get analyst ratings and price targets
   */
  async getAnalystRatings(symbol: string) {
    if (!this.isConfigured()) return null;

    try {
      const [ratings, priceTarget] = await Promise.all([
        this.fetchFMP(`grade/${symbol}?limit=10`),
        this.fetchFMP(`price-target/${symbol}`),
      ]);

      return {
        ratings: ratings || [],
        priceTarget: priceTarget?.[0] || null,
      };
    } catch (error) {
      console.error(`Error fetching analyst data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get insider trading activity
   */
  async getInsiderTrading(symbol: string) {
    if (!this.isConfigured()) return [];

    try {
      const insiderTrades = await this.fetchFMP(
        `insider-trading?symbol=${symbol}&limit=50`
      );
      return insiderTrades || [];
    } catch (error) {
      console.error(`Error fetching insider trading for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get institutional ownership
   */
  async getInstitutionalOwnership(symbol: string) {
    if (!this.isConfigured()) return [];

    try {
      const institutional = await this.fetchFMP(
        `institutional-holder/${symbol}?limit=20`
      );
      return institutional || [];
    } catch (error) {
      console.error(
        `Error fetching institutional ownership for ${symbol}:`,
        error
      );
      return [];
    }
  }

  /**
   * Helper to fetch from FMP with rate limiting and caching
   */
  private async fetchFMP(endpoint: string): Promise<any> {
    const cacheKey = `fmp:${endpoint}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const allowed = await rateLimiter.checkLimit("fmp", rateLimitConfigs.fmp);
    if (!allowed) {
      console.warn("FMP rate limit exceeded.");
      return null;
    }

    const url = buildUrl(`${this.baseUrl}/${endpoint}`, {
      apikey: this.apiKey,
    });

    try {
      const response = await fetchWithRetry(url, {
        timeout: 10000,
        retries: 2,
      });

      // Cache for 1 hour
      cache.set(cacheKey, response, 3600);
      return response;
    } catch (error) {
      console.error(`FMP API error for ${endpoint}:`, error);
      return null;
    }
  }
}

// Singleton instance
export const fmpClient = new FMPClient();

// Also export the class for static method access
export { FMPClient };
