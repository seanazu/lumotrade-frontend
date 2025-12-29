import { Skeleton } from '@/components/design-system/atoms/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>

      {/* Info cards skeleton */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-64 h-32 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[600px] rounded-xl" />
          <Skeleton className="lg:col-span-1 h-[600px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

