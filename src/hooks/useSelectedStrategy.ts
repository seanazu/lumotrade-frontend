import { db } from "@/lib/instant";
import { useUser } from "@/contexts/UserContext";
import { id } from "@instantdb/react";
import type { TradingStrategy } from "@/types/strategies";
import { useMemo, useEffect, useState } from "react";

// Fallback to localStorage when not authenticated
const STORAGE_KEY_PREFIX = "lumotrade_strategy_";

// Get or create a guest user ID for non-authenticated users
function getGuestUserId(): string {
  if (typeof window === "undefined") return "guest";

  let guestId = localStorage.getItem("lumotrade_guest_id");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("lumotrade_guest_id", guestId);
  }
  return guestId;
}

/**
 * Custom hook for managing selected trading strategies
 * Uses InstantDB when authenticated, localStorage as fallback
 */
export function useSelectedStrategy(symbol: string) {
  const { user, isLoading: authLoading } = useUser();
  const [localStrategy, setLocalStrategy] = useState<TradingStrategy | null>(
    null
  );
  const [localLoading, setLocalLoading] = useState(true);

  const effectiveUserId = user?.id || getGuestUserId();
  const upperSymbol = symbol.toUpperCase();

  // Query selected strategies from InstantDB
  const {
    data,
    isLoading: dbLoading,
    error,
  } = db.useQuery(
    symbol
      ? {
          selectedStrategies: {
            $: {
              where: {
                userId: effectiveUserId,
                symbol: upperSymbol,
              },
            },
          },
        }
      : null
  );

  const strategies = data?.selectedStrategies || [];
  const strategyRecord = strategies[0];

  // Load from localStorage on mount (fallback for guest users)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(
        `${STORAGE_KEY_PREFIX}${upperSymbol}`
      );
      if (stored) {
        const parsed = JSON.parse(stored) as TradingStrategy;
        setLocalStrategy(parsed);
        console.log("✅ Loaded strategy from localStorage:", upperSymbol);
      }
    } catch (e) {
      console.error("Failed to load strategy from localStorage:", e);
    } finally {
      setLocalLoading(false);
    }
  }, [upperSymbol]);

  // Parse the saved strategy from InstantDB
  const dbStrategy = useMemo(() => {
    if (!strategyRecord?.strategyData) return null;
    try {
      return JSON.parse(strategyRecord.strategyData) as TradingStrategy;
    } catch (e) {
      console.error("Failed to parse saved strategy from DB:", e);
      return null;
    }
  }, [strategyRecord]);

  // Prefer InstantDB strategy, fallback to localStorage
  const savedStrategy = dbStrategy || localStrategy;

  const saveStrategy = async (strategy: TradingStrategy) => {
    const now = Date.now();

    console.log("💾 Saving strategy:", {
      symbol: upperSymbol,
      userId: effectiveUserId,
      hasUser: !!user,
      strategyName: strategy.name,
    });

    try {
      // Always save to localStorage as backup
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${upperSymbol}`,
          JSON.stringify(strategy)
        );
        setLocalStrategy(strategy);
        console.log("✅ Saved to localStorage");
      }

      // Save to InstantDB
      if (strategyRecord) {
        await db.transact([
          db.tx.selectedStrategies[strategyRecord.id].update({
            strategyData: JSON.stringify(strategy),
            updatedAt: now,
          }),
        ]);
        console.log("✅ Updated in InstantDB");
      } else {
        await db.transact([
          db.tx.selectedStrategies[id()].update({
            userId: effectiveUserId,
            symbol: upperSymbol,
            strategyData: JSON.stringify(strategy),
            createdAt: now,
            updatedAt: now,
          }),
        ]);
        console.log("✅ Created in InstantDB");
      }
    } catch (e) {
      console.error("❌ Error saving strategy:", e);
      throw e;
    }
  };

  const clearStrategy = async () => {
    console.log("🗑️ Clearing strategy:", upperSymbol);

    try {
      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${upperSymbol}`);
        setLocalStrategy(null);
        console.log("✅ Cleared from localStorage");
      }

      // Clear from InstantDB
      if (strategyRecord) {
        await db.transact([
          db.tx.selectedStrategies[strategyRecord.id].delete(),
        ]);
        console.log("✅ Cleared from InstantDB");
      }
    } catch (e) {
      console.error("❌ Error clearing strategy:", e);
      throw e;
    }
  };

  return {
    savedStrategy,
    isLoading: authLoading || dbLoading || localLoading,
    error,
    saveStrategy,
    clearStrategy,
    isSaving: false, // InstantDB is optimistic, no loading state needed
  };
}
