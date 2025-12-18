"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Newspaper, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketOverviewHeroProps {
  indexes: any[];
  stories: any[];
  aiSummary?: string;
  isLoading?: boolean;
}

export const MarketOverviewHero: FC<MarketOverviewHeroProps> = ({
  indexes,
  stories,
  aiSummary,
  isLoading,
}) => {
  // Calculate market sentiment
  const mainIndexes = indexes.filter(idx => 
    ['SPY', 'QQQ', 'DIA', 'IWM'].includes(idx.symbol)
  );
  
  const avgChange = mainIndexes.length > 0
    ? mainIndexes.reduce((sum, idx) => sum + (idx.changePercent || 0), 0) / mainIndexes.length
    : 0;
  
  const isMarketUp = avgChange >= 0;
  const marketMood = avgChange > 1 ? "Strong Rally" : avgChange > 0.5 ? "Positive" : avgChange > -0.5 ? "Mixed" : avgChange > -1 ? "Weak" : "Selling Pressure";
  
  // News sentiment
  const bullishNews = stories.filter(s => s.sentiment === "bullish").length;
  const totalNews = stories.length || 1;
  const newsPositivity = Math.round((bullishNews / totalNews) * 100);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-background via-background to-primary/5 border border-border rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted/20 rounded w-1/3"></div>
          <div className="h-4 bg-muted/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-background via-background to-primary/5 border border-border rounded-2xl p-6 md:p-8 shadow-lg"
    >
      <div className="flex flex-col gap-6">
        {/* Top Row - Market Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isMarketUp ? (
                <div className="p-2.5 rounded-xl bg-up/10">
                  <TrendingUp className="h-6 w-6 text-up" />
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-down/10">
                  <TrendingDown className="h-6 w-6 text-down" />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Market is {isMarketUp ? "Up" : "Down"} Today
                </h1>
                <p className="text-sm text-muted-foreground">
                  {marketMood} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Key Stat */}
          <div className="flex gap-4">
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1">Avg Movement</div>
              <div className={cn(
                "text-2xl font-bold font-mono",
                isMarketUp ? "text-up" : "text-down"
              )}>
                {isMarketUp ? "+" : ""}{avgChange.toFixed(2)}%
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1">News Sentiment</div>
              <div className={cn(
                "text-2xl font-bold font-mono",
                newsPositivity >= 60 ? "text-up" : newsPositivity >= 40 ? "text-muted-foreground" : "text-down"
              )}>
                {newsPositivity}%
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Simple Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* What's Happening */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Market Status</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mainIndexes.filter(idx => (idx.changePercent || 0) >= 0).length} out of {mainIndexes.length} major indexes are positive. 
              {avgChange > 0 ? " Investors are buying today." : " Investors are cautious today."}
            </p>
          </div>

          {/* Top News */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Latest News</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {stories[0]?.title || "Markets reacting to economic data and corporate earnings."}
            </p>
          </div>

          {/* AI Summary */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">AI Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {aiSummary || "Our AI model is analyzing current market conditions to provide trading insights."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

