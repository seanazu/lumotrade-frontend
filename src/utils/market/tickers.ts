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
 * @param wasCorrect - Whether the prediction was correct (after EOD validation)
 * @param actualReturn - The actual return (after EOD validation)
 * @returns Sentiment object with label and color
 */
export function getPredictionSentiment(
  magnitude: number,
  shouldTrade: boolean,
  isPositive: boolean,
  wasCorrect?: boolean | null,
  actualReturn?: number | null
): { label: string; color: "emerald" | "red" | "amber" | "gray" } {
  const hasActual =
    actualReturn !== null &&
    actualReturn !== undefined &&
    !Number.isNaN(actualReturn);

  // After market close / next day pre-open: show trade outcome if a trade was taken.
  if (hasActual) {
    if (!shouldTrade) return { label: "No Trade", color: "gray" };

    // Prefer backend correctness if provided, otherwise infer from actualReturn sign.
    const inferredWin = isPositive ? actualReturn > 0 : actualReturn < 0;
    const win =
      wasCorrect === true ? true : wasCorrect === false ? false : inferredWin;

    return win
      ? { label: "Win", color: "emerald" }
      : { label: "Loss", color: "red" };
  }

  // Before market close: only show Trade / No Trade
  return shouldTrade
    ? { label: "Trade", color: isPositive ? "emerald" : "red" }
    : { label: "No Trade", color: "gray" };
}
