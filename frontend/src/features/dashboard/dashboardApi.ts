import { api } from '@/lib/api'
import { getProfile, type Profile } from '@/features/profile/profileApi'

// ── Raw entity shapes (subset we consume) ───────────────────────────────────
export interface DiabetesPrediction {
  id: string
  glucose: number
  bmi: number
  age: number
  predictionResult: number // 0 | 1
  probabilityDiabetes: number // 0..1
  riskLevel: string // LOW | MEDIUM | HIGH | CRITICAL
  riskPercentage: number // 0..100
  createdAt: string
  predictionTimestamp: number
}

export interface HeartPrediction {
  id: string
  age: number
  chol?: number
  trestbps?: number
  predictionResult: number
  diseaseProbability: number // 0..1
  riskLevel: string
  riskPercentage: number
  createdAt: string
  predictionTimestamp: number
}

export interface Alert {
  id: string
  title: string
  message: string
  severity: string // CRITICAL | HIGH | MEDIUM | LOW
  alertType?: string
  isRead: boolean
  createdAt: string
}

/** A normalized prediction point for unified timelines & cards. */
export interface RiskPoint {
  kind: 'diabetes' | 'heart'
  id: string
  risk: number // 0..100
  level: string
  positive: boolean
  at: number // epoch ms
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p
  } catch {
    return fallback
  }
}

function ts(p: { predictionTimestamp?: number; createdAt?: string }): number {
  if (p.predictionTimestamp) return p.predictionTimestamp
  if (p.createdAt) {
    const t = new Date(p.createdAt).getTime()
    if (!Number.isNaN(t)) return t
  }
  return 0
}

export interface DashboardData {
  profile: Profile | null
  diabetes: DiabetesPrediction[]
  heart: HeartPrediction[]
  alerts: Alert[]
}

/** Fetch everything the dashboard needs in parallel; individual failures degrade to empty. */
export async function fetchDashboard(userId: string): Promise<DashboardData> {
  const [profile, diabetes, heart, alerts] = await Promise.all([
    safe<Profile | null>(getProfile(), null),
    safe<DiabetesPrediction[]>(api.get(`/predict/history/user/${userId}`), []),
    safe<HeartPrediction[]>(api.get(`/predict/heart/history/user/${userId}`), []),
    safe<Alert[]>(api.get(`/alerts/user/${userId}`), []),
  ])
  // Newest first
  const byNewest = <T extends { predictionTimestamp?: number; createdAt?: string }>(a: T, b: T) =>
    ts(b) - ts(a)
  return {
    profile,
    diabetes: [...(diabetes ?? [])].sort(byNewest),
    heart: [...(heart ?? [])].sort(byNewest),
    alerts: alerts ?? [],
  }
}

export { ts as pointTime }
