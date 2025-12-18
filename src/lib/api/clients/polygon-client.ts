/**
 * Polygon.io API Client
 * Real-time and historical market data
 * Documentation: https://polygon.io/docs/stocks/getting-started
 */

import { apiConfig, isPolygonConfigured } from "../config";
import { PolygonTickerSnapshot, PolygonAggregateBar } from "../types";
import { fetchWithRetry, buildUrl } from "../utils/http-client";
import { rateLimiter, rateLimitConfigs } from "../utils/rate-limiter";
import { cache, cacheKeys } from "../utils/cache";

// Index symbol mapping (Polygon uses different formats)
const INDEX_SYMBOL_MAP: Record<string, string> = {
  "^GSPC": "I:SPX", // S&P 500
  "^DJI": "I:DJI", // Dow Jones
  "^IXIC": "I:NDX", // NASDAQ Composite
  "^RUT": "I:RUT", // Russell 2000
};

// Type definitions for technical indicators
export interface TechnicalIndicatorResult {
  indicator: string;
  value: number;
  timestamp: number;
  interpretation: string;
}

export interface MACDResult {
  indicator: "MACD";
  value: number;
  signal: number;
  histogram: number;
  timestamp: number;
  interpretation: string;
}

export interface CompleteTechnicalAnalysis {
  ticker: string;
  timestamp: number;
  currentPrice: number;
  rsi?: TechnicalIndicatorResult;
  macd?: MACDResult;
  movingAverages: {
    sma20?: number;
    sma50?: number;
    sma200?: number;
    ema20?: number;
  };
  trend: "bullish" | "bearish" | "neutral";
  summary: string;
}

interface PolygonIndicatorResponse {
  status: string;
  results?: {
    values: Array<{
      timestamp: number;
      value: number;
    }>;
  };
}

interface PolygonMACDResponse {
  status: string;
  results?: {
    values: Array<{
      timestamp: number;
      value: number;
      signal: number;
      histogram: number;
    }>;
  };
}

