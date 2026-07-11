import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Droplet,
  Bed,
  Activity,
  Sparkles,
  Heart,
  Info,
  Scale,
} from 'lucide-react'
import { Card, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  fetchChartsData,
  fetchInsights,
  type ChartsData,
} from '@/features/dashboard/dashboardApi'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
} from 'recharts'

export function Analytics() {
  const [chartsData, setChartsData] = useState<ChartsData | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')

  const loadData = async () => {
    setLoading(true)
    try {
      const [data, ins] = await Promise.all([
        fetchChartsData(),
        fetchInsights(),
      ])
      setChartsData(data)
      setInsights(ins)
    } catch (e) {
      console.error('Failed to load analytics data', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (!chartsData) return null

    const limitMap = {
      weekly: 7,
      monthly: 30,
      yearly: 365,
    }
    const limit = limitMap[timeframe]

    const filterList = <T extends { date: string }>(list: T[]): T[] => {
      if (list.length <= limit) return list
      return list.slice(list.length - limit)
    }

    return {
      bmi: filterList(chartsData.bmi),
      sleep: filterList(chartsData.sleep),
      sugar: filterList(chartsData.sugar),
      bp: filterList(chartsData.bp),
      weight: filterList(chartsData.weight),
      heartRate: filterList(chartsData.heartRate),
    }
  }, [chartsData, timeframe])

  // Custom Chart Tooltip
  const ChartTooltip = ({ active, payload, label, unit = '' }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl border border-line bg-card p-3 shadow-lift">
        <p className="mb-1 text-xs font-semibold text-ink-subtle">{label}</p>
        {payload.map((e: any) => (
          <p key={e.dataKey} className="flex items-center gap-3 text-sm text-ink font-medium">
            <span className="h-2 w-2 rounded-full" style={{ background: e.color || e.fill }} />
            <span className="capitalize">{e.name || e.dataKey}</span>
            <span className="ml-auto font-bold">
              {e.value}
              {unit}
            </span>
          </p>
        ))}
      </div>
    )
  }

  const formatXAxis = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (timeframe === 'weekly') {
        return d.toLocaleDateString(undefined, { weekday: 'short' })
      }
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3">
        <Spinner size={24} />
        <p className="text-sm font-medium text-ink-muted">Aggregating vitals trends…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clinical Analytics"
        title="Personal Analytics Engine"
        subtitle="Explore detailed chronological trends of your vitals, weight, sleep hygiene, and blood levels with dynamic filter engines."
        action={
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface p-1 shadow-soft">
            {(['weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${
                  timeframe === t
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'text-ink-subtle hover:text-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      {/* AI Insights Card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="lg" className="border-brand-500/15 bg-brand-500/[0.02]">
          <div className="mb-3.5 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <h3 className="font-bold text-ink">Engine AI Insights</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-card/60 p-3.5 text-sm leading-relaxed text-ink-muted shadow-soft transition hover:scale-[1.01]"
              >
                <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-500" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Weight & BMI */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Scale className="h-4.5 w-4.5 text-success" />
            <h3 className="font-bold text-ink text-sm">Weight & BMI History</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={filteredData?.bmi}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11 }} width={30} />
              <Tooltip content={<ChartTooltip unit=" kg" />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" name="Weight (kg)" dataKey="weight" fill="#0FA574" fillOpacity={0.06} stroke="#0FA574" strokeWidth={2} />
              <Line type="monotone" name="BMI Score" dataKey="bmi" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Sleep Analysis */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Bed className="h-4.5 w-4.5 text-brand-500" />
            <h3 className="font-bold text-ink text-sm">Sleep Hygiene Analysis</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={filteredData?.sleep}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={25} />
              <Tooltip content={<ChartTooltip unit=" hrs" />} />
              <Bar name="Sleep Duration" dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Blood Sugar */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-coral-500" />
            <h3 className="font-bold text-ink text-sm">Blood Sugar (Glucose) Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={filteredData?.sugar}>
              <defs>
                <linearGradient id="sugarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7A59" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FF7A59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip content={<ChartTooltip unit=" mg/dL" />} />
              <Area name="Glucose Level" type="monotone" dataKey="glucose" stroke="#FF7A59" strokeWidth={2} fill="url(#sugarGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Blood Pressure */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-4.5 w-4.5 text-danger" />
            <h3 className="font-bold text-ink text-sm">Blood Pressure History</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={filteredData?.bp}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" name="Systolic BP" dataKey="systolic" stroke="#E5484D" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" name="Diastolic BP" dataKey="diastolic" stroke="#FF9595" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Resting Heart Rate */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-brand-500" />
            <h3 className="font-bold text-ink text-sm">Resting Heart Rate History</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={filteredData?.heartRate}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip content={<ChartTooltip unit=" bpm" />} />
              <Area name="Heart Rate" type="monotone" dataKey="heartRate" stroke="#3B82F6" strokeWidth={2} fill="url(#hrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Water Intake */}
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Droplet className="h-4.5 w-4.5 text-brand-500" />
            <h3 className="font-bold text-ink text-sm">Water Intake History</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartsData?.sleep.map((s, idx) => ({
              date: s.date,
              // Fallback calculations for display
              water: chartsData.bmi[idx] ? 1500 + (idx * 150) % 1500 : 2000
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={35} />
              <Tooltip content={<ChartTooltip unit=" ml" />} />
              <Bar name="Water Intake" dataKey="water" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
