"use client";

import { type FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
  Zap,
  Activity,
  BarChart3,
  Clock,
  ChevronRight,
  Target,
  Shield,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/design-system/atoms/Button";
import { useTechnicalAnalysis } from "@/hooks/useTechnicalAnalysis";
import { useMarketNews } from "@/hooks/useMarketNews";
import { cn } from "@/lib/utils";

interface MarketPulseHeroProps {
  className?: string;
}

// Animated background mesh gradient
const AnimatedBackground: FC<{ sentiment: "bullish" | "bearish" | "neutral" }> = ({ sentiment }) => {
  const colors = {
    bullish: {
      primary: "from-emerald-500/20 via-green-500/10",
      secondary: "from-teal-500/15 via-cyan-500/5",
      accent: "bg-emerald-500",
    },
    bearish: {
      primary: "from-red-500/20 via-rose-500/10",
      secondary: "from-orange-500/15 via-amber-500/5",
      accent: "bg-red-500",
    },
    neutral: {
      primary: "from-indigo-500/20 via-purple-500/10",
      secondary: "from-blue-500/15 via-violet-500/5",
      accent: "bg-indigo-500",
    },
  };

  const c = colors[sentiment];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className={cn("absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br opacity-60 blur-3xl", c.primary)}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={cn("absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-tl opacity-40 blur-3xl", c.secondary)}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, -80, 0],
          scale: [1, 1.1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
    </div>
  );
};

