/**
 * Massive API Client
 * Alternative data and market insights
 * Documentation: https://www.massive.io/docs
 */

import { apiConfig, isMassiveConfigured } from "../config";
import { fetchWithRetry, buildUrl } from "../utils/http-client";
import { rateLimiter, rateLimitConfigs } from "../utils/rate-limiter";
import { cache } from "../utils/cache";

// ============================================================================
// Massive Types
// ============================================================================

export interface MassiveInsight {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  source: string;
  publishedAt: string;
  sentiment?: "positive" | "negative" | "neutral";
  impact?: "high" | "medium" | "low";
  relatedSymbols?: string[];
  url?: string;
}

export interface MassiveMarketSignal {
  signal: string;
  strength: number; // 0-100
  direction: "bullish" | "bearish" | "neutral";
  description: string;
  timestamp: string;
}

export interface MassiveSectorData {
  sector: string;
  performance: number;
  volume: number;
  sentiment: number; // -1 to 1
  topStocks: Array<{
    symbol: string;
    name: string;
    change: number;
  }>;
}

// ============================================================================
// Massive Client
// ============================================================================

class MassiveClient {
  private baseUrl = apiConfig.massive.baseUrl;
  private apiKey = apiConfig.massive.apiKey;

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return isMassiveConfigured();
  }

  /**
   * Get market insights
   * @param limit - Number of insights to fetch
   * @param category - Filter by category (optional)
   * @returns Array of market insights
   */
  async getMarketInsights(
    limit: number = 10,
    category?: string
  ): Promise<MassiveInsight[]> {
    if (!this.isConfigured()) {
      console.warn("Massive API not configured.");
      return [];
    }

    const cacheKey = `massive:insights:${category || "all"}:${limit}`;
    const cached = cache.get<MassiveInsight[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "massive",
      rateLimitConfigs.massive
    );
    if (!allowed) {
      console.warn("Massive rate limit exceeded.");
      return cached || [];
    }

    try {
      const params: Record<string, string> = {
        limit: limit.toString(),
      };

      if (category) {
        params.category = category;
      }

      const url = buildUrl(`${this.baseUrl}/insights`, params);

      const response = await fetchWithRetry<{ data: MassiveInsight[] }>(url, {
        timeout: 8000,
        retries: 2,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response && response.data && Array.isArray(response.data)) {
        // Cache for 10 minutes
        cache.set(cacheKey, response.data, 600);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching Massive insights:", error);
      return [];
    }
  }

  /**
   * Get market signals
   * @returns Array of current market signals
   */
  async getMarketSignals(): Promise<MassiveMarketSignal[]> {
    if (!this.isConfigured()) {
      console.warn("Massive API not configured.");
      return [];
    }

    const cacheKey = "massive:signals";
    const cached = cache.get<MassiveMarketSignal[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "massive",
      rateLimitConfigs.massive
    );
    if (!allowed) {
      console.warn("Massive rate limit exceeded for signals.");
      return cached || [];
    }

    try {
      const url = `${this.baseUrl}/signals`;

      const response = await fetchWithRetry<{ data: MassiveMarketSignal[] }>(
        url,
        {
          timeout: 8000,
          retries: 2,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response && response.data && Array.isArray(response.data)) {
        // Cache for 5 minutes
        cache.set(cacheKey, response.data, 300);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching Massive signals:", error);
      return [];
    }
  }

  /**
   * Get sector performance data
   * @returns Array of sector data
   */
  async getSectorPerformance(): Promise<MassiveSectorData[]> {
    if (!this.isConfigured()) {
      console.warn("Massive API not configured.");
      return [];
    }

    const cacheKey = "massive:sectors";
    const cached = cache.get<MassiveSectorData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "massive",
      rateLimitConfigs.massive
    );
    if (!allowed) {
      console.warn("Massive rate limit exceeded for sectors.");
      return cached || [];
    }

    try {
      const url = `${this.baseUrl}/sectors`;

      const response = await fetchWithRetry<{ data: MassiveSectorData[] }>(
        url,
        {
          timeout: 8000,
          retries: 2,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response && response.data && Array.isArray(response.data)) {
        // Cache for 5 minutes
        cache.set(cacheKey, response.data, 300);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching Massive sector data:", error);
      return [];
    }
  }

  /**
   * Search for insights by keyword
   * @param query - Search query
   * @param limit - Number of results
   * @returns Array of matching insights
   */
  async searchInsights(
    query: string,
    limit: number = 5
  ): Promise<MassiveInsight[]> {
    if (!this.isConfigured()) {
      console.warn("Massive API not configured.");
      return [];
    }

    const cacheKey = `massive:search:${query}:${limit}`;
    const cached = cache.get<MassiveInsight[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const allowed = await rateLimiter.checkLimit(
      "massive",
      rateLimitConfigs.massive
    );
    if (!allowed) {
      console.warn("Massive rate limit exceeded for search.");
      return cached || [];
    }

    try {
      const url = buildUrl(`${this.baseUrl}/insights/search`, {
        q: query,
        limit: limit.toString(),
      });

      const response = await fetchWithRetry<{ data: MassiveInsight[] }>(url, {
        timeout: 8000,
        retries: 2,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response && response.data && Array.isArray(response.data)) {
        // Cache search results for 15 minutes
        cache.set(cacheKey, response.data, 900);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error searching Massive insights:", error);
      return [];
    }
  }
}

// Singleton instance
export const massiveClient = new MassiveClient();

// Also export the class for type access
export { MassiveClient };
