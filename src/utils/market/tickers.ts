import {
  TICKER_MAP,
  DEFAULT_TICKER_INFO,
  TickerInfo,
} from "@/constants/tickers";

/**
 * Get ticker display information including name, symbol, icon, and color
 * @param ticker - The ticker symbol to look up
 * @returns TickerInfo object with display properties
 */
export function getTickerInfo(ticker: string): TickerInfo {
  return TICKER_MAP[ticker] || DEFAULT_TICKER_INFO;
}

/**
 * Get prediction sentiment based on magnitude and trade flag
 * @param magnitude - The magnitude of the prediction
 * @param shouldTrade - Whether trading is recommended
 * @param isPositive - Whether the prediction is positive
 * @returns Sentiment object with label and color
 */
export function getPredictionSentiment(
  magnitude: number,
  shouldTrade: boolean,
  isPositive: boolean
): { label: string; color: "emerald" | "red" | "amber" | "gray" } {
  if (!shouldTrade) return { label: "No Trade", color: "gray" };

  if (magnitude > 0.03) {
    return {
      label: isPositive ? "Strong Buy" : "Strong Sell",
      color: isPositive ? "emerald" : "red",
    };
  }

  if (magnitude > 0.015) {
    return {
      label: isPositive ? "Bullish" : "Bearish",
      color: isPositive ? "emerald" : "red",
    };
  }

  return { label: "Neutral", color: "amber" };
}

