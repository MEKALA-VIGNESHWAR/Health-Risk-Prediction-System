import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RiskPoint } from '@/features/dashboard/dashboardApi'

interface Row {
  label: string
  diabetes: number | null
  heart: number | null
}

/** Merge diabetes + heart risk points into a shared time axis (by day). */
function toRows(points: RiskPoint[]): Row[] {
  const byDay = new Map<string, Row>()
  const order: string[] = []
  for (const p of points) {
    const d = new Date(p.at)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    if (!byDay.has(key)) {
      byDay.set(key, { label, diabetes: null, heart: null })
      order.push(key)
    }
    const row = byDay.get(key)!
    if (p.kind === 'diabetes') row.diabetes = p.risk
    else row.heart = p.risk
  }
  return order.map((k) => byDay.get(k)!)
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 shadow-lift">
      <p className="mb-1 text-xs font-semibold text-ink-subtle">{label}</p>
      {payload.map((e: any) => (
        <p key={e.dataKey} className="flex items-center gap-2 text-sm text-ink">
          <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
          <span className="capitalize">{e.dataKey}</span>
          <span className="ml-auto font-semibold">{e.value}%</span>
        </p>
      ))}
    </div>
  )
}

export function TrendsChart({ points }: { points: RiskPoint[] }) {
  const rows = useMemo(() => toRows(points), [points])

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="diaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0FA574" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#0FA574" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="heartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF7A59" stopOpacity={0.26} />
            <stop offset="100%" stopColor="#FF7A59" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: 'rgb(var(--ink-subtle))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: 'rgb(var(--ink-subtle))' }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="diabetes"
          stroke="#0FA574"
          strokeWidth={2.5}
          fill="url(#diaFill)"
          connectNulls
          dot={{ r: 3, fill: '#0FA574', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="heart"
          stroke="#FF7A59"
          strokeWidth={2.5}
          connectNulls
          dot={{ r: 3, fill: '#FF7A59', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
