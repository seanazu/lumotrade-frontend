"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useEconomicCalendar } from "@/hooks/useEconomicCalendar";
import { cn } from "@/lib/utils";

/**
 * Calendar Section Component
 * Displays economic calendar events
 * Fetches and manages its own data
 */
export function CalendarSection() {
  const { data: calendarEvents } = useEconomicCalendar();
  const displayEvents = (calendarEvents || []).slice(0, 8);

  return (
    <div className="bg-card border border-border rounded-2xl lg:rounded-[23px] p-4 sm:p-6 lg:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-foreground" />
          <h3 className="font-bold text-base text-foreground">Calendar</h3>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground">
          Today
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted">
        {displayEvents.map((event, i) => {
          const eventDate = new Date(event.date);
          return (
            <div key={i} className="flex gap-3 sm:gap-4">
              <div className="w-14 h-14 rounded border border-border flex flex-col items-center justify-center flex-shrink-0 bg-card">
                <div className="text-[9px] text-muted-foreground font-medium">
                  {eventDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="text-[10px] text-foreground font-semibold mt-0.5">
                  {eventDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-7 rounded bg-indigo-500/20" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {event.event}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold",
                      event.impact === "high"
                        ? "bg-red-500/10 text-red-400"
                        : event.impact === "medium"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-green-500/10 text-green-400"
                    )}
                  >
                    {event.impact === "high"
                      ? "High Impact"
                      : event.impact === "medium"
                        ? "Med Impact"
                        : "Low Impact"}
                  </span>
                  {event.impactScore && (
                    <span className="text-foreground font-semibold">
                      {event.impactScore.toFixed(1)}/10
                    </span>
                  )}
                  {event.estimate && (
                    <span className="text-foreground font-medium">
                      {event.estimate}
                    </span>
                  )}
                  {event.previous && <span>Prev: {event.previous}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
