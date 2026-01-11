'use client';

import { motion } from 'framer-motion';
import {
  AIBriefCard,
  PredictionsSection,
  AssetCardsSection,
  ChartsSection,
  NewsSection,
  CalendarSection,
  ResearchSection,
} from '@/components/design-system/organisms';
import { MarketStatusBar, PageHeader } from '@/components/design-system/molecules';
import { useTodayPrediction } from '@/hooks/useMLBackend';
import { useMarketStatus } from '@/hooks/useMarketStatus';

/**
 * Market Overview Container
 * Main container for the market overview dashboard showing status, predictions, charts, and news
 */
export function MarketOverviewContainer() {
  const { data: predictions, isLoading: predictionsLoading } = useTodayPrediction();
  const { data: marketStatus } = useMarketStatus();

  return (
    <div className="min-h-screen bg-background relative">
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 relative z-0">
        {/* Page Header */}
        <PageHeader
          title="Market Overview"
          subtitle={marketStatus?.subtitle || 'Loading market data...'}
          isLive={marketStatus?.isOpen}
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
        <PredictionsSection predictions={predictions || []} isLoading={predictionsLoading} />

        {/* Charts and AI Brief */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 pb-2"
        >
          <ChartsSection />
          <AIBriefCard />
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
  );
}

MarketOverviewContainer.displayName = 'MarketOverviewContainer';