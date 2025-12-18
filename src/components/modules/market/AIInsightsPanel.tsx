"use client";

import { type FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketInsights } from "@/hooks/useMarketInsights";
import { Button } from "@/components/design-system/atoms/Button";

interface AIInsightsPanelProps {
  stories: any[];
  technicalData?: any;
  mlPrediction?: any;
  className?: string;
}

export const AIInsightsPanel: FC<AIInsightsPanelProps> = ({
  stories,
  technicalData,
  mlPrediction,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    data: insights,
    isLoading,
    error,
  } = useMarketInsights(stories, technicalData, mlPrediction);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/10 rounded-2xl p-8",
          className
        )}
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-surface-2 border-t-primary animate-spin" />
              <Brain className="h-6 w-6 text-primary absolute inset-0 m-auto" />
            </div>
            <span className="text-sm text-muted-foreground">
              AI analyzing market conditions...
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !insights) {
    return null; // Silently fail - this is an enhancement, not critical
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/10 rounded-2xl overflow-hidden",
        className
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              AI Market Intelligence
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded text-xs font-medium text-primary">
                <Sparkles className="w-3 h-3" />
                ChatGPT
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time analysis powered by GPT-4
            </p>
          </div>
        </div>

        {/* Market Summary - Always Visible */}
        {insights.summary && (
          <div className="mb-6 p-5 rounded-xl bg-background/60 border-2 border-border">
            <p className="text-base leading-relaxed text-foreground">
              {insights.summary}
            </p>
          </div>
        )}

        {/* Full Details - Always Shown */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {/* Key Takeaways */}
              {insights.keyTakeaways && insights.keyTakeaways.length > 0 && (
                <div className="p-5 rounded-xl bg-up/5 border-2 border-up/20">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-up" />
                    <h3 className="font-bold text-base text-up">
                      Key Takeaways
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.keyTakeaways.map((takeaway, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-up mt-1">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trading Suggestions */}
              {insights.suggestions && insights.suggestions.length > 0 && (
                <div className="p-5 rounded-xl bg-primary/5 border-2 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-base text-primary">
                      Trading Ideas
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.suggestions.map((suggestion, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {insights.risks && insights.risks.length > 0 && (
                <div className="p-5 rounded-xl bg-down/5 border-2 border-down/20">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-down" />
                    <h3 className="font-bold text-base text-down">
                      Risk Factors
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.risks.map((risk, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-down mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand/Collapse Button */}
        {!isExpanded && (
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2 text-sm"
            >
              <ChevronDown className="h-4 w-4" />
              Show Full Analysis
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-6 pt-6 border-t border-border/50 text-center">
          AI-generated insights for informational purposes only • Not financial
          advice
        </p>
      </div>
    </motion.div>
  );
};
