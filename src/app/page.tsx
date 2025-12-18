"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/tanstack-query/queryClient";
import {
  AppShell,
  AIChatSidebar,
  AIBriefCard,
  PredictionsSection,
  AssetCardsSection,
  ChartsSection,
  NewsSection,
  CalendarSection,
  ResearchSection,
} from "@/components/design-system/organisms";
import {
  MarketStatusBar,
  PageHeader,
} from "@/components/design-system/molecules";
import { useTodayPrediction } from "@/hooks/useMLBackend";

interface MarketOverviewPageProps {
  isAIBriefOpen: boolean;
  setIsAIBriefOpen: (open: boolean) => void;
}

function MarketOverviewPage({
  isAIBriefOpen,
  setIsAIBriefOpen,
}: MarketOverviewPageProps) {
  const { data: predictions, isLoading: predictionsLoading } =
    useTodayPrediction();

  return (
    <>
      <div className="min-h-screen bg-background relative">
        <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 relative z-10">
          {/* Page Header */}
          <PageHeader
            title="Market Overview"
            subtitle="Global markets are open. Volume is up +12% vs 30-day avg."
            isLive
          />

          {/* Market Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MarketStatusBar />
          </motion.div>

          {/* Asset Cards */}
          <AssetCardsSection />

          {/* AI Model Predictions */}
          <PredictionsSection
            predictions={predictions || []}
            isLoading={predictionsLoading}
          />

          {/* Charts and AI Brief */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 pb-2"
          >
            <ChartsSection />
            <AIBriefCard onChatClick={() => setIsAIBriefOpen(true)} />
          </motion.div>

          {/* Bottom Sections: News, Calendar, Research */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pb-8"
          >
            <NewsSection />
            <CalendarSection />
            <ResearchSection />
          </motion.div>
        </div>
      </div>

      {/* AI Chat Sidebar */}
      <AIChatSidebar
        isOpen={isAIBriefOpen}
        onClose={() => setIsAIBriefOpen(false)}
      />
    </>
  );
}

export default function Home() {
  const [isAIBriefOpen, setIsAIBriefOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell
        alertCount={0}
        userEmail="user@example.com"
        onChatClick={() => setIsAIBriefOpen(true)}
      >
        <MarketOverviewPage
          isAIBriefOpen={isAIBriefOpen}
          setIsAIBriefOpen={setIsAIBriefOpen}
        />
      </AppShell>
    </QueryClientProvider>
  );
}
