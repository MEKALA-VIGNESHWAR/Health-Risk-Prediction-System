import { Link } from 'react-router-dom'
import { Droplet, HeartPulse, TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { RiskSummary } from '@/features/dashboard/metrics'

const LEVEL_TONE: Record<string, 'success' | 'warning' | 'coral' | 'danger' | 'neutral'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'coral',
  CRITICAL: 'danger',
}

const CONFIG = {
  diabetes: { title: 'Diabetes Risk', icon: Droplet, accent: 'text-brand-600 bg-brand-500/10' },
  heart: { title: 'Heart Risk', icon: HeartPulse, accent: 'text-coral-500 bg-coral-400/12' },
} as const

function trendMeta(summary: RiskSummary) {
  if (summary.trend === 'improving')
    return { icon: TrendingDown, text: `Down ${Math.abs(summary.delta)}pts`, cls: 'text-success' }
  if (summary.trend === 'worsening')
    return { icon: TrendingUp, text: `Up ${Math.abs(summary.delta)}pts`, cls: 'text-danger' }
  if (summary.trend === 'stable')
    return { icon: Minus, text: 'Stable', cls: 'text-ink-subtle' }
  return null
}

export function RiskCard({ summary }: { summary: RiskSummary }) {
  const cfg = CONFIG[summary.kind]
  const Icon = cfg.icon
  const tone = LEVEL_TONE[summary.level] ?? 'neutral'
  const trend = trendMeta(summary)

  return (
    <Card interactive padding="lg" className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={cn('grid h-11 w-11 place-items-center rounded-xl', cfg.accent)}>
            <Icon className="h-5.5 w-5.5" />
          </span>
          <div>
            <h3 className="font-semibold text-ink">{cfg.title}</h3>
            {summary.hasData ? (
              <p className="text-xs text-ink-subtle">
                {summary.count} {summary.count === 1 ? 'check' : 'checks'} on record
              </p>
            ) : (
              <p className="text-xs text-ink-subtle">No checks yet</p>
            )}
          </div>
        </div>
        {summary.hasData && <Badge tone={tone}>{summary.level}</Badge>}
      </div>

      {summary.hasData ? (
        <>
          <div className="mt-5 flex items-end gap-2">
            <span className="font-display text-4xl font-extrabold leading-none text-ink">
              {summary.latestRisk}
              <span className="text-xl text-ink-muted">%</span>
            </span>
            {trend && (
              <span className={cn('mb-1 flex items-center gap-1 text-xs font-semibold', trend.cls)}>
                <trend.icon className="h-3.5 w-3.5" />
                {trend.text}
              </span>
            )}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                tone === 'success' && 'bg-success',
                tone === 'warning' && 'bg-warning',
                tone === 'coral' && 'bg-coral-400',
                tone === 'danger' && 'bg-danger',
                tone === 'neutral' && 'bg-ink-subtle',
              )}
              style={{ width: `${summary.latestRisk}%` }}
            />
          </div>
        </>
      ) : (
        <div className="mt-5">
          <p className="text-sm text-ink-muted">
            Run a {summary.kind} risk check to see your personalized report and trends.
          </p>
          <Link
            to="/predictions"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Run a check <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </Card>
  )
}
