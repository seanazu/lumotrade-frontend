/**
 * ORATS API Client
 * Options data and analytics for detecting institutional activity
 */

import { apiConfig } from "@/lib/api/config";
import { rateLimiter, rateLimitConfigs } from "@/lib/api/utils/rate-limiter";

interface OratsStrike {
  strike: number;
  callVolume: number;
  putVolume: number;
  callOpenInterest: number;
  putOpenInterest: number;
  callImpliedVolatility: number;
  putImpliedVolatility: number;
}

interface OratsOptionsData {
  symbol: string;
  timestamp: string;
  
  // Volume metrics
  totalCallVolume: number;
  totalPutVolume: number;
  putCallVolumeRatio: number;
  volumeVsAvg: number;
  
  // Open interest
  totalCallOI: number;
  totalPutOI: number;
  putCallOIRatio: number;
  
  // Volatility
  impliedVolatility: number;
  ivRank: number; // 0-100, where IV is relative to 52-week range
  ivPercentile: number;
  
  // Unusual activity
  unusualCallActivity: boolean;
  unusualPutActivity: boolean;
  sweeps: OptionsSweep[];
  
  // Strike distribution
  strikes: OratsStrike[];
}

interface OptionsSweep {
  symbol: string;
  timestamp: string;
  strike: number;
  expiration: string;
  type: "call" | "put";
  price: number;
  size: number;
  premium: number;
  sentiment: "bullish" | "bearish";
}

class OratsClient {
  private baseUrl = "https://api.orats.io";
  private apiKey: string;

  constructor() {
    this.apiKey = apiConfig.orats?.apiKey || process.env.ORATS_API_KEY || "";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get comprehensive options data for a symbol
   */
  async getOptionsData(symbol: string): Promise<OratsOptionsData | null> {
    if (!this.isConfigured()) {
      console.warn("⚠️ ORATS API not configured");
      return null;
    }

    try {
      // Rate limiting
      const canProceed = await rateLimiter.checkLimit(
        "orats",
        rateLimitConfigs.orats || { maxRequests: 100, windowMs: 60000 }
      );

      if (!canProceed) {
        console.warn("⚠️ ORATS rate limit exceeded, using cached data if available");
        return null;
      }

      // ORATS API structure (adjust based on actual ORATS endpoints)
      const [summaryData, strikeData, flowData] = await Promise.all([
        this.fetchOratsEndpoint(`/datav2/hist/ivrank?ticker=${symbol}`),
        this.fetchOratsEndpoint(`/datav2/strikes?ticker=${symbol}`),
        this.fetchOratsEndpoint(`/datav2/hist/unusualactivity?ticker=${symbol}`),
      ]);

      if (!summaryData || !strikeData) {
        console.warn(`⚠️ Incomplete ORATS data for ${symbol}`);
        return null;
      }

      // Parse and aggregate data
      const strikes = this.parseStrikes(strikeData);
      const totalCallVolume = strikes.reduce((sum, s) => sum + s.callVolume, 0);
      const totalPutVolume = strikes.reduce((sum, s) => sum + s.putVolume, 0);
      const totalCallOI = strikes.reduce((sum, s) => sum + s.callOpenInterest, 0);
      const totalPutOI = strikes.reduce((sum, s) => sum + s.putOpenInterest, 0);

      const avgCallVolume = summaryData.avgCallVolume || totalCallVolume;
      const avgPutVolume = summaryData.avgPutVolume || totalPutVolume;

      const unusualCallActivity = totalCallVolume > avgCallVolume * 3;
      const unusualPutActivity = totalPutVolume > avgPutVolume * 3;

      const sweeps = flowData ? this.parseSweeps(flowData) : [];

      return {
        symbol,
        timestamp: new Date().toISOString(),
        totalCallVolume,
        totalPutVolume,
        putCallVolumeRatio: totalPutVolume / totalCallVolume,
        volumeVsAvg: (totalCallVolume + totalPutVolume) / (avgCallVolume + avgPutVolume),
        totalCallOI,
        totalPutOI,
        putCallOIRatio: totalPutOI / totalCallOI,
        impliedVolatility: summaryData.iv || 0,
        ivRank: summaryData.ivRank || 0,
        ivPercentile: summaryData.ivPercentile || 0,
        unusualCallActivity,
        unusualPutActivity,
        sweeps,
        strikes,
      };
    } catch (error) {
      console.error(`❌ Error fetching ORATS data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get multiple symbols' options data in batch
   */
  async getBatchOptionsData(symbols: string[]): Promise<Map<string, OratsOptionsData>> {
    const results = new Map<string, OratsOptionsData>();

    // Process in small batches to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((symbol) => this.getOptionsData(symbol))
      );

      batch.forEach((symbol, idx) => {
        const data = batchResults[idx];
        if (data) {
          results.set(symbol, data);
        }
      });

      // Delay between batches
      if (i + batchSize < symbols.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Get stocks with unusual options activity
   */
  async getUnusualActivity(): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const canProceed = await rateLimiter.checkLimit(
        "orats",
        rateLimitConfigs.orats || { maxRequests: 100, windowMs: 60000 }
      );

      if (!canProceed) {
        return [];
      }

      const data = await this.fetchOratsEndpoint("/datav2/hist/unusualactivity");
      
      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Extract symbols with significant unusual activity
      return data
        .filter((item: any) => item.volumeVsAvg > 3)
        .map((item: any) => item.ticker)
        .slice(0, 20);
    } catch (error) {
      console.error("❌ Error fetching unusual options activity:", error);
      return [];
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async fetchOratsEndpoint(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${this.apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ORATS API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private parseStrikes(data: any): OratsStrike[] {
    if (!data || !data.strikes) {
      return [];
    }

    return data.strikes.map((strike: any) => ({
      strike: strike.strike,
      callVolume: strike.callVolume || 0,
      putVolume: strike.putVolume || 0,
      callOpenInterest: strike.callOpenInterest || 0,
      putOpenInterest: strike.putOpenInterest || 0,
      callImpliedVolatility: strike.callIV || 0,
      putImpliedVolatility: strike.putIV || 0,
    }));
  }

  private parseSweeps(data: any): OptionsSweep[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data
      .filter((item: any) => item.isSweep)
      .map((item: any) => ({
        symbol: item.ticker,
        timestamp: item.timestamp,
        strike: item.strike,
        expiration: item.expiration,
        type: item.type,
        price: item.price,
        size: item.size,
        premium: item.premium,
        sentiment: item.type === "call" ? "bullish" : "bearish",
      }))
      .slice(0, 10); // Top 10 sweeps
  }
}

// Export singleton instance
export const oratsClient = new OratsClient();

// Export types
export type { OratsOptionsData, OptionsSweep, OratsStrike };

