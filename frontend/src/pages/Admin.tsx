import { useEffect, useState } from 'react'
import {
  Cpu,
  Layers,
  FileText,
  Users,
  CheckCircle2,
  Database,
  AlertTriangle,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, Badge, Spinner } from '@/components/ui'

interface AdminStats {
  activeUsersCount: number
  totalPredictionsCount: number
  totalReportsCount: number
  cpuCount: number
  totalMemoryMb: number
  freeMemoryMb: number
  usedMemoryMb: number
  systemStatus: string
}

export function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<AdminStats>('/admin/stats')
      setStats(res)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin stats. Insufficient permissions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Spinner size={36} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-danger mx-auto" />
        <h3 className="text-lg font-bold text-ink">Access Denied</h3>
        <p className="text-sm text-ink-muted leading-relaxed">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Admin Telemetry Control</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Active server stats, memory thresholds, and database entity aggregates.
        </p>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Database metrics overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Users */}
            <Card padding="md" className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-ink-subtle uppercase">Active Accounts</span>
                <p className="text-2xl font-extrabold text-ink tracking-tight mt-0.5">{stats.activeUsersCount}</p>
              </div>
            </Card>

            {/* Predictions */}
            <Card padding="md" className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-info/10 text-info">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-ink-subtle uppercase">Total Predictions</span>
                <p className="text-2xl font-extrabold text-ink tracking-tight mt-0.5">{stats.totalPredictionsCount}</p>
              </div>
            </Card>

            {/* Reports */}
            <Card padding="md" className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral-500/10 text-coral-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-ink-subtle uppercase">Parsed Reports</span>
                <p className="text-2xl font-extrabold text-ink tracking-tight mt-0.5">{stats.totalReportsCount}</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Server Specifications */}
            <Card padding="lg" className="lg:col-span-1 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle flex items-center gap-1.5">
                <Cpu className="h-4.5 w-4.5" /> Engine Telemetry
              </h3>
              <div className="space-y-3.5 pt-2 text-xs text-ink-muted">
                <div className="flex justify-between items-center">
                  <span>System Nodes:</span>
                  <span className="font-semibold text-ink">{stats.cpuCount} Cores</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Connection Target:</span>
                  <span className="font-semibold text-ink">Supabase Pooler</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Instance Status:</span>
                  <Badge tone={stats.systemStatus === 'OK' ? 'brand' : 'danger'}>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Operational
                    </span>
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Memory stats */}
            <Card padding="lg" className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5" /> JVM Memory Split
              </h3>
              <div className="space-y-4.5 pt-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border border-line bg-surface/30 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-ink-subtle uppercase">Allocated</span>
                    <span className="block text-base font-extrabold text-ink mt-0.5">{stats.totalMemoryMb} MB</span>
                  </div>
                  <div className="border border-line bg-surface/30 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-ink-subtle uppercase">Used Memory</span>
                    <span className="block text-base font-extrabold text-brand-600 mt-0.5">{stats.usedMemoryMb} MB</span>
                  </div>
                  <div className="border border-line bg-surface/30 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-ink-subtle uppercase">Free Heap</span>
                    <span className="block text-base font-extrabold text-ink mt-0.5">{stats.freeMemoryMb} MB</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-ink-muted">
                    <span>Memory Usage Rate</span>
                    <span>{Math.round((stats.usedMemoryMb / stats.totalMemoryMb) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                      style={{ width: `${(stats.usedMemoryMb / stats.totalMemoryMb) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
export default Admin
