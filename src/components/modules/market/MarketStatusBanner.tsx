"use client";

import { type FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Globe,
  TrendingUp,
  TrendingDown,
  Moon,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketStatusBannerProps {
  className?: string;
}

type MarketSession = "pre-market" | "open" | "after-hours" | "closed";

interface GlobalMarket {
  name: string;
  region: string;
  status: "open" | "closed";
  change?: number;
}

// Market session times (all in ET)
const MARKET_HOURS = {
  preMarketOpen: 4 * 60, // 4:00 AM ET
  marketOpen: 9 * 60 + 30, // 9:30 AM ET
  marketClose: 16 * 60, // 4:00 PM ET
  afterHoursClose: 20 * 60, // 8:00 PM ET
};

function getMarketSession(now: Date): MarketSession {
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = etTime.getDay();
  const minutes = etTime.getHours() * 60 + etTime.getMinutes();

  // Weekend
  if (day === 0 || day === 6) return "closed";

  if (minutes >= MARKET_HOURS.preMarketOpen && minutes < MARKET_HOURS.marketOpen) {
    return "pre-market";
  }
  if (minutes >= MARKET_HOURS.marketOpen && minutes < MARKET_HOURS.marketClose) {
    return "open";
  }
  if (minutes >= MARKET_HOURS.marketClose && minutes < MARKET_HOURS.afterHoursClose) {
    return "after-hours";
  }
  return "closed";
}

function getTimeToNextSession(now: Date): { hours: number; minutes: number; label: string } {
  const etTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = etTime.getDay();
  const currentMinutes = etTime.getHours() * 60 + etTime.getMinutes();

  let targetMinutes: number;
  let label: string;
  let daysToAdd = 0;

  // Weekend handling
  if (day === 0) {
    // Sunday - market opens Monday pre-market
    daysToAdd = 1;
    targetMinutes = MARKET_HOURS.preMarketOpen;
    label = "Pre-market opens in";
  } else if (day === 6) {
    // Saturday - market opens Monday pre-market
    daysToAdd = 2;
    targetMinutes = MARKET_HOURS.preMarketOpen;
    label = "Pre-market opens in";
  } else if (currentMinutes < MARKET_HOURS.preMarketOpen) {
    targetMinutes = MARKET_HOURS.preMarketOpen;
    label = "Pre-market opens in";
  } else if (currentMinutes < MARKET_HOURS.marketOpen) {
    targetMinutes = MARKET_HOURS.marketOpen;
    label = "Market opens in";
  } else if (currentMinutes < MARKET_HOURS.marketClose) {
    targetMinutes = MARKET_HOURS.marketClose;
    label = "Market closes in";
  } else if (currentMinutes < MARKET_HOURS.afterHoursClose) {
    targetMinutes = MARKET_HOURS.afterHoursClose;
    label = "After-hours ends in";
  } else {
    // After 8 PM - next day pre-market
    if (day === 5) {
      // Friday after hours - Monday pre-market
      daysToAdd = 3;
    } else {
      daysToAdd = 1;
    }
    targetMinutes = MARKET_HOURS.preMarketOpen;
    label = "Pre-market opens in";
  }

  let diffMinutes = targetMinutes - currentMinutes + daysToAdd * 24 * 60;
  if (diffMinutes < 0) diffMinutes += 24 * 60;

  return {
    hours: Math.floor(diffMinutes / 60),
    minutes: diffMinutes % 60,
    label,
  };
}

// Approximate global market status based on current time
function getGlobalMarkets(now: Date): GlobalMarket[] {
  const utcHour = now.getUTCHours();

  // Simplified market hours (approximate)
  const isAsiaOpen = utcHour >= 0 && utcHour < 8; // ~9AM-5PM Tokyo
  const isEuropeOpen = utcHour >= 7 && utcHour < 16; // ~8AM-4:30PM London
  const isUSOpen = utcHour >= 14 && utcHour < 21; // ~9:30AM-4PM ET

  return [
    {
      name: "Asia",
      region: "Tokyo",
      status: isAsiaOpen ? "open" : "closed",
      change: isAsiaOpen ? 0.3 : undefined,
    },
    {
      name: "Europe",
      region: "London",
      status: isEuropeOpen ? "open" : "closed",
      change: isEuropeOpen ? -0.2 : undefined,
    },
    {
      name: "US",
      region: "New York",
      status: isUSOpen ? "open" : "closed",
      change: isUSOpen ? 0.5 : undefined,
    },
  ];
}

const sessionConfig = {
  "pre-market": {
    icon: Sunrise,
    label: "Pre-Market",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  open: {
    icon: Sun,
    label: "Market Open",
    color: "text-up",
    bg: "bg-up/10",
    border: "border-up/30",
  },
  "after-hours": {
    icon: Sunset,
    label: "After-Hours",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  closed: {
    icon: Moon,
    label: "Market Closed",
    color: "text-muted-foreground",
    bg: "bg-muted/10",
    border: "border-border",
  },
};

export const MarketStatusBanner: FC<MarketStatusBannerProps> = ({ className }) => {
  const [now, setNow] = useState(new Date());
  const [session, setSession] = useState<MarketSession>("closed");
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, label: "" });
  const [globalMarkets, setGlobalMarkets] = useState<GlobalMarket[]>([]);

  useEffect(() => {
    const update = () => {
      const currentTime = new Date();
      setNow(currentTime);
      setSession(getMarketSession(currentTime));
      setCountdown(getTimeToNextSession(currentTime));
      setGlobalMarkets(getGlobalMarkets(currentTime));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const config = sessionConfig[session];
  const SessionIcon = config.icon;

  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 rounded-xl border backdrop-blur-sm",
        config.bg,
        config.border,
        className
      )}
    >
      {/* Market Status */}
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <SessionIcon className={cn("h-4 w-4", config.color)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold text-sm", config.color)}>
              {config.label}
            </span>
            {session === "open" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-up opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-up" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{currentTime} ET</span>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2/50">
        <span className="text-xs text-muted-foreground">{countdown.label}</span>
        <span className="font-mono text-sm font-semibold">
          {countdown.hours}h {countdown.minutes}m
        </span>
      </div>

      {/* Global Markets */}
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4 text-muted-foreground mr-2" />
        {globalMarkets.map((market) => (
          <div
            key={market.name}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs",
              market.status === "open"
                ? "bg-up/10 text-up"
                : "bg-muted/50 text-muted-foreground"
            )}
          >
            <span className="font-medium">{market.name}</span>
            {market.status === "open" && market.change !== undefined && (
              <>
                {market.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="font-mono">
                  {market.change >= 0 ? "+" : ""}
                  {market.change.toFixed(1)}%
                </span>
              </>
            )}
            {market.status === "closed" && (
              <span className="text-2xs opacity-60">Closed</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

