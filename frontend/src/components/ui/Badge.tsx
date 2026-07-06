import { cn } from '@/lib/cn'

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'coral' | 'gold'

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-500/12 text-brand-700 dark:text-brand-300 ring-brand-500/20',
  success: 'bg-success/12 text-success ring-success/20',
  warning: 'bg-warning/14 text-warning ring-warning/25',
  danger: 'bg-danger/12 text-danger ring-danger/20',
  info: 'bg-info/12 text-info ring-info/20',
  coral: 'bg-coral-400/14 text-coral-500 ring-coral-400/25',
  gold: 'bg-gold-400/16 text-gold-500 ring-gold-400/30',
  neutral: 'bg-line/70 text-ink-muted ring-line',
}

export function Badge({
  children,
  tone = 'brand',
  dot = false,
  className,
  icon,
}: {
  children: React.ReactNode
  tone?: Tone
  dot?: boolean
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  )
}
