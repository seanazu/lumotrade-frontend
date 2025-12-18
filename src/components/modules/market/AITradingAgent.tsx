"use client";

import { type FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, TrendingUp, TrendingDown, Sparkles, ChevronRight, AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AITradingAgentProps {
  marketData: {
    isMarketUp: boolean;
    avgChange: number;
    mood: string;
    topGainer?: string;
    topLoser?: string;
    vix?: number;
  };
  predictions: any[];
  aiInsights: any;
  isLoading?: boolean;
}

export const AITradingAgent: FC<AITradingAgentProps> = ({
  marketData,
  predictions,
  aiInsights,
  isLoading,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Generate conversational messages
  const messages = generateMessages(marketData, predictions, aiInsights);

  useEffect(() => {
    if (messageIndex < messages.length - 1) {
      const timer = setTimeout(() => {
        setMessageIndex(messageIndex + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowRecommendations(true), 300);
    }
  }, [messageIndex, messages.length]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse mb-2" />
            <div className="h-3 w-48 bg-muted/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-primary/5 via-background to-background border border-border rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10">
        {/* AI Agent Header */}
        <div className="flex items-start gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative flex-shrink-0"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.div>

          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Your AI Trading Assistant
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium text-primary">
                  <Sparkles className="w-3 h-3" />
                  Live
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzing {predictions.length} predictions • Market sentiment • Real-time insights
              </p>
            </motion.div>
          </div>
        </div>

        {/* Conversational Messages */}
        <div className="space-y-3 mb-6">
          <AnimatePresence mode="sync">
            {messages.slice(0, messageIndex + 1).map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "p-4 rounded-xl border backdrop-blur-sm",
                  message.type === "success" && "bg-up/5 border-up/20",
                  message.type === "warning" && "bg-yellow-500/5 border-yellow-500/20",
                  message.type === "info" && "bg-primary/5 border-primary/20",
                  message.type === "error" && "bg-down/5 border-down/20"
                )}
              >
                <div className="flex items-start gap-3">
                  {message.type === "success" && <CheckCircle className="w-5 h-5 text-up flex-shrink-0 mt-0.5" />}
                  {message.type === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                  {message.type === "info" && <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
                  {message.type === "error" && <TrendingDown className="w-5 h-5 text-down flex-shrink-0 mt-0.5" />}
                  
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-foreground font-medium">
                      {message.text}
                    </p>
                    {message.subtext && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.subtext}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Recommendations */}
        <AnimatePresence>
          {showRecommendations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recommended Actions
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getRecommendations(marketData, predictions).map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative bg-card hover:bg-card/80 border border-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        "p-2 rounded-lg",
                        rec.type === "buy" && "bg-up/10",
                        rec.type === "sell" && "bg-down/10",
                        rec.type === "hold" && "bg-muted/10"
                      )}>
                        {rec.icon}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between"
        >
          <p className="text-xs text-muted-foreground">
            Powered by GPT-5.1 • Updated {new Date().toLocaleTimeString()}
          </p>
          <button className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            View Full Analysis
            <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper function to generate conversational messages
function generateMessages(marketData: any, predictions: any[], aiInsights: any) {
  const messages = [];
  
  // Greeting based on market
  if (marketData.isMarketUp) {
    messages.push({
      type: "success",
      text: `Good news! The market is up ${Math.abs(marketData.avgChange).toFixed(2)}% today. ${marketData.mood} across major indices.`,
      subtext: "This is a positive sign for your portfolio."
    });
  } else {
    messages.push({
      type: "warning",
      text: `Heads up - the market is down ${Math.abs(marketData.avgChange).toFixed(2)}% today. ${marketData.mood} detected.`,
      subtext: "Stay cautious and look for opportunities."
    });
  }

  // Model predictions
  if (predictions.length > 0) {
    const bullish = predictions.filter(p => p.direction === "UP").length;
    const bearish = predictions.filter(p => p.direction === "DOWN").length;
    
    messages.push({
      type: "info",
      text: `I've analyzed 8 major assets. ${bullish} show bullish signals, ${bearish} show bearish signals.`,
      subtext: `Top opportunity: ${predictions[0]?.ticker || "SPY"} with ${(predictions[0]?.confidence * 100 || 0).toFixed(1)}% confidence.`
    });
  }

  // Risk level based on VIX
  if (marketData.vix) {
    if (marketData.vix > 25) {
      messages.push({
        type: "error",
        text: `VIX is elevated at ${marketData.vix.toFixed(1)}. Market volatility is high - consider reducing position sizes.`,
        subtext: "Fear gauge is showing increased investor anxiety."
      });
    } else if (marketData.vix < 15) {
      messages.push({
        type: "success",
        text: `VIX is low at ${marketData.vix.toFixed(1)}. Calm market conditions - good environment for swing trades.`,
        subtext: "Low volatility favors trend-following strategies."
      });
    }
  }

  // AI summary
  if (aiInsights?.summary) {
    messages.push({
      type: "info",
      text: aiInsights.summary.slice(0, 150) + "...",
      subtext: "Click 'View Full Analysis' for detailed insights."
    });
  }

  return messages;
}

// Helper function to generate recommendations
function getRecommendations(marketData: any, predictions: any[]) {
  const recs = [];

  // Find best prediction
  const sortedPreds = [...predictions].sort((a, b) => b.confidence - a.confidence);
  if (sortedPreds[0]) {
    const pred = sortedPreds[0];
    recs.push({
      type: pred.direction === "UP" ? "buy" : "sell",
      icon: pred.direction === "UP" ? 
        <TrendingUp className="w-4 h-4 text-up" /> : 
        <TrendingDown className="w-4 h-4 text-down" />,
      title: `${pred.direction === "UP" ? "Buy" : "Short"} ${pred.ticker}`,
      description: `${(pred.confidence * 100).toFixed(0)}% confidence • Expected ${Math.abs(pred.q50 * 100 || 0).toFixed(1)}% move`
    });
  }

  // Market condition advice
  if (marketData.isMarketUp) {
    recs.push({
      type: "hold",
      icon: <CheckCircle className="w-4 h-4 text-primary" />,
      title: "Hold Long Positions",
      description: "Market momentum is positive. Let winners run and trail stops."
    });
  } else {
    recs.push({
      type: "hold",
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      title: "Raise Cash",
      description: "Consider taking profits on extended positions and building cash reserves."
    });
  }

  // Risk management
  recs.push({
    type: "hold",
    icon: <Info className="w-4 h-4 text-muted-foreground" />,
    title: "Review Your Portfolio",
    description: "Check your risk exposure and rebalance if needed based on today's signals."
  });

  return recs;
}

