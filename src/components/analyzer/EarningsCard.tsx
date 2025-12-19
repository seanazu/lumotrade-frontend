"use client";

interface EarningsCardProps {
  date: string;
  timing: string;
  estimate: string;
  actual: string;
}

export function EarningsCard({
  date,
  timing,
  estimate,
  actual,
}: EarningsCardProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate days until earnings
  const daysUntil = (dateStr: string) => {
    try {
      const earningsDate = new Date(dateStr);
      const today = new Date();
      const diffTime = earningsDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const days = daysUntil(date);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs opacity-80 uppercase tracking-wide">
          Upcoming Earnings
        </span>
        <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{formatDate(date)}</div>
      <div className="text-sm mb-3 opacity-90 flex items-center gap-2">
        <span>{timing}</span>
        {days !== null && (
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
            {days > 0 ? `${days} days` : days === 0 ? "Today" : "Past"}
          </span>
        )}
      </div>
      <div className="flex gap-6">
        <div>
          <div className="text-[10px] opacity-70 uppercase mb-1">
            Estimated EPS
          </div>
          <div className="font-mono font-bold text-lg">{estimate}</div>
        </div>
        <div>
          <div className="text-[10px] opacity-70 uppercase mb-1">Last EPS</div>
          <div className="font-mono font-bold text-lg">{actual}</div>
        </div>
      </div>
    </div>
  );
}
