"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import dynamic from "next/dynamic";
import { queryClient } from "@/lib/tanstack-query/queryClient";
import { AppShell } from "@/components/design-system/organisms";

// Dynamic import for heavy market overview container
const MarketOverviewContainer = dynamic(
  () =>
    import("@/features/market-overview").then((mod) => ({
      default: mod.MarketOverviewContainer,
    })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading market data...
        </div>
      </div>
    ),
  }
);

/**
 * Home Page
 * Main entry point for the market overview dashboard
 */
export default function Home() {
  const [isAIBriefOpen, setIsAIBriefOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell
        alertCount={0}
        userEmail="user@example.com"
        onChatClick={() => setIsAIBriefOpen(true)}
      >
        <MarketOverviewContainer />
      </AppShell>
    </QueryClientProvider>
  );
}
