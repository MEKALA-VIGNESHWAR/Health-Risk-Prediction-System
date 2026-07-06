import { cn } from '@/lib/cn'

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      className={cn('animate-spin text-brand-500', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Full-area loading state with an optional label. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  )
}
