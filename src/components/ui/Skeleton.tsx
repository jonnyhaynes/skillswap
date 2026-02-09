import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200',
        className
      )}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" aria-hidden="true">
      <div className="h-1.5 bg-slate-200 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16 ml-auto" />
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
