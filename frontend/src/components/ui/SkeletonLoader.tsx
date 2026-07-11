import { cn } from '@/lib/cn'
import { Skeleton } from './Skeleton'

interface SkeletonLoaderProps {
  type?: 'card' | 'metric' | 'list' | 'chart' | 'text'
  count?: number
  className?: string
}

export function SkeletonLoader({ type = 'card', count = 1, className }: SkeletonLoaderProps) {
  const items = Array.from({ length: count })

  const renderSkeleton = () => {
    switch (type) {
      case 'metric':
        return (
          <div className="rounded-2xl border border-line bg-card/50 p-6 shadow-card space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        )
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-6 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        )
      case 'chart':
        return (
          <div className="rounded-2xl border border-line bg-card/50 p-6 shadow-card space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
            <div className="h-[200px] flex items-end gap-3 pt-6">
              {Array.from({ length: 12 }).map((_, i) => {
                const heights = ['h-1/3', 'h-1/2', 'h-2/3', 'h-3/4', 'h-1/2', 'h-5/6', 'h-1/3', 'h-2/3', 'h-full', 'h-3/4', 'h-1/2', 'h-2/3']
                return (
                  <Skeleton key={i} className={cn('w-full rounded-t-lg', heights[i % heights.length])} />
                )
              })}
            </div>
          </div>
        )
      case 'text':
        return (
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )
      case 'card':
      default:
        return (
          <div className="rounded-2xl border border-line bg-card/50 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
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
  }

  return (
    <div className={cn(count > 1 ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : '', className)}>
      {items.map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}
