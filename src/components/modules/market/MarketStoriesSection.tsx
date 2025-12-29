"use client";

import { type FC, useMemo, memo } from "react";
import { Newspaper } from "lucide-react";
import { GlassCard } from "@/components/design-system/atoms/GlassCard";
import { MarketStory } from "@/resources/mock-data/indexes";
import { SentimentBreakdown, AISummary, StoryCard } from "./story-components";

interface MarketStoriesSectionProps {
  stories: MarketStory[];
  summary?: string;
}

/**
 * Market Stories Section
 * Displays news stories with sentiment analysis and AI summary
 */
export const MarketStoriesSection: FC<MarketStoriesSectionProps> = memo(function MarketStoriesSection({
  stories,
  summary,
}) {
  // Sort stories: high importance first, then by sentiment
  const sortedStories = useMemo(() => {
    return [...stories].sort((a, b) => {
      // High importance first
      if (a.importance === "high" && b.importance !== "high") return -1;
      if (b.importance === "high" && a.importance !== "high") return 1;
      return 0;
    });
  }, [stories]);

  return (
    <GlassCard className="p-4 sm:p-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="truncate">Market News & Events</span>
        </h2>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {stories.length} articles
        </span>
      </div>

      {/* Sentiment Breakdown */}
      <SentimentBreakdown stories={stories} />

      {/* AI Summary */}
      {summary && <AISummary summary={summary} />}

      {/* Scrollable Stories List */}
      <div className="relative">
        {/* Fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10" />

        {/* Stories container */}
        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {sortedStories.map((story, index) => {
            // Only show "why matters" for top story with clear sentiment
            const isTopStory = index === 0 && story.importance === "high";
            const hasClearSentiment = story.sentiment !== "neutral";

            return (
              <StoryCard
                key={index}
                story={story}
                index={index}
                isHighlighted={isTopStory}
                showWhyMatters={isTopStory && hasClearSentiment}
              />
            );
          })}
        </div>
      </div>

      {/* Show more indicator */}
      {stories.length > 3 && (
        <p className="text-center text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          Scroll to see all {stories.length} stories • Updated every 15 minutes
        </p>
      )}
    </GlassCard>
  );
});

MarketStoriesSection.displayName = "MarketStoriesSection";
