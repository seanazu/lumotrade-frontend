"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StunningMarketHeroProps {
  indexes: any[];
  topGainers?: any[];
  topLosers?: any[];
  vix?: number;
}

export const StunningMarketHero: FC<StunningMarketHeroProps> = ({
  indexes,
  topGainers = [],
  topLosers = [],
  vix,
}) => {
  const mainIndexes = indexes.filter(idx => 
    ['SPY', 'QQQ', 'DIA', 'IWM'].includes(idx.symbol)
  ).slice(0, 4);

  const avgChange = mainIndexes.length > 0
    ? mainIndexes.reduce((sum, idx) => sum + (idx.changePercent || 0), 0) / mainIndexes.length
    : 0;

  const isMarketUp = avgChange >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Main Market Card - Large */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-card/80 border border-border shadow-2xl"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                {isMarketUp ? (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-up/20 to-up/10">
                    <TrendingUp className="w-6 h-6 text-up" />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-down/20 to-down/10">
                    <TrendingDown className="w-6 h-6 text-down" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Market Today</h3>
                  <p className={cn(
                    "text-3xl md:text-4xl font-bold",
                    isMarketUp ? "text-up" : "text-down"
                  )}>
                    {isMarketUp ? "+" : ""}{avgChange.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-sm rounded-full border border-border">
              <motion.div
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-foreground">LIVE</span>
            </div>
          </div>

          {/* Major Indexes Grid */}
          <div className="grid grid-cols-2 gap-3">
            {mainIndexes.map((index, i) => {
              const isPositive = (index.changePercent || 0) >= 0;
              return (
                <motion.div
                  key={index.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-background/40 backdrop-blur-sm hover:bg-background/60 border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{index.name}</p>
                      <p className="text-xl font-bold font-mono text-foreground">
                        ${index.price?.toFixed(2)}
                      </p>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-up" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-down" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-semibold font-mono",
                      isPositive ? "text-up" : "text-down"
                    )}>
                      {isPositive ? "+" : ""}{index.changePercent?.toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isPositive ? "+" : ""}{index.change?.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Market Movers & VIX */}
      <div className="lg:col-span-5 space-y-4">
        {/* VIX Fear Gauge */}
        {vix !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Fear & Greed</h4>
                </div>
                <span className="text-xs text-muted-foreground">VIX Index</span>
              </div>
              
              <div className="flex items-end gap-4">
                <div>
                  <p className={cn(
                    "text-4xl font-bold",
                    vix > 25 ? "text-down" : vix < 15 ? "text-up" : "text-muted-foreground"
                  )}>
                    {vix.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vix > 25 ? "High Fear" : vix < 15 ? "Low Fear" : "Neutral"}
                  </p>
                </div>
                
                {/* Visual Bar */}
                <div className="flex-1 h-20 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-full bg-muted/20 rounded-t-lg overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min((vix / 50) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "absolute bottom-0 left-0 right-0 rounded-t-lg",
                        vix > 25 ? "bg-gradient-to-t from-down to-down/50" :
                        vix < 15 ? "bg-gradient-to-t from-up to-up/50" :
                        "bg-gradient-to-t from-primary to-primary/50"
                      )}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-muted-foreground px-1">
                    <span>0</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Market Movers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border border-border shadow-lg overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Top Movers</h4>
            </div>

            <div className="space-y-3">
              {/* Top Gainer */}
              {topGainers[0] && (
                <div className="flex items-center justify-between p-3 bg-up/5 rounded-lg border border-up/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-up" />
                      <span className="font-semibold text-sm text-foreground">
                        {topGainers[0].symbol}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ${topGainers[0].price?.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-up">
                    +{topGainers[0].changesPercentage?.toFixed(1)}%
                  </span>
                </div>
              )}

              {/* Top Loser */}
              {topLosers[0] && (
                <div className="flex items-center justify-between p-3 bg-down/5 rounded-lg border border-down/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-3.5 h-3.5 text-down" />
                      <span className="font-semibold text-sm text-foreground">
                        {topLosers[0].symbol}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ${topLosers[0].price?.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-down">
                    {topLosers[0].changesPercentage?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

