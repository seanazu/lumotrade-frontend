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
      <div className="text-3xl font-bold mb-1">{date}</div>
      <div className="text-sm mb-4 opacity-90">{timing}</div>
      <div className="flex gap-6">
        <div>
          <div className="text-[10px] opacity-70 uppercase mb-1">Estimate</div>
          <div className="font-mono font-bold text-lg">{estimate}</div>
        </div>
        <div>
          <div className="text-[10px] opacity-70 uppercase mb-1">Actual</div>
          <div className="font-mono font-bold text-lg">{actual}</div>
        </div>
      </div>
    </div>
  );
}
