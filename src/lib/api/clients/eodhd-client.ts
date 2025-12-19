/**
 * EODHD (End of Day Historical Data) API Client
 * Market data, fundamentals, and alternative data sources
 * Documentation: https://eodhistoricaldata.com/financial-apis/
 */

import { apiConfig, isEODHDConfigured } from "../config";
import { fetchWithRetry, buildUrl } from "../utils/http-client";
import { rateLimiter, rateLimitConfigs } from "../utils/rate-limiter";
import { cache, cacheKeys } from "../utils/cache";

// ============================================================================
// EODHD Types
// ============================================================================

export interface EODHDQuote {
  code: string;
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
}

export interface EODHDRealTimeQuote {
  code: string;
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
}

export interface EODHDForexQuote {
  code: string;
  timestamp: number;
  close: number;
  change: number;
  change_p: number;
  high: number;
  low: number;
  open: number;
}

export interface EODHDCommodityQuote {
  code: string;
  timestamp: number;
  close: number;
  change: number;
  change_p: number;
  high: number;
  low: number;
  open: number;
  volume?: number;
}

export interface EODHDIntradayBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ============================================================================
// EODHD Client
// ============================================================================

class EODHDClient {
  private baseUrl = apiConfig.eodhd.baseUrl;
  private apiKey = apiConfig.eodhd.apiKey;

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return isEODHDConfigured();
  }

  /**
   * Get real-time quote for a stock
   * @param symbol - Stock symbol with exchange (e.g., "AAPL.US")
   * @returns Quote data
   */
  async getRealTimeQuote(symbol: string): Promise<EODHDRealTimeQuote | null> {
    if (!this.isConfigured()) {
      console.warn("EODHD API not configured.");
      return null;
    }

    const cacheKey = `eodhd:quote:${symbol}`;
    const cached = cache.get<EODHDRealTimeQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "eodhd",
      rateLimitConfigs.eodhd
    );
    if (!allowed) {
      console.warn("EODHD rate limit exceeded.");
      return cached;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/real-time/${symbol}`, {
        api_token: this.apiKey,
        fmt: "json",
      });

      const response = await fetchWithRetry<EODHDRealTimeQuote>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response) {
        // Cache for 30 seconds
        cache.set(cacheKey, response, 30);
        return response;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching EODHD quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get real-time forex quote
   * @param pair - Forex pair (e.g., "EURUSD")
   * @returns Forex quote data
   */
  async getForexQuote(pair: string): Promise<EODHDForexQuote | null> {
    if (!this.isConfigured()) {
      console.warn("EODHD API not configured.");
      return null;
    }

    const cacheKey = `eodhd:forex:${pair}`;
    const cached = cache.get<EODHDForexQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "eodhd",
      rateLimitConfigs.eodhd
    );
    if (!allowed) {
      console.warn("EODHD rate limit exceeded for forex.");
      return cached;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/real-time/${pair}.FOREX`, {
        api_token: this.apiKey,
        fmt: "json",
      });

      const response = await fetchWithRetry<EODHDForexQuote>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response) {
        // Cache for 30 seconds
        cache.set(cacheKey, response, 30);
        return response;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching EODHD forex quote for ${pair}:`, error);
      return null;
    }
  }

  /**
   * Get real-time commodity quote
   * @param symbol - Commodity symbol (e.g., "CL" for crude oil)
   * @returns Commodity quote data
   */
  async getCommodityQuote(symbol: string): Promise<EODHDCommodityQuote | null> {
    if (!this.isConfigured()) {
      console.warn("EODHD API not configured.");
      return null;
    }

    const cacheKey = `eodhd:commodity:${symbol}`;
    const cached = cache.get<EODHDCommodityQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "eodhd",
      rateLimitConfigs.eodhd
    );
    if (!allowed) {
      console.warn("EODHD rate limit exceeded for commodity.");
      return cached;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/real-time/${symbol}.CC`, {
        api_token: this.apiKey,
        fmt: "json",
      });

      const response = await fetchWithRetry<EODHDCommodityQuote>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response) {
        // Cache for 30 seconds
        cache.set(cacheKey, response, 30);
        return response;
      }

      return null;
    } catch (error) {
      console.error(
        `Error fetching EODHD commodity quote for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get crypto quote
   * @param symbol - Crypto symbol (e.g., "BTC-USD")
   * @returns Crypto quote data
   */
  async getCryptoQuote(symbol: string): Promise<EODHDQuote | null> {
    if (!this.isConfigured()) {
      console.warn("EODHD API not configured.");
      return null;
    }

    const cacheKey = `eodhd:crypto:${symbol}`;
    const cached = cache.get<EODHDQuote>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "eodhd",
      rateLimitConfigs.eodhd
    );
    if (!allowed) {
      console.warn("EODHD rate limit exceeded for crypto.");
      return cached;
    }

    try {
      const url = buildUrl(`${this.baseUrl}/real-time/${symbol}.CC`, {
        api_token: this.apiKey,
        fmt: "json",
      });

      const response = await fetchWithRetry<EODHDQuote>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response) {
        // Cache for 30 seconds
        cache.set(cacheKey, response, 30);
        return response;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching EODHD crypto quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get intraday data
   * @param symbol - Symbol with exchange (e.g., "AAPL.US")
   * @param interval - Interval (1m, 5m, 1h)
   * @param from - Unix timestamp for start
   * @param to - Unix timestamp for end
   * @returns Intraday bars
   */
  async getIntradayData(
    symbol: string,
    interval: "1m" | "5m" | "1h" = "5m",
    from?: number,
    to?: number
  ): Promise<EODHDIntradayBar[]> {
    if (!this.isConfigured()) {
      console.warn("EODHD API not configured.");
      return [];
    }

    const cacheKey = `eodhd:intraday:${symbol}:${interval}`;
    const cached = cache.get<EODHDIntradayBar[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "eodhd",
      rateLimitConfigs.eodhd
    );
    if (!allowed) {
      console.warn("EODHD rate limit exceeded for intraday.");
      return cached || [];
    }

    try {
      const params: Record<string, string> = {
        api_token: this.apiKey,
        fmt: "json",
        interval,
      };

      if (from) params.from = from.toString();
      if (to) params.to = to.toString();

      const url = buildUrl(`${this.baseUrl}/intraday/${symbol}`, params);

      const response = await fetchWithRetry<EODHDIntradayBar[]>(url, {
        timeout: 8000,
        retries: 2,
      });

      if (response && Array.isArray(response)) {
        // Cache for 10 seconds
        cache.set(cacheKey, response, 10);
        return response;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching EODHD intraday data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get multiple quotes at once
   * @param symbols - Array of symbols with exchanges
   * @returns Map of symbol to quote
   */
  async getMultipleQuotes(
    symbols: string[]
  ): Promise<Map<string, EODHDRealTimeQuote>> {
    if (!this.isConfigured()) {
      return new Map();
    }

    const results = new Map<string, EODHDRealTimeQuote>();

    // Fetch in parallel
    const promises = symbols.map(async (symbol) => {
      const quote = await this.getRealTimeQuote(symbol);
      if (quote) {
        results.set(symbol, quote);
      }
    });

    await Promise.all(promises);

    return results;
  }
}

// Singleton instance
export const eodhdClient = new EODHDClient();

// Also export the class for type access
export { EODHDClient };
