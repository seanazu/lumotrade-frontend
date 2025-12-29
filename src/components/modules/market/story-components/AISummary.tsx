"use client";

import { memo, type FC } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface AISummaryProps {
  summary: string;
}

/**
 * AI Summary Component
 * Displays AI-generated summary of market news
 */
export const AISummary: FC<AISummaryProps> = memo(function AISummary({ summary }) {
  return (
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
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      </div>
    </motion.div>
  );
});

AISummary.displayName = "AISummary";

