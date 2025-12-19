"use client";

import { motion } from "framer-motion";
import { useMarketNews } from "@/hooks/useMarketNews";

/**
 * News Section Component
 * Displays live news stories with hover effects
 * Fetches and manages its own data
 */
export function NewsSection() {
  const { data: newsData } = useMarketNews(20);
  const displayStories = (newsData?.stories || []).slice(0, 8);

  return (
    <div className="bg-card border border-border rounded-2xl lg:rounded-[23px] p-4 sm:p-6 lg:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h3 className="font-bold text-base text-foreground">Live News</h3>
        </div>
        <button className="text-xs text-indigo-400 hover:text-indigo-500">
          View All
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted">
        {displayStories.map((story, i) => (
          <motion.div
            key={i}
            whileHover={{ x: 4 }}
            className="pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0 cursor-pointer transition-all duration-200 hover:border-primary/30"
          >
            <div className="text-xs text-indigo-400 mb-1.5">
              {story.source} • {new Date().getHours() - i}m ago
            </div>
            <h4 className="text-sm font-semibold text-foreground line-clamp-2">
              {story.title}
            </h4>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
