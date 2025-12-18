/**
 * Market News Hook
 * Fetches latest market news with sentiment analysis
 */

import { useQuery } from '@tanstack/react-query';
import { MarketStory } from '@/resources/mock-data/indexes';

interface MarketNewsResponse {
  success: boolean;
  data: MarketStory[];
  summary?: string;
  cached?: boolean;
  source?: string;
  timestamp: number;
  error?: string;
}

interface MarketNewsData {
  stories: MarketStory[];
  summary: string;
}

/**
 * Fetch market news from API
 */
async function fetchMarketNews(limit: number = 10): Promise<MarketNewsData> {
  const response = await fetch(`/api/market/news?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: MarketNewsResponse = await response.json();

  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch market news');
  }

  return {
    stories: json.data,
    summary: json.summary || '',
  };
}

/**
 * Hook to fetch and manage market news
 * 
 * Features:
 * - Auto-refresh every 10 minutes
 * - Smart caching
 * - Automatic retry on failure
 * - Returns stories with AI summary
 * 
 * @param limit - Number of news articles to fetch (default: 20)
 * @returns Market news data with loading and error states
 */
export function useMarketNews(limit: number = 20) {
  return useQuery({
    queryKey: ['market', 'news', limit],
    queryFn: () => fetchMarketNews(limit),
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes (news doesn't change rapidly)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus (news is not time-critical)
    refetchOnMount: false, // Don't refetch if data is fresh
    retry: 2, // Retry failed requests 2 times
    retryDelay: 2000, // Wait 2 seconds between retries
  });
}