class PolygonClient {
  private baseUrl = apiConfig.polygon.baseUrl;
  private apiKey = apiConfig.polygon.apiKey;

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return isPolygonConfigured();
  }

  /**
   * Get real-time snapshot for a ticker
   */
  async getSnapshot(ticker: string): Promise<PolygonTickerSnapshot | null> {
    if (!this.isConfigured()) {
      console.warn("Polygon API not configured. Using cached/mock data.");
      return null;
    }

    const cacheKey = cacheKeys.indexQuote(ticker);
    const cached = cache.get<PolygonTickerSnapshot>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "polygon",
      rateLimitConfigs.polygon
    );
    if (!allowed) {
      console.warn("Polygon rate limit exceeded. Using cached data.");
      return null;
    }

    if (ticker.startsWith("^")) {
      return this.getSnapshotFromPrevDay(ticker);
    }

    try {
      const url = buildUrl(
        `${this.baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`,
        { apiKey: this.apiKey }
      );

      interface SnapshotResponse {
        status: string;
        ticker: PolygonTickerSnapshot;
      }

      const response = await fetchWithRetry<SnapshotResponse>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response.status === "OK" && response.ticker) {
        cache.set(cacheKey, response.ticker, 30);
        return response.ticker;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Polygon snapshot for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get snapshot data from previous day bar (used for indices)
   */
  private async getSnapshotFromPrevDay(
    ticker: string
  ): Promise<PolygonTickerSnapshot | null> {
    const polygonTicker = INDEX_SYMBOL_MAP[ticker] || ticker;

    try {
      const url = buildUrl(
        `${this.baseUrl}/v2/aggs/ticker/${polygonTicker}/prev`,
        {
          adjusted: "true",
          apiKey: this.apiKey,
        }
      );

      interface AggregateResponse {
        status: string;
        ticker: string;
        results?: Array<{
          T: string;
          v: number;
          o: number;
          c: number;
          h: number;
          l: number;
          t: number;
        }>;
      }

      const response = await fetchWithRetry<AggregateResponse>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (
        response.status === "OK" &&
        response.results &&
        response.results.length > 0
      ) {
        const bar = response.results[0];
        const change = bar.c - bar.o;
        const changePerc = (change / bar.o) * 100;

        const snapshot: PolygonTickerSnapshot = {
          ticker: ticker,
          todaysChangePerc: changePerc,
          todaysChange: change,
          updated: bar.t,
          day: { o: bar.o, h: bar.h, l: bar.l, c: bar.c, v: bar.v, vw: bar.c },
          min: { c: bar.c, h: bar.h, l: bar.l, v: bar.v },
          prevDay: { o: bar.o, h: bar.h, l: bar.l, c: bar.c, v: bar.v },
        };

        const cacheKey = cacheKeys.indexQuote(ticker);
        cache.set(cacheKey, snapshot, 30);
        return snapshot;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching previous day bar for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get snapshots for multiple tickers
   */
  async getSnapshots(
    tickers: string[]
  ): Promise<Map<string, PolygonTickerSnapshot>> {
    const results = new Map<string, PolygonTickerSnapshot>();
    const promises = tickers.map(async (ticker) => {
      const snapshot = await this.getSnapshot(ticker);
      if (snapshot) {
        results.set(ticker, snapshot);
      }
    });
    await Promise.all(promises);
    return results;
  }

  /**
   * Get previous day's aggregate bar
   */
  async getPreviousDayBar(ticker: string): Promise<PolygonAggregateBar | null> {
    if (!this.isConfigured()) return null;

    const polygonTicker = INDEX_SYMBOL_MAP[ticker] || ticker;

    try {
      const url = buildUrl(
        `${this.baseUrl}/v2/aggs/ticker/${polygonTicker}/prev`,
        {
          adjusted: "true",
          apiKey: this.apiKey,
        }
      );

      interface AggregateResponse {
        status: string;
        results?: PolygonAggregateBar[];
      }

      const response = await fetchWithRetry<AggregateResponse>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (
        response.status === "OK" &&
        response.results &&
        response.results.length > 0
      ) {
        return response.results[0];
      }

      return null;
    } catch (error) {
      console.error(`Error fetching previous day bar for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get aggregate bars for a time range
   */
  async getAggregateBars(
    ticker: string,
    from: string,
    to: string,
    timespan: "minute" | "hour" | "day" | "week" | "month" = "day"
  ): Promise<PolygonAggregateBar[]> {
    if (!this.isConfigured()) return [];

    const polygonTicker = INDEX_SYMBOL_MAP[ticker] || ticker;

    try {
      const url = buildUrl(
        `${this.baseUrl}/v2/aggs/ticker/${polygonTicker}/range/1/${timespan}/${from}/${to}`,
        { adjusted: "true", sort: "asc", apiKey: this.apiKey }
      );

      interface AggregatesResponse {
        status: string;
        results?: PolygonAggregateBar[];
      }

      const response = await fetchWithRetry<AggregatesResponse>(url, {
        timeout: 10000,
        retries: 2,
      });

      if (response.status === "OK" && response.results) {
        return response.results;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching aggregate bars for ${ticker}:`, error);
      return [];
    }
  }

  /**
   * Get RSI (Relative Strength Index) for a ticker
   */
  async getRSI(
    ticker: string,
    window = 14
  ): Promise<TechnicalIndicatorResult | null> {
    if (!this.isConfigured()) return null;

    const cacheKey = `polygon:rsi:${ticker}:${window}`;
    const cached = cache.get<TechnicalIndicatorResult>(cacheKey);
    if (cached) return cached;

    try {
      const url = buildUrl(`${this.baseUrl}/v1/indicators/rsi/${ticker}`, {
        timespan: "day",
        window: window.toString(),
        series_type: "close",
        order: "desc",
        limit: "1",
        apiKey: this.apiKey,
      });

      const response = await fetchWithRetry<PolygonIndicatorResponse>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response.status === "OK" && response.results?.values?.length) {
        const latestValue = response.results.values[0].value;
        const result: TechnicalIndicatorResult = {
          indicator: "RSI",
          value: latestValue,
          timestamp: response.results.values[0].timestamp,
          interpretation: this.interpretRSI(latestValue),
        };
        cache.set(cacheKey, result, 60);
        return result;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching RSI for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get MACD (Moving Average Convergence Divergence) for a ticker
   */
  async getMACD(ticker: string): Promise<MACDResult | null> {
    if (!this.isConfigured()) return null;

    const cacheKey = `polygon:macd:${ticker}`;
    const cached = cache.get<MACDResult>(cacheKey);
    if (cached) return cached;

    try {
      const url = buildUrl(`${this.baseUrl}/v1/indicators/macd/${ticker}`, {
        timespan: "day",
        short_window: "12",
        long_window: "26",
        signal_window: "9",
        series_type: "close",
        order: "desc",
        limit: "1",
        apiKey: this.apiKey,
      });

      const response = await fetchWithRetry<PolygonMACDResponse>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response.status === "OK" && response.results?.values?.length) {
        const latest = response.results.values[0];
        const result: MACDResult = {
          indicator: "MACD",
          value: latest.value,
          signal: latest.signal,
          histogram: latest.histogram,
          timestamp: latest.timestamp,
          interpretation: this.interpretMACD(
            latest.value,
            latest.signal,
            latest.histogram
          ),
        };
        cache.set(cacheKey, result, 60);
        return result;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching MACD for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get SMA (Simple Moving Average) for a ticker
   */
  async getSMA(
    ticker: string,
    window = 50
  ): Promise<TechnicalIndicatorResult | null> {
    if (!this.isConfigured()) return null;

    const cacheKey = `polygon:sma:${ticker}:${window}`;
    const cached = cache.get<TechnicalIndicatorResult>(cacheKey);
    if (cached) return cached;

    try {
      const url = buildUrl(`${this.baseUrl}/v1/indicators/sma/${ticker}`, {
        timespan: "day",
        window: window.toString(),
        series_type: "close",
        order: "desc",
        limit: "1",
        apiKey: this.apiKey,
      });

      const response = await fetchWithRetry<PolygonIndicatorResponse>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response.status === "OK" && response.results?.values?.length) {
        const result: TechnicalIndicatorResult = {
          indicator: `SMA${window}`,
          value: response.results.values[0].value,
          timestamp: response.results.values[0].timestamp,
          interpretation: `${window}-day moving average`,
        };
        cache.set(cacheKey, result, 60);
        return result;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching SMA for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get EMA (Exponential Moving Average) for a ticker
   */
  async getEMA(
    ticker: string,
    window = 20
  ): Promise<TechnicalIndicatorResult | null> {
    if (!this.isConfigured()) return null;

    const cacheKey = `polygon:ema:${ticker}:${window}`;
    const cached = cache.get<TechnicalIndicatorResult>(cacheKey);
    if (cached) return cached;

    try {
      const url = buildUrl(`${this.baseUrl}/v1/indicators/ema/${ticker}`, {
        timespan: "day",
        window: window.toString(),
        series_type: "close",
        order: "desc",
        limit: "1",
        apiKey: this.apiKey,
      });

      const response = await fetchWithRetry<PolygonIndicatorResponse>(url, {
        timeout: 5000,
        retries: 2,
      });

      if (response.status === "OK" && response.results?.values?.length) {
        const result: TechnicalIndicatorResult = {
          indicator: `EMA${window}`,
          value: response.results.values[0].value,
          timestamp: response.results.values[0].timestamp,
          interpretation: `${window}-day exponential moving average`,
        };
        cache.set(cacheKey, result, 60);
        return result;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching EMA for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get all technical indicators for a ticker
   */
  async getTechnicalAnalysis(
    ticker: string
  ): Promise<CompleteTechnicalAnalysis | null> {
    if (!this.isConfigured()) return null;

    try {
      const [rsi, macd, sma20, sma50, sma200, ema20] = await Promise.all([
        this.getRSI(ticker),
        this.getMACD(ticker),
        this.getSMA(ticker, 20),
        this.getSMA(ticker, 50),
        this.getSMA(ticker, 200),
        this.getEMA(ticker, 20),
      ]);

      const snapshot = await this.getSnapshot(ticker);
      const currentPrice = snapshot?.day?.c || 0;

      return {
        ticker,
        timestamp: Date.now(),
        currentPrice,
        rsi: rsi || undefined,
        macd: macd || undefined,
        movingAverages: {
          sma20: sma20?.value,
          sma50: sma50?.value,
          sma200: sma200?.value,
          ema20: ema20?.value,
        },
        trend: this.determineTrend(
          currentPrice,
          sma20?.value,
          sma50?.value,
          sma200?.value
        ),
        summary: this.generateSummary(
          rsi,
          macd,
          currentPrice,
          sma50?.value,
          sma200?.value
        ),
      };
    } catch (error) {
      console.error(`Error fetching technical analysis for ${ticker}:`, error);
      return null;
    }
  }

  // Helper methods
  private interpretRSI(value: number): string {
    if (value >= 70) return "Overbought - The stock may be due for a pullback";
    if (value >= 60) return "Strong momentum - Bullish trend continues";
    if (value <= 30) return "Oversold - The stock may be due for a bounce";
    if (value <= 40) return "Weak momentum - Bearish pressure present";
    return "Neutral - No strong signal";
  }

  private interpretMACD(
    value: number,
    signal: number,
    histogram: number
  ): string {
    if (histogram > 0 && value > signal) {
      return "Bullish - MACD above signal line, momentum is positive";
    }
    if (histogram < 0 && value < signal) {
      return "Bearish - MACD below signal line, momentum is negative";
    }
    if (Math.abs(histogram) < 0.5) {
      return "Neutral - MACD near signal line, watch for crossover";
    }
    return "Mixed signals - Wait for confirmation";
  }

  private determineTrend(
    price: number,
    sma20?: number,
    sma50?: number,
    sma200?: number
  ): "bullish" | "bearish" | "neutral" {
    let bullishSignals = 0;
    let bearishSignals = 0;

    if (sma20 && price > sma20) bullishSignals++;
    else if (sma20) bearishSignals++;

    if (sma50 && price > sma50) bullishSignals++;
    else if (sma50) bearishSignals++;

    if (sma200 && price > sma200) bullishSignals++;
    else if (sma200) bearishSignals++;

    if (bullishSignals >= 2) return "bullish";
    if (bearishSignals >= 2) return "bearish";
    return "neutral";
  }

  private generateSummary(
    rsi: TechnicalIndicatorResult | null,
    macd: MACDResult | null,
    price: number,
    sma50?: number,
    sma200?: number
  ): string {
    const signals: string[] = [];

    if (rsi) {
      if (rsi.value >= 70) signals.push("RSI indicates overbought conditions");
      else if (rsi.value <= 30)
        signals.push("RSI indicates oversold conditions");
    }

    if (macd) {
      if (macd.histogram > 0) signals.push("MACD shows positive momentum");
      else if (macd.histogram < 0) signals.push("MACD shows negative momentum");
    }

    if (sma50 && sma200) {
      if (sma50 > sma200) signals.push("Golden cross pattern (bullish)");
      else if (sma50 < sma200) signals.push("Death cross pattern (bearish)");
    }

    if (sma200 && price > sma200) {
      signals.push("Trading above 200-day average (long-term bullish)");
    } else if (sma200) {
      signals.push("Trading below 200-day average (long-term bearish)");
    }

    return signals.length > 0
      ? signals.join(". ") + "."
      : "Insufficient data for analysis.";
  }
}

// Singleton instance
export const polygonClient = new PolygonClient();
