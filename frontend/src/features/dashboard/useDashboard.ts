import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { fetchDashboard, type DashboardData } from './dashboardApi'
import { computeMetrics, type DashboardMetrics } from './metrics'

interface DashboardState {
  loading: boolean
  error: string | null
  data: DashboardData | null
  metrics: DashboardMetrics | null
}

export function useDashboard() {
  const { user } = useAuth()
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    data: null,
    metrics: null,
  })

  useEffect(() => {
    let alive = true
    if (!user?.userId) {
      setState({ loading: false, error: null, data: null, metrics: null })
      return
    }
    setState((s) => ({ ...s, loading: true }))
    fetchDashboard(user.userId)
      .then((data) => {
        if (!alive) return
        setState({ loading: false, error: null, data, metrics: computeMetrics(data) })
      })
      .catch(() => {
        if (!alive) return
        setState({ loading: false, error: 'Could not load your dashboard.', data: null, metrics: null })
      })
    return () => {
      alive = false
    }
  }, [user?.userId])

  return useMemo(() => state, [state])
}
