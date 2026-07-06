import { cn } from '@/lib/cn'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
} as const

export function Avatar({
  name,
  src,
  size = 'md',
  className,
  ring = false,
}: {
  name: string
  src?: string | null
  size?: keyof typeof SIZES
  className?: string
  ring?: boolean
}) {
  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-semibold text-white',
        'bg-brand-gradient shadow-soft',
        ring && 'ring-2 ring-brand-500/25 ring-offset-2 ring-offset-bg',
        SIZES[size],
        className,
      )}
      aria-hidden={!!src}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="tracking-wide">{initials(name)}</span>
      )}
    </div>
  )
}
