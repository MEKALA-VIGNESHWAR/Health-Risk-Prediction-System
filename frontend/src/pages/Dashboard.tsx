import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Stethoscope,
  Activity,
  LineChart,
  ArrowRight,
  Droplets,
  Moon,
  HeartPulse,
  Apple,
  User as UserIcon,
  AlertTriangle,
  ClipboardList,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { Badge, Button, Card, SkeletonCard } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { useDashboard } from '@/features/dashboard/useDashboard'
import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { TrendsChart } from '@/components/dashboard/TrendsChart'
import { RiskCard } from '@/components/dashboard/RiskCard'
import type { Recommendation } from '@/features/dashboard/metrics'
import { cn } from '@/lib/cn'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const REC_ICON = {
  activity: Activity,
  apple: Apple,
  droplet: Droplets,
  moon: Moon,
  heart: HeartPulse,
  user: UserIcon,
  alert: AlertTriangle,
} as const

const PRIORITY_TONE = {
  high: 'danger',
  medium: 'warning',
  low: 'brand',
} as const

const QUICK_ACTIONS = [
  { to: '/assistant', icon: Sparkles, title: 'Ask AI', tone: 'text-brand-600 bg-brand-500/10' },
  { to: '/symptoms', icon: Stethoscope, title: 'Symptoms', tone: 'text-coral-500 bg-coral-400/12' },
  { to: '/predictions', icon: Activity, title: 'New Check', tone: 'text-info bg-info/10' },
  { to: '/analytics', icon: LineChart, title: 'Analytics', tone: 'text-gold-500 bg-gold-400/14' },
]

const TIPS = [
  { icon: Droplets, title: 'Hydrate early', text: 'A glass of water within 30 min of waking kick-starts metabolism.', tone: 'text-info bg-info/10' },
  { icon: Moon, title: 'Protect sleep', text: '7–9 hours supports heart health and steady blood sugar.', tone: 'text-brand-600 bg-brand-500/10' },
  { icon: HeartPulse, title: 'Move after meals', text: 'A brisk 10-min walk helps blunt glucose spikes.', tone: 'text-coral-500 bg-coral-400/12' },
]