// Stunning animated confidence gauge
const ConfidenceGauge: FC<{ 
  confidence: number; 
  direction: "UP" | "DOWN" | "neutral";
  sentiment: "bullish" | "bearish" | "neutral";
}> = ({ confidence, direction, sentiment }) => {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedConfidence(confidence), 300);
    return () => clearTimeout(timer);
  }, [confidence]);

  const isUp = direction === "UP";
  const isNeutral = direction === "neutral";
  
  const colors = {
    bullish: { ring: "#22c55e", glow: "0 0 40px rgba(34, 197, 94, 0.4)" },
    bearish: { ring: "#ef4444", glow: "0 0 40px rgba(239, 68, 68, 0.4)" },
    neutral: { ring: "#6366f1", glow: "0 0 40px rgba(99, 102, 241, 0.4)" },
  };

  const c = colors[sentiment];
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (animatedConfidence / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-36 h-36">
        {/* Outer glow ring */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: c.glow }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border/30"
          />
          {/* Animated progress ring */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={c.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Inner decorative ring */}
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/20"
            strokeDasharray="4 4"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <span className="text-4xl font-bold font-mono" style={{ color: c.ring }}>
              {animatedConfidence}
            </span>
            <span className="text-lg text-muted-foreground">%</span>
          </motion.div>
        </div>
      </div>
      
      {/* Direction indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={cn(
          "mt-4 px-4 py-2 rounded-full flex items-center gap-2 font-semibold",
          sentiment === "bullish" && "bg-up/20 text-up",
          sentiment === "bearish" && "bg-down/20 text-down",
          sentiment === "neutral" && "bg-primary/20 text-primary"
        )}
      >
        {isUp ? <TrendingUp className="h-4 w-4" /> : isNeutral ? <Minus className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm">
          {isUp ? "BULLISH" : isNeutral ? "NEUTRAL" : "BEARISH"}
        </span>
      </motion.div>
    </div>
  );
};

// Live pulse indicator
const LivePulse: FC = () => (
  <div className="flex items-center gap-2">
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Live</span>
  </div>
);

// Metric card component
const MetricCard: FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}> = ({ icon: Icon, label, value, subtext, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative p-4 rounded-2xl bg-surface-2/50 backdrop-blur-sm border border-border/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          trend === "up" && "bg-up/10",
          trend === "down" && "bg-down/10",
          !trend && "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            trend === "up" && "text-up",
            trend === "down" && "text-down",
            !trend && "text-primary"
          )} />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend === "up" && "bg-up/10 text-up",
            trend === "down" && "bg-down/10 text-down"
          )}>
            {trend === "up" ? "↑" : "↓"}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold font-mono">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  </motion.div>
);

// Action item component
const ActionItem: FC<{
  icon: React.ElementType;
  text: string;
  sentiment: "bullish" | "bearish" | "neutral";
  delay?: number;
}> = ({ icon: Icon, text, sentiment, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      sentiment === "bullish" && "bg-up/5 border-up/20 hover:bg-up/10",
      sentiment === "bearish" && "bg-down/5 border-down/20 hover:bg-down/10",
      sentiment === "neutral" && "bg-primary/5 border-primary/20 hover:bg-primary/10"
    )}
  >
    <div className={cn(
      "p-2 rounded-lg",
      sentiment === "bullish" && "bg-up/20",
      sentiment === "bearish" && "bg-down/20",
      sentiment === "neutral" && "bg-primary/20"
    )}>
      <Icon className={cn(
        "h-4 w-4",
        sentiment === "bullish" && "text-up",
        sentiment === "bearish" && "text-down",
        sentiment === "neutral" && "text-primary"
      )} />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </motion.div>
);

export const MarketPulseHero: FC<MarketPulseHeroProps> = ({ className }) => {
  const { data: technicalData, isLoading: techLoading, error: techError } = useTechnicalAnalysis(["SPY"]);
  const { data: newsData, isLoading: newsLoading } = useMarketNews(5);

  const summary = technicalData?.summary;
  const primaryAnalysis = technicalData?.results?.[0];
  const topStory = newsData?.stories?.[0];

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Loading state
  if (techLoading) {
    return (
      <div className={cn("relative rounded-3xl overflow-hidden bg-card border border-border", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative flex flex-col items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-muted-foreground"
          >
            AI is analyzing market conditions...
          </motion.p>
          <div className="flex gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (techError) {
    return (
      <div className={cn("rounded-3xl overflow-hidden bg-card border border-destructive/30 p-8", className)}>
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Unable to load market analysis</p>
            <p className="text-sm text-muted-foreground">Please check your API configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  const mlDirection = primaryAnalysis?.prediction?.direction;
  const confidence = primaryAnalysis?.prediction
    ? Math.round(primaryAnalysis.prediction.confidence * 100)
    : 50;
  const sentiment = primaryAnalysis?.marketSentiment || "neutral";
  const rsi = primaryAnalysis?.analysis?.rsi?.value;
  const trend = primaryAnalysis?.analysis?.trend;

  return (
    <div className={cn("relative rounded-3xl overflow-hidden", className)}>
      {/* Animated background */}
      <AnimatedBackground sentiment={sentiment} />
      
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl" />
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={cn(
                  "p-3 rounded-2xl",
                  sentiment === "bullish" && "bg-up/20",
                  sentiment === "bearish" && "bg-down/20",
                  sentiment === "neutral" && "bg-primary/20"
                )}
              >
                <Brain className={cn(
                  "h-6 w-6",
                  sentiment === "bullish" && "text-up",
                  sentiment === "bearish" && "text-down",
                  sentiment === "neutral" && "text-primary"
                )} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">Market Intelligence</h1>
                <div className="flex items-center gap-3 mt-1">
                  <LivePulse />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {currentDate} • {currentTime}
                  </span>
                </div>
              </div>
            </div>
            
            <Link href="/model-monitor">
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                Full Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Market Summary - Full Width */}
            <div className="lg:col-span-7">
              <div className="h-full flex flex-col gap-4">
                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-2xl border",
                    sentiment === "bullish" && "bg-up/5 border-up/20",
                    sentiment === "bearish" && "bg-down/5 border-down/20",
                    sentiment === "neutral" && "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl flex-shrink-0",
                      sentiment === "bullish" && "bg-up/20",
                      sentiment === "bearish" && "bg-down/20",
                      sentiment === "neutral" && "bg-primary/20"
                    )}>
                      {sentiment === "bullish" ? (
                        <TrendingUp className="h-6 w-6 text-up" />
                      ) : sentiment === "bearish" ? (
                        <TrendingDown className="h-6 w-6 text-down" />
                      ) : (
                        <Activity className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-xl font-bold mb-2",
                        sentiment === "bullish" && "text-up",
                        sentiment === "bearish" && "text-down",
                        sentiment === "neutral" && "text-primary"
                      )}>
                        {sentiment === "bullish" ? "Markets Looking Strong" :
                         sentiment === "bearish" ? "Caution Advised" :
                         "Mixed Signals Today"}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {primaryAnalysis?.plainEnglishSummary ||
                          "Our AI is processing market data. Check back shortly for insights."}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    icon={Activity}
                    label="RSI Indicator"
                    value={rsi ? rsi.toFixed(1) : "—"}
                    subtext={rsi ? (rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral") : "Loading..."}
                    trend={rsi ? (rsi > 50 ? "up" : "down") : undefined}
                    delay={0.1}
                  />
                  <MetricCard
                    icon={BarChart3}
                    label="Trend"
                    value={trend ? trend.charAt(0).toUpperCase() + trend.slice(1) : "—"}
                    subtext="Based on moving averages"
                    trend={trend === "bullish" ? "up" : trend === "bearish" ? "down" : undefined}
                    delay={0.2}
                  />
                </div>

                {/* Top Story */}
                {topStory && !newsLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-2xl bg-surface-2/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => topStory.url && window.open(topStory.url, "_blank")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">Top Story</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {topStory.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {topStory.source} • {topStory.time}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right: Action Items */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full p-5 rounded-2xl bg-surface-2/30 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Action Items</h2>
                </div>
                
                <div className="space-y-3">
                  {sentiment === "bullish" ? (
                    <>
                      <ActionItem icon={TrendingUp} text="Look for long entries" sentiment={sentiment} delay={0.1} />
                      <ActionItem icon={Target} text="Set profit targets" sentiment={sentiment} delay={0.2} />
                      <ActionItem icon={Flame} text="Momentum is strong" sentiment={sentiment} delay={0.3} />
                    </>
                  ) : sentiment === "bearish" ? (
                    <>
                      <ActionItem icon={Shield} text="Protect your positions" sentiment={sentiment} delay={0.1} />
                      <ActionItem icon={TrendingDown} text="Tighten stop-losses" sentiment={sentiment} delay={0.2} />
                      <ActionItem icon={Target} text="Wait for support" sentiment={sentiment} delay={0.3} />
                    </>
                  ) : (
                    <>
                      <ActionItem icon={Clock} text="Wait for clarity" sentiment={sentiment} delay={0.1} />
                      <ActionItem icon={Shield} text="Manage risk carefully" sentiment={sentiment} delay={0.2} />
                      <ActionItem icon={Activity} text="Monitor key levels" sentiment={sentiment} delay={0.3} />
                    </>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 pt-4 border-t border-border/50"
                >
                  <Link href="/analyzer" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                      Analyze specific stocks
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
