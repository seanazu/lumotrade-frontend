"use client";

import { Skeleton } from "@/components/design-system/atoms/Skeleton";

/**
 * Loading skeleton for the analyzer page
 * Shows placeholder content while data is loading
 */
export function AnalyzerSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Skeleton */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-4 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="w-64 h-32 rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-[500px] rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
