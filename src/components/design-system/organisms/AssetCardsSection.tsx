"use client";

import { motion } from "framer-motion";
import { AssetCard } from "@/components/design-system/molecules/AssetCard";
import { useMarketAssets } from "@/hooks/useMarketAssets";

/**
 * Asset Cards Section Component
 * Displays a grid of asset cards with animation
 * Fetches and manages its own data
 */
export function AssetCardsSection() {
  const { data: liveAssets, isLoading } = useMarketAssets();

  // Use live data or fallback to defaults
  const assets = liveAssets || [
    {
      name: "S&P 500",
      symbol: "SPY",
      price: 450.25,
      changePercent: 0.75,
      icon: "📊",
      type: "stock" as const,
    },
    {
      name: "Bitcoin",
      symbol: "BTC/USD",
      price: 43250.0,
      changePercent: 1.85,
      icon: "₿",
      type: "crypto" as const,
    },
    {
      name: "EUR/USD",
      symbol: "Forex",
      price: 1.0875,
      changePercent: -0.12,
      icon: "€",
      type: "forex" as const,
    },
    {
      name: "Crude Oil",
      symbol: "WTI",
      price: 78.45,
      changePercent: 0.65,
      icon: "🛢",
      type: "commodity" as const,
    },
  ];

  // Convert icon string to JSX element
  const assetsWithJSXIcons = assets.map((asset) => ({
    ...asset,
    icon: (
      <span
        className={
          asset.type === "crypto"
            ? "text-lg font-bold"
            : asset.type === "forex"
              ? "text-lg font-bold"
              : "text-sm"
        }
      >
        {asset.icon}
      </span>
    ),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4"
    >
      {assetsWithJSXIcons.map((asset, index) => (
        <AssetCard key={asset.symbol} {...asset} delay={0.2 + index * 0.05} />
      ))}
    </motion.div>
  );
}
