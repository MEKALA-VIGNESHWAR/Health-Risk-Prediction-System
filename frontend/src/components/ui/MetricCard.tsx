import React from 'react'
import { GlassCard } from './GlassCard'
import { AnimatedCounter } from './AnimatedCounter'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface MetricCardProps {
  title: string
  value: number
  unit?: string
  icon?: React.ReactNode
  decimals?: number
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  progress?: {
    value: number
    color?: string
  }
  colorScheme?: 'brand' | 'coral' | 'gold' | 'info' | 'neutral'
  className?: string
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  unit = '',
  icon,
  decimals = 0,
  trend,
  progress,
  colorScheme = 'brand',
  className,
  onClick,
}: MetricCardProps) {
  const isInteractive = !!onClick

  const SCHEMES = {
    brand: 'text-brand-500 bg-brand-500/10 dark:bg-brand-500/20',
    coral: 'text-coral-500 bg-coral-500/10 dark:bg-coral-500/20',
    gold: 'text-gold-500 bg-gold-500/10 dark:bg-gold-500/20',
    info: 'text-info bg-info/10 dark:bg-info/20',
    neutral: 'text-ink-muted bg-line/50',
  }

  return (
    <GlassCard
      interactive={isInteractive}
      onClick={onClick}
      className={cn('relative overflow-hidden p-6', className)}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-ink-muted">{title}</span>
        {icon && (
          <div className={cn('grid h-10 w-10 place-items-center rounded-xl transition-all duration-300', SCHEMES[colorScheme])}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <AnimatedCounter
          value={value}
          decimals={decimals}
          className="text-2xl font-bold tracking-tight text-ink sm:text-3xl"
        />
        {unit && <span className="text-sm font-medium text-ink-subtle">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'flex items-center font-medium',
              trend.positive === undefined
                ? 'text-ink-muted'
                : trend.positive
                ? 'text-success'
                : 'text-danger'
            )}
          >
            {trend.positive !== undefined && (
              trend.positive ? <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" /> : <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
            )}
            {trend.value}%
          </span>
          <span className="text-ink-subtle">{trend.label}</span>
        </div>
      )}

      {progress && (
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-line/40 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500 ease-out', progress.color || 'bg-brand-500')}
              style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
            />
          </div>
        </div>
      )}
    </GlassCard>
  )
}
