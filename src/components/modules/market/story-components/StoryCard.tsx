"use client";

import { useMemo, memo, type FC } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/design-system/atoms/Badge";
import { MarketStory } from "@/resources/mock-data/indexes";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  story: MarketStory;
  index: number;
  isHighlighted?: boolean;
  showWhyMatters?: boolean;
}

// Default images for fallback
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

/**
 * Story Card Component
 * Individual news story card with sentiment and details
 */
export const StoryCard: FC<StoryCardProps> = memo(function StoryCard({
  story,
  index,
  isHighlighted,
  showWhyMatters = false,
}) {
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

  const imageUrl =
    story.image && story.image.trim() ? story.image : getDefaultImage(story.title);

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
});

StoryCard.displayName = "StoryCard";

