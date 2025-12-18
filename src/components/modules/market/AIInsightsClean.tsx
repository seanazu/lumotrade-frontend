"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketInsights } from "@/hooks/useMarketInsights";

interface AIInsightsCleanProps {
  stories: any[];
  technicalData?: any;
  mlPrediction?: any;
  className?: string;
}

export const AIInsightsClean: FC<AIInsightsCleanProps> = ({
  stories,
  technicalData,
  mlPrediction,
  className,
}) => {
  const { data: insights, isLoading, error } = useMarketInsights(
    stories,
    technicalData,
    mlPrediction
  );

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("bg-card border border-border rounded-xl p-6", className)}
      >
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              AI analyzing market...
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !insights) {
    return null;
  }

  // Combine all insights into organized sections
  const allInsights = [
    ...(insights.keyTakeaways || []).map(text => ({ text, type: 'takeaway' })),
    ...(insights.suggestions || []).map(text => ({ text, type: 'suggestion' })),
    ...(insights.risks || []).map(text => ({ text, type: 'risk' })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}
    >
      <div className="p-6">
        {/* Header - Simple and Clean */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              AI Market Intelligence
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded text-[10px] font-medium text-primary">
                <Sparkles className="w-2.5 h-2.5" />
                GPT-5.1
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Professional analysis for today's trading
            </p>
          </div>
        </div>

        {/* Market Summary - Clean Typography */}
        {insights.summary && (
          <div className="mb-5 pb-5 border-b border-border">
            <p className="text-sm leading-relaxed text-foreground/90">
              {insights.summary}
            </p>
          </div>
        )}

        {/* All Insights - Single Column, Clean List */}
        <div className="space-y-3">
          {allInsights.slice(0, 8).map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 group"
            >
              <div className="mt-1 flex-shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                {insight.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer - Minimal */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            AI-generated insights • Not financial advice
          </p>
        </div>
      </div>
    </motion.div>
  );
};

