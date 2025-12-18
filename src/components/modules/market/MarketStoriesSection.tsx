"use client";

import { type FC, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Newspaper,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
} from "lucide-react";
import { GlassCard } from "@/components/design-system/atoms/GlassCard";
import { Badge } from "@/components/design-system/atoms/Badge";
import { MarketStory } from "@/resources/mock-data/indexes";
import { cn } from "@/lib/utils";

interface MarketStoriesSectionProps {
  stories: MarketStory[];
  summary?: string;
}

// Sentiment breakdown component
const SentimentBreakdown: FC<{ stories: MarketStory[] }> = ({ stories }) => {
  const breakdown = useMemo(() => {
    const bullish = stories.filter((s) => s.sentiment === "bullish").length;
    const bearish = stories.filter((s) => s.sentiment === "bearish").length;
    const neutral = stories.filter((s) => s.sentiment === "neutral").length;
    const total = stories.length;

    return {
      bullish,
      bearish,
      neutral,
      bullishPct: total > 0 ? Math.round((bullish / total) * 100) : 0,
      bearishPct: total > 0 ? Math.round((bearish / total) * 100) : 0,
      neutralPct: total > 0 ? Math.round((neutral / total) * 100) : 0,
    };
  }, [stories]);

  const overallSentiment =
    breakdown.bullish > breakdown.bearish + 2
      ? "bullish"
      : breakdown.bearish > breakdown.bullish + 2
      ? "bearish"
      : "mixed";

  return (
    <div className="mb-4 p-4 rounded-lg bg-surface-2 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-muted-foreground" />
          News Sentiment Today
        </h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            overallSentiment === "bullish" && "bg-up/10 text-up",
            overallSentiment === "bearish" && "bg-down/10 text-down",
            overallSentiment === "mixed" && "bg-muted text-muted-foreground"
          )}
        >
          {overallSentiment === "bullish"
            ? "Overall Positive"
            : overallSentiment === "bearish"
            ? "Overall Negative"
            : "Mixed Signals"}
        </span>
      </div>

      {/* Visual bar */}
      <div className="h-3 rounded-full overflow-hidden bg-surface-3 flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.bullishPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-up h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.neutralPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="bg-muted h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.bearishPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="bg-down h-full"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-up" />
          <span className="text-muted-foreground">
            Bullish ({breakdown.bullish})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MinusCircle className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            Neutral ({breakdown.neutral})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-down" />
          <span className="text-muted-foreground">
            Bearish ({breakdown.bearish})
          </span>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        {overallSentiment === "bullish"
          ? "More positive news today suggests market optimism. This often correlates with upward price movement."
          : overallSentiment === "bearish"
          ? "More negative news today suggests market caution. This often correlates with downward price pressure."
          : "News sentiment is mixed today, suggesting uncertainty. Watch for clearer trends to develop."}
      </p>
    </div>
  );
};

// Individual story card with enhanced explanation
const StoryCard: FC<{ story: MarketStory; index: number; isHighlighted?: boolean; showWhyMatters?: boolean }> = ({
  story,
  index,
  isHighlighted,
  showWhyMatters = false,
}) => {
  const handleClick = () => {
    if (story.url) {
      window.open(story.url, "_blank", "noopener,noreferrer");
    }
  };

  // Only show "why this matters" for explicitly highlighted stories (top 1-2)
  const whyMatters = useMemo(() => {
    if (!showWhyMatters) return null;
    
    // Generate context based on sentiment
    if (story.sentiment === "bullish") {
      return "This positive development could support market gains.";
    } else if (story.sentiment === "bearish") {
      return "This may create downward pressure on markets.";
    }
    return null; // Don't show anything for neutral - it's not informative
  }, [story.sentiment, showWhyMatters]);

  // Default images for fallback (matching backend)
  const DEFAULT_IMAGES = [
    "/images/news/market-default-1.svg",
    "/images/news/market-default-2.svg",
    "/images/news/market-default-3.svg",
  ];

  // Get consistent default image based on title
  const getDefaultImage = (title: string) => {
    const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return DEFAULT_IMAGES[hash % DEFAULT_IMAGES.length];
  };

  const imageUrl = story.image && story.image.trim() ? story.image : getDefaultImage(story.title);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={handleClick}
      className={cn(
        "p-4 rounded-lg border transition-all duration-200",
        story.url && "cursor-pointer",
        isHighlighted
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border hover:border-primary/50",
        story.sentiment === "bullish" && "border-l-2 border-l-up",
        story.sentiment === "bearish" && "border-l-2 border-l-down"
      )}
    >
      <div className="flex gap-3">
        {/* Image thumbnail - always shown with fallback */}
        <div className="hidden sm:block flex-shrink-0 w-24 h-20 rounded-md overflow-hidden bg-surface-2">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              // On error, show default image
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("/images/news/market-default")) {
                target.src = getDefaultImage(story.title);
              }
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
              {story.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge
                variant={
                  story.sentiment === "bullish"
                    ? "bullish"
                    : story.sentiment === "bearish"
                    ? "bearish"
                    : "neutral"
                }
                className="text-2xs"
              >
                {story.sentiment === "bullish" ? (
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                ) : story.sentiment === "bearish" ? (
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                ) : (
                  <Minus className="h-2.5 w-2.5 mr-0.5" />
                )}
                {story.sentiment}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {story.summary}
          </p>

          {/* Why This Matters */}
          {whyMatters && (
            <p
              className={cn(
                "text-xs font-medium mb-2 px-2 py-1 rounded inline-block",
                story.sentiment === "bullish" && "bg-up/10 text-up",
                story.sentiment === "bearish" && "bg-down/10 text-down",
                story.sentiment === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              💡 {whyMatters}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-2xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">{story.source}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {story.time}
              </span>
            </div>
            {story.url && (
              <span className="flex items-center gap-1 text-primary/60">
                <ExternalLink className="h-3 w-3" />
                <span>Read more</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MarketStoriesSection: FC<MarketStoriesSectionProps> = ({
  stories,
  summary,
}) => {
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
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20 overflow-hidden"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary mb-1">
                What AI Sees in Today's News
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        </motion.div>
      )}

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
};
