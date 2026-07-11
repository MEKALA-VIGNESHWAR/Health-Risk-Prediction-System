import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean
  intensity?: 'light' | 'normal' | 'strong'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const INTENSITY = {
  light: 'bg-surface/40 backdrop-blur-sm',
  normal: 'glass shadow-card',
  strong: 'glass-strong shadow-lift',
} as const

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, interactive = false, intensity = 'normal', padding = 'md', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl border border-line/60 transition-all duration-300',
          INTENSITY[intensity],
          PADDING[padding],
          interactive && 'cursor-pointer hover:border-brand-500/30 hover:shadow-lift',
          className
        )}
        whileHover={interactive ? { y: -4, scale: 1.01 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
GlassCard.displayName = 'GlassCard'
