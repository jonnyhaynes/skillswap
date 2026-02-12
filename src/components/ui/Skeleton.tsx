import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg skeleton-shimmer',
        className
      )}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/[0.02]" aria-hidden="true">
      {/* Category colour bar */}
      <div className="h-1 skeleton-shimmer" />

      <div className="p-6 space-y-4">
        {/* Top row: category label + badge */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-3/4 rounded-md" />

        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-5/6 rounded" />
        </div>

        {/* User row */}
        <div className="flex items-center gap-2.5 pt-4 border-t border-slate-50">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  )
}
