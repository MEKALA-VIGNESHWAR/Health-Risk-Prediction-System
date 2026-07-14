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
  featureImportance?: string
  recommendations?: string
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
  featureImportance?: string
  recommendations?: string
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

export interface PersonalDashboard {
  healthScore: number
  scoreLabel: string
  streak: number
  today: {
    waterIntakeMl: number
    sleepHours: number
    caloriesConsumed: number
    caloriesBurned: number
    exerciseMinutes: number
    weightKg?: number
    systolicBp?: number
    diastolicBp?: number
    bloodSugar?: number
    heartRate?: number
  }
}

export interface ChartsData {
  bmi: Array<{ date: string; weight: number; bmi: number }>
  sleep: Array<{ date: string; hours: number }>
  sugar: Array<{ date: string; glucose: number }>
  bp: Array<{ date: string; systolic: number; diastolic: number }>
  weight: Array<{ date: string; weight: number }>
  heartRate: Array<{ date: string; heartRate: number }>
}

export async function fetchPersonalDashboard(): Promise<PersonalDashboard> {
  const res = await api.get<any>('/dashboard')
  return res.data as PersonalDashboard
}

export async function fetchChartsData(): Promise<ChartsData> {
  const res = await api.get<any>('/dashboard/charts')
  return res.data as ChartsData
}

export async function fetchInsights(): Promise<string[]> {
  const res = await api.get<any>('/dashboard/insights')
  return res.data as string[]
}

export async function logVitals(payload: Record<string, any>): Promise<any> {
  return api.post('/dashboard/log', payload)
}

// ── Predictions DTO and Helpers ───────────────────────────────────────────

export interface DiabetesPredictionRequest {
  pregnancies?: number
  glucose?: number
  bloodPressure?: number
  skinThickness?: number
  insulin?: number
  bmi?: number
  diabetesPedigreeFunction?: number
  age?: number
  userId?: string
}

export interface DiabetesPredictionResponse {
  predictionResult: number // 0 or 1
  prediction?: number
  probabilityNoDiabetes: number
  probabilityDiabetes: number
  predictionMessage: string
  riskLevel: string
  riskPercentage: number
  confidenceLevel: number
  confidenceText: string
  modelUsed: string
  modelVersion: string
  featureImportance?: string // JSON representation
  timestamp: number
  predictionId: string
  abnormalValues?: any
  recommendations?: any
  previousComparison?: any
}

export interface HeartPredictionRequest {
  age?: number
  sex?: number
  cp?: number
  trestbps?: number
  chol?: number
  fbs?: number
  restecg?: number
  thalach?: number
  exang?: number
  oldpeak?: number
  slope?: number
  ca?: number
  thal?: number
  userId?: string
}

export interface HeartPredictionResponse {
  predictionResult: number // 0 or 1
  prediction?: number
  diseaseProbability: number
  noDiseaseProbability: number
  predictionMessage: string
  risk: string
  confidenceLevel: number
  modelUsed: string
  topFactors?: any // List of map
  recommendations?: any // List of string
  riskDescription?: string
  abnormalValues?: any
  predictionId: string
}

export async function predictDiabetes(payload: DiabetesPredictionRequest): Promise<DiabetesPredictionResponse> {
  return await api.post<DiabetesPredictionResponse>('/predict/diabetes', payload)
}

export async function predictHeart(payload: HeartPredictionRequest): Promise<HeartPredictionResponse> {
  return await api.post<HeartPredictionResponse>('/predict/heart', payload)
}

