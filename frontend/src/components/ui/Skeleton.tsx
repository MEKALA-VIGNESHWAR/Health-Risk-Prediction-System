import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

/** A ready-made shimmering card placeholder. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-card p-6', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}
