import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Stethoscope,
  Activity,
  LineChart,
  Droplets,
  Moon,
  HeartPulse,
  Apple,
  User as UserIcon,
  AlertTriangle,
  ClipboardList,
  Bell,
  Pill,
  FileText,
  Check,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { Badge, Button, Card, MetricCard, SkeletonLoader, useToast, Modal, Input } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { useDashboard } from '@/features/dashboard/useDashboard'
import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { TrendsChart } from '@/components/dashboard/TrendsChart'
import { RiskCard } from '@/components/dashboard/RiskCard'
import type { Recommendation } from '@/features/dashboard/metrics'
import { cn } from '@/lib/cn'
import {
  fetchPersonalDashboard,
  fetchChartsData,
  logVitals,
  type PersonalDashboard,
  type ChartsData,
} from '@/features/dashboard/dashboardApi'
import {
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts'

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
  const { loading: initialLoading, metrics, data } = useDashboard()
  const { success, error } = useToast()
  const firstName = displayName.split(' ')[0]

  // Personal tracker & charts states
  const [personalDash, setPersonalDash] = useState<PersonalDashboard | null>(null)
  const [chartsData, setChartsData] = useState<ChartsData | null>(null)
  const [vitalsLoading, setVitalsLoading] = useState(true)
  const [chartTab, setChartTab] = useState<'risk' | 'bmi' | 'sleep' | 'sugar' | 'bp' | 'heartRate'>('risk')

  // Log Vitals Modal State
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false)
  const [logWeight, setLogWeight] = useState('')
  const [logSystolic, setLogSystolic] = useState('')
  const [logDiastolic, setLogDiastolic] = useState('')
  const [logGlucose, setLogGlucose] = useState('')
  const [logHeartRate, setLogHeartRate] = useState('')
  const [logSleep, setLogSleep] = useState('')
  const [logCaloriesC, setLogCaloriesC] = useState('')
  const [logCaloriesB, setLogCaloriesB] = useState('')
  const [logExercise, setLogExercise] = useState('')
  const [submittingVitals, setSubmittingVitals] = useState(false)

  // Details Modal state
  const [selectedReport, setSelectedReport] = useState<any | null>(null)

  const loadPersonalData = async () => {
    try {
      const [dash, charts] = await Promise.all([
        fetchPersonalDashboard(),
        fetchChartsData(),
      ])
      setPersonalDash(dash)
      setChartsData(charts)
    } catch (e) {
      console.error('Failed to load tracker logs', e)
    } finally {
      setVitalsLoading(false)
    }
  }

  useEffect(() => {
    loadPersonalData()
  }, [])

  const handleQuickWater = async (amount: number) => {
    const current = personalDash?.today?.waterIntakeMl || 0
    try {
      await logVitals({ waterIntakeMl: current + amount })
      success(`Logged +${amount}ml water!`, { title: 'Hydration Saved' })
      loadPersonalData()
    } catch (e) {
      error('Failed to log water intake.')
    }
  }

  const handleQuickExercise = async (minutes: number) => {
    const current = personalDash?.today?.exerciseMinutes || 0
    try {
      await logVitals({ exerciseMinutes: current + minutes })
      success(`Logged +${minutes}m workout!`, { title: 'Exercise Saved' })
      loadPersonalData()
    } catch (e) {
      error('Failed to log exercise.')
    }
  }

  const handleQuickSleep = async (hours: number) => {
    try {
      await logVitals({ sleepHours: hours })
      success(`Logged ${hours}h of sleep!`, { title: 'Sleep Saved' })
      loadPersonalData()
    } catch (e) {
      error('Failed to log sleep.')
    }
  }

  const handleLogVitalsSubmit = async () => {
    setSubmittingVitals(true)
    const payload: Record<string, any> = {}
    if (logWeight) payload.weightKg = parseFloat(logWeight)
    if (logSystolic) payload.systolicBp = parseInt(logSystolic)
    if (logDiastolic) payload.diastolicBp = parseInt(logDiastolic)
    if (logGlucose) payload.bloodSugar = parseInt(logGlucose)
    if (logHeartRate) payload.heartRate = parseInt(logHeartRate)
    if (logSleep) payload.sleepHours = parseFloat(logSleep)
    if (logCaloriesC) payload.caloriesConsumed = parseInt(logCaloriesC)
    if (logCaloriesB) payload.caloriesBurned = parseInt(logCaloriesB)
    if (logExercise) payload.exerciseMinutes = parseInt(logExercise)

    try {
      await logVitals(payload)
      success('Health metrics logged successfully!', { title: 'Vitals Logged' })
      setVitalsModalOpen(false)
      loadPersonalData()
      // clear inputs
      setLogWeight('')
      setLogSystolic('')
      setLogDiastolic('')
      setLogGlucose('')
      setLogHeartRate('')
      setLogSleep('')
      setLogCaloriesC('')
      setLogCaloriesB('')
      setLogExercise('')
    } catch (e) {
      error('Failed to log vitals.')
    } finally {
      setSubmittingVitals(false)
    }
  }

  const reports = useMemo(() => {
    if (!data) return []
    const list: Array<{
      id: string
      type: 'diabetes' | 'heart'
      title: string
      date: string
      timestamp: number
      riskLevel: string
      riskPercentage: number
      predictionResult: number
      featureImportance?: string
      recommendations?: string
      raw: any
    }> = []

    data.diabetes.forEach((d) => {
      list.push({
        id: d.id,
        type: 'diabetes',
        title: 'Diabetes Risk Assessment',
        date: new Date(d.predictionTimestamp || d.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        timestamp: d.predictionTimestamp || new Date(d.createdAt).getTime(),
        riskLevel: d.riskLevel,
        riskPercentage: d.riskPercentage,
        predictionResult: d.predictionResult,
        featureImportance: d.featureImportance,
        recommendations: d.recommendations,
        raw: d,
      })
    })

    data.heart.forEach((h) => {
      list.push({
        id: h.id,
        type: 'heart',
        title: 'Cardiovascular Risk Check',
        date: new Date(h.predictionTimestamp || h.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        timestamp: h.predictionTimestamp || new Date(h.createdAt).getTime(),
        riskLevel: h.riskLevel,
        riskPercentage: h.riskPercentage,
        predictionResult: h.predictionResult,
        featureImportance: h.featureImportance,
        recommendations: h.recommendations,
        raw: h,
      })
    })

    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 4)
  }, [data])

  function parseFeatureImportance(rawString?: string): Array<{ name: string; value: number }> {
    if (!rawString) return []
    try {
      const parsed = JSON.parse(rawString)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          name: item.factor || 'Unknown',
          value: Number(item.importance) || 0,
        })).sort((a, b) => b.value - a.value)
      } else if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([name, val]) => ({
          name,
          value: Number(val) || 0,
        })).sort((a, b) => b.value - a.value)
      }
    } catch (e) {
      console.error('Failed to parse feature importance', e)
    }
    return []
  }

  function parseRecommendations(rawString?: string): Array<{ emoji: string; title: string; text: string; type: string }> {
    if (!rawString) return []
    try {
      const parsed = JSON.parse(rawString)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { text: item, emoji: '⚡', title: 'Action Item', type: 'info' }
          }
          return {
            emoji: item.emoji || '⚡',
            title: item.title || 'Recommendation',
            text: item.text || item.message || '',
            type: item.type || 'info',
          }
        })
      }
    } catch (e) {
      console.error('Failed to parse recommendations', e)
    }
    return []
  }

  const parsedImportance = useMemo(() => {
    if (!selectedReport) return []
    return parseFeatureImportance(selectedReport.featureImportance)
  }, [selectedReport])

  const maxImportance = useMemo(() => {
    if (parsedImportance.length === 0) return 1
    return Math.max(...parsedImportance.map((i) => i.value), 0.01)
  }, [parsedImportance])

  const parsedRecs = useMemo(() => {
    if (!selectedReport) return []
    return parseRecommendations(selectedReport.recommendations)
  }, [selectedReport])

  const [reminders, setReminders] = useState([
    { id: 1, name: 'Metformin', dosage: '500 mg', time: '08:00 AM', taken: false },
    { id: 2, name: 'Lisinopril', dosage: '10 mg', time: '08:00 AM', taken: false },
    { id: 3, name: 'Atorvastatin', dosage: '20 mg', time: '09:00 PM', taken: false },
  ])

  const handleTakeReminder = (id: number, name: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, taken: true } : r)))
    success(`Intake of ${name} logged successfully!`, { title: 'Medication Tracked' })
  }

  // Active tracker targets
  const waterTarget = 2000
  const sleepTarget = 8.0
  const exerciseTarget = 30

  const waterToday = personalDash?.today?.waterIntakeMl || 0
  const sleepToday = personalDash?.today?.sleepHours || 0.0
  const exerciseToday = personalDash?.today?.exerciseMinutes || 0

  const waterPercent = Math.min(100, Math.round((waterToday / waterTarget) * 100))
  const sleepPercent = Math.min(100, Math.round((sleepToday / sleepTarget) * 100))
  const exercisePercent = Math.min(100, Math.round((exerciseToday / exerciseTarget) * 100))

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
                Here's a snapshot of your health today. {personalDash?.streak && personalDash.streak > 0
                  ? `You are on a ${personalDash.streak}-day health streak! Keep it up.`
                  : 'Start logging your metrics to track your weekly streak.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/assistant">
                  <Button variant="coral" leftIcon={<Sparkles className="h-4 w-4" />}>Ask PulseMind</Button>
                </Link>
                <Button
                  onClick={() => setVitalsModalOpen(true)}
                  className="!bg-white/15 !text-white ring-1 ring-inset ring-white/25 hover:!bg-white/25"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Log Health Metrics
                </Button>
              </div>
            </div>

            {/* Health score ring */}
            <div className="shrink-0 rounded-3xl bg-white/10 p-5 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              {vitalsLoading || !personalDash ? (
                <div className="grid h-[168px] w-[168px] place-items-center">
                  <div className="h-32 w-32 animate-pulse-soft rounded-full bg-white/20" />
                </div>
              ) : (
                <div className="text-center">
                  <div className="[&_p]:!text-white">
                    <ScoreRing score={personalDash.healthScore} label={personalDash.scoreLabel} />
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
      {initialLoading || !metrics ? (
        <SkeletonLoader type="metric" count={4} className="grid grid-cols-2 gap-4 lg:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            title="Total checks"
            value={metrics.totalPredictions}
            icon={<ClipboardList className="h-5 w-5" />}
            colorScheme="brand"
          />
          <MetricCard
            title="Unread alerts"
            value={metrics.unreadAlerts}
            icon={<Bell className="h-5 w-5" />}
            colorScheme="coral"
          />
          <MetricCard
            title="Logging streak"
            value={personalDash?.streak || 0}
            unit=" Days"
            icon={<TrendingUp className="h-5 w-5" />}
            colorScheme="info"
          />
          <MetricCard
            title="Health score"
            value={personalDash?.healthScore || 70}
            icon={<HeartPulse className="h-5 w-5" />}
            colorScheme="gold"
          />
        </div>
      )}

      {/* ── Risk cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {initialLoading || !metrics ? (
          <SkeletonLoader type="card" count={2} className="grid grid-cols-1 gap-4 sm:grid-cols-2" />
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
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                <LineChart className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">Health Trends</h3>
            </div>
            
            {/* Chart Tab Selector */}
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-line bg-surface p-1 text-[11px] font-bold">
              {(['risk', 'bmi', 'sleep', 'sugar', 'bp', 'heartRate'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={cn(
                    'rounded px-2.5 py-1 transition-all capitalize',
                    chartTab === tab ? 'bg-brand-500 text-white shadow-soft' : 'text-ink-subtle hover:text-ink'
                  )}
                >
                  {tab === 'risk' ? 'risks' : tab}
                </button>
              ))}
            </div>
          </div>

          {initialLoading || vitalsLoading ? (
            <div className="skeleton h-[260px] rounded-xl" />
          ) : chartTab === 'risk' ? (
            metrics && metrics.timeline.length > 0 ? (
              <TrendsChart points={metrics.timeline} />
            ) : (
              <div className="flex h-[260px] flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <LineChart className="h-6 w-6" />
                </div>
                <p className="mt-3 font-semibold text-ink">No risk trends yet</p>
                <p className="mt-1 max-w-xs text-sm text-ink-muted">Run a diabetes check to display history.</p>
              </div>
            )
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={
                  chartTab === 'bmi'
                    ? chartsData?.bmi
                    : chartTab === 'sleep'
                    ? chartsData?.sleep
                    : chartTab === 'sugar'
                    ? chartsData?.sugar
                    : chartTab === 'bp'
                    ? chartsData?.bp
                    : chartsData?.heartRate
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                {chartTab === 'bmi' && (
                  <>
                    <Area type="monotone" name="Weight (kg)" dataKey="weight" fill="#0FA574" fillOpacity={0.06} stroke="#0FA574" strokeWidth={2} />
                    <Line type="monotone" name="BMI" dataKey="bmi" stroke="#3B82F6" strokeWidth={2} />
                  </>
                )}
                {chartTab === 'sleep' && (
                  <Bar name="Sleep Duration" dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                )}
                {chartTab === 'sugar' && (
                  <Area name="Glucose (mg/dL)" type="monotone" dataKey="glucose" stroke="#FF7A59" strokeWidth={2} fill="#FF7A59" fillOpacity={0.1} />
                )}
                {chartTab === 'bp' && (
                  <>
                    <Line type="monotone" name="Systolic BP" dataKey="systolic" stroke="#E5484D" strokeWidth={2} />
                    <Line type="monotone" name="Diastolic BP" dataKey="diastolic" stroke="#FF9595" strokeWidth={2} />
                  </>
                )}
                {chartTab === 'heartRate' && (
                  <Area name="Heart Rate (bpm)" type="monotone" dataKey="heartRate" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.1} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
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
          {initialLoading || !metrics ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {metrics.recommendations.slice(0, 3).map((r) => (
                <RecRow key={r.id} rec={r} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Redesigned Information Grid: Alerts, Reports, Reminders, Tips, and Actions ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Column 1: Alerts & Reports */}
        <div className="space-y-4">
          {/* Recent Alerts */}
          <Card padding="lg">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-400/12 text-coral-500">
                <Bell className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">Recent Alerts</h3>
            </div>
            {initialLoading ? (
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

          {/* Recent Reports */}
          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <FileText className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-ink">Recent Reports</h3>
              </div>
              <Link to="/reports" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
                View all
              </Link>
            </div>
            <div className="space-y-2.5">
              {initialLoading ? (
                <>
                  <div className="h-16 w-full animate-pulse rounded-xl bg-line" />
                  <div className="h-16 w-full animate-pulse rounded-xl bg-line" />
                </>
              ) : reports.length === 0 ? (
                <div className="py-6 text-center text-xs text-ink-muted italic border border-dashed border-line rounded-xl">
                  No prediction reports found. Run a check to see explainable AI insights.
                </div>
              ) : (
                reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="w-full flex items-center justify-between rounded-xl border border-line bg-surface/50 p-3 hover:border-brand-300 transition text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{report.title}</p>
                      <p className="text-xs text-ink-muted">{report.date}</p>
                    </div>
                    <Badge
                      tone={
                        report.riskLevel === 'CRITICAL' || report.riskLevel === 'HIGH'
                          ? 'danger'
                          : report.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'brand'
                      }
                    >
                      {report.riskPercentage}%
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Column 2: Reminders & Tips */}
        <div className="space-y-4">
          {/* Daily Meds Reminders */}
          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-info/10 text-info">
                  <Pill className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-ink">Today's Schedule</h3>
              </div>
              <Link to="/reminders" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
                Manage
              </Link>
            </div>
            <div className="space-y-2.5">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl border border-line bg-surface/50 p-3 transition',
                    r.taken && 'opacity-65 border-transparent bg-surface/20'
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn('text-sm font-semibold text-ink truncate', r.taken && 'line-through')}>{r.name}</p>
                    <p className="text-xs text-ink-muted">{r.dosage} • {r.time}</p>
                  </div>
                  {r.taken ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                      <Check className="h-4.5 w-4.5" />
                    </span>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleTakeReminder(r.id, r.name)}>
                      Log
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Health Tips */}
          <Card padding="lg">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-400/15 text-gold-500">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">AI Healthy Tips</h3>
            </div>
            <div className="space-y-3">
              {TIPS.map((t, idx) => {
                const Icon = t.icon
                return (
                  <div key={idx} className="flex gap-3">
                    <span className={cn('grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg', t.tone)}>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">{t.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{t.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Column 3: Actions & Progress Stats */}
        <div className="space-y-4">
          {/* Quick Actions */}
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

          {/* Vitals Progress statistics */}
          <Card padding="lg">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Activity className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-ink">Vitals Goal Tracker</h3>
            </div>
            
            {vitalsLoading ? (
              <div className="space-y-4 py-2">
                <div className="h-8 w-full animate-pulse rounded bg-line" />
                <div className="h-8 w-full animate-pulse rounded bg-line" />
                <div className="h-8 w-full animate-pulse rounded bg-line" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Water */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-ink">
                    <span>Water Intake</span>
                    <span className="text-ink-muted">
                      {(waterToday / 1000).toFixed(1)}L / {(waterTarget / 1000).toFixed(1)}L ({waterPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div className="h-full bg-info rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleQuickWater(250)}
                      className="rounded bg-surface border border-line px-2 py-0.5 text-[10px] font-bold text-ink-muted hover:border-brand-300 hover:text-ink transition"
                    >
                      +250ml
                    </button>
                    <button
                      onClick={() => handleQuickWater(500)}
                      className="rounded bg-surface border border-line px-2 py-0.5 text-[10px] font-bold text-ink-muted hover:border-brand-300 hover:text-ink transition"
                    >
                      +500ml
                    </button>
                  </div>
                </div>

                {/* Sleep */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-ink">
                    <span>Sleep Duration</span>
                    <span className="text-ink-muted">
                      {sleepToday}h / {sleepTarget}h ({sleepPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${sleepPercent}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      placeholder="Hours"
                      className="h-6 w-16 rounded border border-line bg-surface px-1 text-[10px] text-ink outline-none"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (val > 0) handleQuickSleep(val)
                      }}
                    />
                    <span className="text-[10px] text-ink-muted italic">Type to log sleep</span>
                  </div>
                </div>

                {/* Exercise */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-ink">
                    <span>Cardio Workout</span>
                    <span className="text-ink-muted">
                      {exerciseToday}m / {exerciseTarget}m ({exercisePercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div className="h-full bg-coral-500 rounded-full transition-all duration-500" style={{ width: `${exercisePercent}%` }} />
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleQuickExercise(15)}
                      className="rounded bg-surface border border-line px-2 py-0.5 text-[10px] font-bold text-ink-muted hover:border-brand-300 hover:text-ink transition"
                    >
                      +15m Cardio
                    </button>
                    <button
                      onClick={() => handleQuickExercise(30)}
                      className="rounded bg-surface border border-line px-2 py-0.5 text-[10px] font-bold text-ink-muted hover:border-brand-300 hover:text-ink transition"
                    >
                      +30m Run
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Log Vitals Modal */}
      <Modal
        open={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        title="Log Today's Health Vitals"
        description="Save your metrics to compute your health score and update chronological trends charts."
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setVitalsModalOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleLogVitalsSubmit} loading={submittingVitals}>Save Metrics</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Weight (kg)" type="number" step="0.1" value={logWeight} onChange={(e) => setLogWeight(e.target.value)} placeholder="e.g. 74.5" />
          <Input label="Systolic Blood Pressure" type="number" value={logSystolic} onChange={(e) => setLogSystolic(e.target.value)} placeholder="e.g. 120" />
          <Input label="Diastolic Blood Pressure" type="number" value={logDiastolic} onChange={(e) => setLogDiastolic(e.target.value)} placeholder="e.g. 80" />
          <Input label="Blood Sugar (Glucose)" type="number" value={logGlucose} onChange={(e) => setLogGlucose(e.target.value)} placeholder="e.g. 95" />
          <Input label="Resting Heart Rate (bpm)" type="number" value={logHeartRate} onChange={(e) => setLogHeartRate(e.target.value)} placeholder="e.g. 72" />
          <Input label="Sleep Hours" type="number" step="0.5" value={logSleep} onChange={(e) => setLogSleep(e.target.value)} placeholder="e.g. 7.5" />
          <Input label="Exercise Duration (minutes)" type="number" value={logExercise} onChange={(e) => setLogExercise(e.target.value)} placeholder="e.g. 30" />
          <Input label="Calories Consumed" type="number" value={logCaloriesC} onChange={(e) => setLogCaloriesC(e.target.value)} placeholder="e.g. 2100" />
          <Input label="Calories Burned" type="number" value={logCaloriesB} onChange={(e) => setLogCaloriesB(e.target.value)} placeholder="e.g. 400" />
        </div>
      </Modal>

      {/* Reports Details Modal */}
      <Modal
        open={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.title}
        description={`Checked on ${selectedReport?.date}`}
        size="lg"
        footer={
          <Button onClick={() => setSelectedReport(null)} variant="primary">
            Close Report
          </Button>
        }
      >
        {selectedReport && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column: Metrics & Chart */}
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Assessment Summary</h4>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-ink">
                    {Math.round(selectedReport.riskPercentage)}%
                  </span>
                  <span className="text-sm font-semibold text-ink-muted">Risk Probability</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    tone={
                      selectedReport.riskLevel === 'CRITICAL' || selectedReport.riskLevel === 'HIGH'
                        ? 'danger'
                        : selectedReport.riskLevel === 'MEDIUM'
                          ? 'warning'
                          : 'brand'
                    }
                  >
                    {selectedReport.riskLevel} RISK
                  </Badge>
                  <span className="text-xs text-ink-subtle">
                    Model: {selectedReport.raw.modelVersion || 'Calibrated Ensemble v2.0'}
                  </span>
                </div>
              </div>

              {/* Horizontal Bar Chart of Feature contribution */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-subtle">
                  Explainable AI (XAI) Feature Contribution
                </h4>
                {parsedImportance.length === 0 ? (
                  <p className="text-sm text-ink-muted italic">No feature contribution details available.</p>
                ) : (
                  <div className="space-y-3">
                    {parsedImportance.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-ink-muted">
                          <span>{item.name}</span>
                          <span>{item.value > 1 ? `${Math.round(item.value)}%` : `${(item.value * 100).toFixed(1)}%`}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-gradient"
                            style={{ width: `${(item.value / maxImportance) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Recommendations */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                Personalized Clinical Guidelines
              </h4>
              {parsedRecs.length === 0 ? (
                <p className="text-sm text-ink-muted italic">No recommendations generated for this assessment.</p>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {parsedRecs.map((rec, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex gap-3 rounded-xl border p-3.5',
                        rec.type === 'critical'
                          ? 'border-danger-100 bg-danger-50/10'
                          : rec.type === 'warning'
                            ? 'border-warning-100 bg-warning-50/10'
                            : 'border-brand-100 bg-brand-50/10'
                      )}
                    >
                      <span className="text-lg shrink-0 select-none">{rec.emoji}</span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-ink">{rec.title}</p>
                        <p className="text-xs leading-relaxed text-ink-muted">{rec.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
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
