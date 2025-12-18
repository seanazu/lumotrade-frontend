"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, TrendingUp, Minus } from "lucide-react";
import { useEconomicCalendar } from "@/hooks/useEconomicCalendar";
import { cn } from "@/lib/utils";

export const EconomicCalendarWidget: FC = () => {
  const { data: events, isLoading } = useEconomicCalendar();

  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case "high":
        return {
          label: "High",
          color: "text-down",
          bgColor: "bg-down/10",
          icon: AlertCircle,
        };
      case "medium":
        return {
          label: "Med",
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          icon: TrendingUp,
        };
      default:
        return {
          label: "Low",
          color: "text-muted-foreground",
          bgColor: "bg-muted/20",
          icon: Minus,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return {
        day: "Today",
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return {
        day: "Tomorrow",
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } else {
      return {
        day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Economic Calendar</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">This Week</span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      )}

      {/* Events List */}
      {!isLoading && events && events.length > 0 && (
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
          {events.slice(0, 6).map((event, index) => {
            const impactConfig = getImpactConfig(event.impact);
            const ImpactIcon = impactConfig.icon;
            const { day, time } = formatDate(event.date);

            return (
              <motion.div
                key={`${event.event}-${event.date}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-2.5 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex items-start gap-2">
                  {/* Impact Indicator */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded flex-shrink-0",
                      impactConfig.bgColor
                    )}
                  >
                    <ImpactIcon className={cn("h-3 w-3", impactConfig.color)} />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {event.event}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-semibold">{day}</span>
                          <span>•</span>
                          <span>{time}</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0",
                          impactConfig.bgColor,
                          impactConfig.color
                        )}
                      >
                        {impactConfig.label}
                      </span>
                    </div>

                    {/* Previous/Estimate */}
                    {(event.previous || event.estimate) && (
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        {event.previous && (
                          <span className="text-muted-foreground">
                            Prev: <span className="font-mono">{event.previous}</span>
                          </span>
                        )}
                        {event.estimate && (
                          <span className="text-muted-foreground">
                            Est: <span className="font-mono">{event.estimate}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State - Should not show now as hook returns sample data */}
      {!isLoading && (!events || events.length === 0) && (
        <div className="text-center py-6">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
          <p className="text-xs font-medium text-muted-foreground mb-1">
            No upcoming events
          </p>
          <p className="text-[10px] text-muted-foreground">
            Check back later
          </p>
        </div>
      )}
    </div>
  );
};

