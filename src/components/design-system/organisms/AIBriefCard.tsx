"use client";

import { Sparkles, MessageSquare, Activity, Zap, Bitcoin } from "lucide-react";

interface AIBriefCardProps {
  onChatClick: () => void;
}

/**
 * AI Brief Card Component
 * Displays AI-generated market insights with neon border effect
 */
export function AIBriefCard({ onChatClick }: AIBriefCardProps) {
  return (
    <div className="relative neon-border-card w-full lg:w-96 xl:w-[380px] 2xl:w-[420px] flex-shrink-0 mb-1.5">
      <div className="w-full h-full min-h-[550px] sm:min-h-[600px] lg:min-h-[641px] bg-card border border-border rounded-2xl lg:rounded-[23px] overflow-hidden">
        {/* Gradient blur effect at top right */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-100 pointer-events-none z-0"
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            filter: "blur(20px)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-indigo-500">
                  AI Brief
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5px]">
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Main Insight */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
              Tech Sector Leading Broad Market Rally
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Semiconductor earnings are driving major indices higher. VIX
              dropping below 15 suggests renewed risk-on appetite for Q4.
            </p>
          </div>

          {/* Market Sentiment */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-muted/30 dark:bg-white/5 border border-border dark:border-white/5 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">
                  Market Sentiment
                </span>
                <span className="text-xs font-bold text-emerald-500">
                  Bullish (78)
                </span>
              </div>
              <div className="h-2 bg-muted dark:bg-white/10 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "78%",
                    background:
                      "linear-gradient(to right, rgb(99, 102, 241), rgb(16, 185, 129))",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Fear</span>
                <span>Neutral</span>
                <span>Greed</span>
              </div>
            </div>
          </div>

          {/* Key Drivers */}
          <div className="mb-4 sm:mb-6">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 sm:mb-4">
              Key Drivers
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      Semiconductors
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Earnings beat exp.
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-500 flex-shrink-0">
                  +4.2%
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      Energy
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Oil stabilizing
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-500 flex-shrink-0">
                  +1.1%
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Bitcoin className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      Crypto
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ETF rumors
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-500 flex-shrink-0">
                  +2.8%
                </div>
              </div>
            </div>
          </div>

          {/* Click to chat button */}
          <div className="mt-auto pt-2">
            <button
              onClick={onChatClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/20 hover:border-indigo-500/30 transition-all group cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-indigo-400">
                Click to chat with AI
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

