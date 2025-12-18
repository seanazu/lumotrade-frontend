"use client";

import { type FC } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  DollarSign,
  Building2,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EconomicEvent {
  id: string;
  name: string;
  date: string;
  time?: string;
  impact: "high" | "medium" | "low";
  category: "fed" | "employment" | "inflation" | "earnings" | "other";
  previous?: string;
  forecast?: string;
  description?: string;
}

interface UpcomingEventsProps {
  events: EconomicEvent[];
  isLoading?: boolean;
  className?: string;
}

const categoryConfig = {
  fed: {
    icon: Building2,
    label: "Fed",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  employment: {
    icon: Briefcase,
    label: "Jobs",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  inflation: {
    icon: TrendingUp,
    label: "Inflation",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  earnings: {
    icon: DollarSign,
    label: "Earnings",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  other: {
    icon: BarChart3,
    label: "Data",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
  },
};

const impactConfig = {
  high: {
    label: "High Impact",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  medium: {
    label: "Medium",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  low: {
    label: "Low",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
  },
};

function formatEventDate(dateStr: string): { day: string; month: string; relative: string } {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const day = date.getDate().toString();
  const month = date.toLocaleDateString("en-US", { month: "short" });

  let relative = "";
  if (date.toDateString() === today.toDateString()) {
    relative = "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    relative = "Tomorrow";
  } else {
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    relative = `In ${daysUntil} days`;
  }

  return { day, month, relative };
}

const EventCard: FC<{ event: EconomicEvent; index: number }> = ({ event, index }) => {
  const category = categoryConfig[event.category];
  const impact = impactConfig[event.impact];
  const { day, month, relative } = formatEventDate(event.date);
  const CategoryIcon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex gap-3 p-3 rounded-lg border transition-colors hover:bg-surface-3/50",
        event.impact === "high" ? "border-red-500/20" : "border-border"
      )}
    >
      {/* Date */}
      <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
        <span className="text-2xs text-muted-foreground uppercase">{month}</span>
        <span className="text-xl font-bold">{day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-sm line-clamp-1">{event.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("flex items-center gap-1 text-2xs", category.color)}>
                <CategoryIcon className="h-3 w-3" />
                {category.label}
              </span>
              {event.time && (
                <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </span>
              )}
            </div>
          </div>
          <span
            className={cn(
              "text-2xs px-1.5 py-0.5 rounded font-medium flex-shrink-0",
              impact.bg,
              impact.color
            )}
          >
            {event.impact === "high" && <AlertTriangle className="h-3 w-3 inline mr-0.5" />}
            {impact.label}
          </span>
        </div>

        {/* Forecast vs Previous */}
        {(event.previous || event.forecast) && (
          <div className="flex items-center gap-4 mt-2 text-2xs">
            {event.previous && (
              <span className="text-muted-foreground">
                Previous: <span className="font-mono font-medium">{event.previous}</span>
              </span>
            )}
            {event.forecast && (
              <span className="text-muted-foreground">
                Forecast: <span className="font-mono font-medium">{event.forecast}</span>
              </span>
            )}
          </div>
        )}

        {/* Relative date */}
        <span className="text-2xs text-primary font-medium mt-1 inline-block">
          {relative}
        </span>
      </div>
    </motion.div>
  );
};

export const UpcomingEvents: FC<UpcomingEventsProps> = ({
  events,
  isLoading,
  className,
}) => {
  // Sort by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Take next 7 events
  const displayEvents = sortedEvents.slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-2xl bg-surface-2/50 border border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Upcoming Events</h3>
        </div>
        <span className="text-2xs text-muted-foreground">Next 7 days</span>
      </div>

      {/* Events list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {displayEvents.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}
      </div>

      {events.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No upcoming events in the next 7 days
        </p>
      )}

      {/* Impact legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <span>Market-moving</span>
        </div>
        <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
          <Calendar className="h-3 w-3 text-amber-500" />
          <span>Notable</span>
        </div>
      </div>
    </motion.div>
  );
};

// Sample events data
export const SAMPLE_EVENTS: EconomicEvent[] = [
  {
    id: "1",
    name: "FOMC Meeting Minutes",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: "2:00 PM ET",
    impact: "high",
    category: "fed",
    description: "Federal Reserve meeting minutes release",
  },
  {
    id: "2",
    name: "Non-Farm Payrolls",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    time: "8:30 AM ET",
    impact: "high",
    category: "employment",
    previous: "+175K",
    forecast: "+180K",
  },
  {
    id: "3",
    name: "CPI (YoY)",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: "8:30 AM ET",
    impact: "high",
    category: "inflation",
    previous: "3.4%",
    forecast: "3.2%",
  },
  {
    id: "4",
    name: "AAPL Earnings",
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    time: "4:30 PM ET",
    impact: "medium",
    category: "earnings",
  },
  {
    id: "5",
    name: "Initial Jobless Claims",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    time: "8:30 AM ET",
    impact: "low",
    category: "employment",
    previous: "215K",
    forecast: "218K",
  },
];

export const UpcomingEventsWithData: FC<{ className?: string }> = ({ className }) => {
  return <UpcomingEvents events={SAMPLE_EVENTS} className={className} />;
};

