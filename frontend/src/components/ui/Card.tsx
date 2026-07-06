import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'solid' | 'glass' | 'outline' | 'gradient'
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const VARIANTS = {
  solid: 'bg-card border border-line shadow-card',
  glass: 'glass shadow-card',
  outline: 'bg-transparent border border-line',
  gradient:
    'border border-brand-500/15 bg-gradient-to-br from-brand-50 to-cream-100 dark:from-brand-500/10 dark:to-surface shadow-card',
} as const

const PADDING = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' } as const

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'solid', interactive, padding = 'md', children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-2xl',
        VARIANTS[variant],
        PADDING[padding],
        interactive &&
          'cursor-pointer transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
Card.displayName = 'Card'

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-base font-semibold leading-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
