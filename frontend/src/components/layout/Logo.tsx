import { cn } from '@/lib/cn'

export function PulseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pulseGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34C88A" />
          <stop offset="1" stopColor="#0B7A5A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#pulseGrad)" />
      <path
        d="M32 15c-1.2 0-2.2.9-2.4 2.1L27 31.8l-2.4-6.4a2.4 2.4 0 0 0-4.5.1l-2.2 6.4H14a2.3 2.3 0 1 0 0 4.6h5.5c1 0 1.9-.66 2.2-1.6l.7-2 3 8.2a2.4 2.4 0 0 0 4.6-.3l2.4-14.8 2.2 20a2.4 2.4 0 0 0 4.7.2l2.5-9.7h2c1.3 0 2.3-1 2.3-2.3a2.3 2.3 0 0 0-2.3-2.3h-3.8c-1.1 0-2 .74-2.3 1.8l-.8 3-2.4-22A2.4 2.4 0 0 0 32 15Z"
        fill="#fff"
      />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <PulseMark className="h-9 w-9 shrink-0 rounded-xl shadow-soft" />
      {!compact && (
        <div className="leading-none">
          <span className="font-display text-[17px] font-extrabold tracking-tight text-ink">
            Pulse<span className="text-brand-600">Mind</span>
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
            AI Health Intelligence
          </span>
        </div>
      )}
    </div>
  )
}
