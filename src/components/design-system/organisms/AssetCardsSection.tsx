"use client";

import { motion } from "framer-motion";
import { AssetCard } from "@/components/design-system/molecules/AssetCard";
import { useMarketIndexes } from "@/hooks/useMarketIndexes";

/**
 * Asset Cards Section Component
 * Displays a grid of asset cards with animation
 * Fetches and manages its own data
 */
export function AssetCardsSection() {
  const { data: indexes } = useMarketIndexes();

  // Get S&P 500 data for first asset card
  const sp500 = indexes?.find((idx) => idx.symbol === "SPY") || {
    name: "S&P 500",
    symbol: "SPX",
    price: 4352.1,
    changePercent: 1.24,
  };

  // Asset cards data
  const assets = [
    {
      name: "S&P 500",
      symbol: "SPX",
      price: sp500.price,
      changePercent: sp500.changePercent || 0,
      icon: <span className="text-sm">📊</span>,
    },
    {
      name: "Bitcoin",
      symbol: "BTC/USD",
      price: 34120.5,
      changePercent: 2.63,
      icon: <span className="text-lg font-bold">₿</span>,
    },
    {
      name: "EUR/USD",
      symbol: "Forex",
      price: 1.0542,
      changePercent: -0.15,
      icon: <span className="text-lg font-bold">€</span>,
    },
    {
      name: "Crude Oil",
      symbol: "WTI",
      price: 85.4,
      changePercent: 0.9,
      icon: <span className="text-base">🛢</span>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4"
    >
      {assets.map((asset, index) => (
        <AssetCard key={asset.symbol} {...asset} delay={0.2 + index * 0.05} />
      ))}
    </motion.div>
  );
}
