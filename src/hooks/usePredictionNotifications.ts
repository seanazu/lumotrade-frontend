import { useEffect, useRef, useState } from "react";
import { useTodayPrediction } from "./useMLBackend";
import { notificationService } from "@/lib/notifications/notification-service";

/**
 * Enhanced hook for real-time prediction updates with notifications
 * 
 * Features:
 * - Auto-polls backend every 60 seconds
 * - Detects new predictions
 * - Shows browser notifications
 * - Provides "New Data" banner indicator
 */
export function usePredictionNotifications() {
  const { data: predictions, isLoading, error, dataUpdatedAt, refetch } = useTodayPrediction();
  const [hasNewData, setHasNewData] = useState(false);
  const lastPredictionRef = useRef<string | null>(null);
  const notificationShownRef = useRef(false);

  // Detect new predictions
  useEffect(() => {
    if (!predictions || !Array.isArray(predictions) || predictions.length === 0) return;

    // Use the first prediction (highest confidence) as the key
    const firstPred = predictions[0];
    const predictionKey = `${firstPred.date}-${predictions.length}-${firstPred.ticker}-${firstPred.direction}`;

    // If this is a different prediction than last time
    if (lastPredictionRef.current && lastPredictionRef.current !== predictionKey) {
      console.log('🔔 New prediction detected!', {
        old: lastPredictionRef.current,
        new: predictionKey,
      });

      setHasNewData(true);

      // Show browser notification (only once per prediction)
      if (!notificationShownRef.current) {
        const direction = firstPred.direction === 'UP' ? '📈' : '📉';
        const confidence = Math.round((firstPred.confidence || 0) * 100);

        notificationService.show({
          title: `${direction} New Predictions Available`,
          body: `${predictions.length} tickers analyzed • Top: ${firstPred.ticker} ${firstPred.direction} (${confidence}%)`,
          tag: `prediction-${firstPred.date}`,
          data: { url: '/model-monitor' },
        });

        notificationShownRef.current = true;
      }
    }

    // Update last prediction
    if (predictionKey !== lastPredictionRef.current) {
      lastPredictionRef.current = predictionKey;
      // Reset notification flag when prediction changes
      notificationShownRef.current = false;
    }
  }, [predictions]);

  // Reset "new data" indicator
  const dismissNewData = () => {
    setHasNewData(false);
  };

  // Get prediction summary for display (use first/best prediction)
  const predictionSummary = predictions && predictions.length > 0
    ? {
        ticker: predictions[0].ticker,
        direction: predictions[0].direction,
        confidence: Math.round((predictions[0].confidence || 0) * 100),
        shouldTrade: predictions[0].should_trade,
        timestamp: predictions[0].date,
      }
    : null;

  return {
    prediction: predictions?.[0] || null, // For backward compatibility
    predictions: predictions || [], // Full array for new components
    predictionSummary,
    isLoading,
    error,
    hasNewData,
    dismissNewData,
    lastUpdate: dataUpdatedAt,
    refetch,
  };
}