export function Dashboard() {
  const { displayName } = useAuth()
  const { loading, metrics, data } = useDashboard()
  const firstName = displayName.split(' ')[0]

  return (
    <div className="space-y-6">
      {/* ── Hero + Health Score ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="none" className="relative overflow-hidden border-brand-500/15">
          <div className="absolute inset-0 bg-brand-gradient" />
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-coral-400/20 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 p-6 text-white sm:p-8 lg:flex-row lg:justify-between">
            <div className="max-w-lg text-center lg:text-left">
              <p className="text-sm font-medium text-brand-50/80">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-[34px]">
                {greeting()}, {firstName}.
              </h1>
              <p className="mt-2 text-brand-50/90">
                Here's a snapshot of your health today. {metrics && metrics.totalPredictions === 0
                  ? 'Run your first risk check to unlock personalized insights.'
                  : 'Keep up the great work on your wellness journey.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/assistant">
                  <Button variant="coral" leftIcon={<Sparkles className="h-4 w-4" />}>Ask AuraHealth</Button>
                </Link>
                <Link to="/predictions">
                  <Button
                    className="!bg-white/15 !text-white ring-1 ring-inset ring-white/25 hover:!bg-white/25"
                    leftIcon={<Activity className="h-4 w-4" />}
                  >
                    New risk check
                  </Button>
                </Link>
              </div>
            </div>

            {/* Health score ring */}
            <div className="shrink-0 rounded-3xl bg-white/10 p-5 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              {loading || !metrics ? (
                <div className="grid h-[168px] w-[168px] place-items-center">
                  <div className="h-32 w-32 animate-pulse-soft rounded-full bg-white/20" />
                </div>
              ) : (
                <div className="text-center">
                  <div className="[&_p]:!text-white">
                    <ScoreRing score={metrics.healthScore} label={metrics.scoreLabel} />
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-brand-50/80">
                    Health Score
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Stat strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          loading={loading}
          icon={<ClipboardList className="h-5 w-5" />}
          label="Total checks"
          value={metrics ? String(metrics.totalPredictions) : '0'}
          tone="text-brand-600 bg-brand-500/10"
        />
        <StatCard
          loading={loading}
          icon={<Bell className="h-5 w-5" />}
          label="Unread alerts"
          value={metrics ? String(metrics.unreadAlerts) : '0'}
          tone="text-coral-500 bg-coral-400/12"
        />
        <StatCard
          loading={loading}
          icon={<UserIcon className="h-5 w-5" />}
          label="Profile"
          value={metrics ? `${metrics.profileCompletion}%` : '—'}
          tone="text-info bg-info/10"
          to="/profile"
        />
        <StatCard
          loading={loading}
          icon={<HeartPulse className="h-5 w-5" />}
          label="Health score"
          value={metrics ? String(metrics.healthScore) : '—'}
          tone="text-gold-500 bg-gold-400/14"
        />
      </div>

      {/* ── Risk cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading || !metrics ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <RiskCard summary={metrics.diabetes} />
            <RiskCard summary={metrics.heart} />
          </>
        )}
      </div>

      {/* ── Trends + Recommendations ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                <LineChart className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">Risk Trends</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Diabetes
              </span>
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-coral-400" /> Heart
              </span>
            </div>
          </div>
          {loading ? (
            <div className="skeleton h-[260px] rounded-xl" />
          ) : metrics && metrics.timeline.length > 0 ? (
            <TrendsChart points={metrics.timeline} />
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                <LineChart className="h-6 w-6" />
              </div>
              <p className="mt-3 font-semibold text-ink">No trend data yet</p>
              <p className="mt-1 max-w-xs text-sm text-ink-muted">
                Your risk history will chart here after you run a couple of checks.
              </p>
            </div>
          )}
        </Card>

        {/* AI Recommendations */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-soft">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-ink">AI Recommendations</h3>
          </div>
          {loading || !metrics ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {metrics.recommendations.map((r) => (
                <RecRow key={r.id} rec={r} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Recent alerts + Tips + Quick actions ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent alerts */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-400/12 text-coral-500">
              <Bell className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-ink">Recent Alerts</h3>
          </div>
          {loading ? (
            <div className="space-y-2.5">{[0, 1].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : data && data.alerts.length > 0 ? (
            <div className="space-y-2.5">
              {data.alerts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface/50 p-3">
                  <span
                    className={cn(
                      'mt-1 h-2 w-2 shrink-0 rounded-full',
                      a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'bg-danger' : 'bg-warning',
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{a.title}</p>
                    <p className="line-clamp-2 text-xs text-ink-muted">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-success/10 text-success">
                <HeartPulse className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">All clear</p>
              <p className="mt-0.5 text-xs text-ink-muted">No health alerts right now.</p>
            </div>
          )}
        </Card>

        {/* Today's tips */}
        <Card padding="lg">
          <h3 className="mb-4 font-semibold text-ink">Today's Health Tips</h3>
          <div className="space-y-3">
            {TIPS.map((t) => {
              const Icon = t.icon
              return (
                <div key={t.title} className="flex gap-3">
                  <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', t.tone)}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.title}</p>
                    <p className="text-xs text-ink-muted">{t.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Quick actions */}
        <Card padding="lg">
          <h3 className="mb-4 font-semibold text-ink">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface/50 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"
                >
                  <span className={cn('grid h-11 w-11 place-items-center rounded-xl', a.tone)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-ink">{a.title}</span>
                </Link>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  loading,
  icon,
  label,
  value,
  tone,
  to,
}: {
  loading: boolean
  icon: React.ReactNode
  label: string
  value: string
  tone: string
  to?: string
}) {
  const inner = (
    <Card interactive={!!to} padding="md" className="h-full">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', tone)}>{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-subtle">{label}</p>
          {loading ? (
            <div className="skeleton mt-1 h-6 w-12 rounded" />
          ) : (
            <p className="font-display text-2xl font-bold leading-tight text-ink">{value}</p>
          )}
        </div>
        {to && <ChevronRight className="ml-auto h-4 w-4 text-ink-subtle" />}
      </div>
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function RecRow({ rec }: { rec: Recommendation }) {
  const Icon = REC_ICON[rec.icon]
  const tone = PRIORITY_TONE[rec.priority]
  return (
    <div className="flex gap-3 rounded-xl border border-line bg-surface/50 p-3 transition hover:border-brand-300">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">{rec.title}</p>
          {rec.priority === 'high' && <Badge tone={tone}>Priority</Badge>}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{rec.detail}</p>
      </div>
    </div>
  )
}
