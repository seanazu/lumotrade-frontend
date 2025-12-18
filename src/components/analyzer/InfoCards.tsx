"use client";

export function InfoCards() {
  return (
    <div className="bg-card border-b border-border">
      <div className="px-6 py-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {/* AI Thesis Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">AI Thesis</h3>
              <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                Bullish
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
              Dominance in data center AI chips remains unchallenged. Demand
              outstripping supply through 202...
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Updated 1h ago</span>
              <button className="text-primary hover:underline">Ask AI →</button>
            </div>
          </div>

          {/* Key Levels Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Key Levels</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Resistance 2
                </span>
                <span className="text-sm font-bold font-mono text-red-500">
                  $480.00
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Resistance 1
                </span>
                <span className="text-sm font-bold font-mono text-red-500">
                  $465.50
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Support 1
                </span>
                <span className="text-sm font-bold font-mono text-emerald-500">
                  $450.20
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Support 2
                </span>
                <span className="text-sm font-bold font-mono text-emerald-500">
                  $432.00
                </span>
              </div>
            </div>
          </div>

          {/* Catalysts Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-purple-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Catalysts</h3>
            </div>
            <div className="space-y-2">
              <div className="p-2 rounded bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">Q3 Earnings</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-bold uppercase">
                    High
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Q4 - Est. EPS $2.38
                </span>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">
                    AI Summit Keynote
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase">
                    Low
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Q4 - Product announcements
                </span>
              </div>
            </div>
          </div>

          {/* Risk Profile Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Risk Profile</h3>
              <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase">
                Medium
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    Volatility (Beta 1.82)
                  </span>
                  <span className="text-[10px] font-bold text-amber-500">
                    High
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-amber-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    Short Interest
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500">
                    Low
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Fundamentals Card */}
          <div className="w-64 bg-background rounded-lg border border-border p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-xs">Fundamentals</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  Mkt Cap
                </div>
                <div className="text-sm font-bold">114T</div>
                <div className="text-[9px] text-muted-foreground">110.4</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  Div Yield
                </div>
                <div className="text-sm font-bold">0.03%</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  P/E
                </div>
                <div className="text-sm font-bold">42M</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
