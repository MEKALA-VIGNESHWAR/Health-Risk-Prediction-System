import {
  pointTime,
  type Alert,
  type DashboardData,
  type DiabetesPrediction,
  type HeartPrediction,
  type RiskPoint,
} from './dashboardApi'
import type { Profile } from '@/features/profile/profileApi'

export type Trend = 'improving' | 'worsening' | 'stable' | 'none'

export interface RiskSummary {
  kind: 'diabetes' | 'heart'
  hasData: boolean
  latestRisk: number // 0..100
  level: string
  positive: boolean
  trend: Trend
  delta: number // change vs previous (percentage points)
  at: number
  count: number
}

export interface Recommendation {
  id: string
  icon: 'activity' | 'apple' | 'droplet' | 'moon' | 'heart' | 'user' | 'alert'
  title: string
  detail: string
  priority: 'high' | 'medium' | 'low'
}

export interface DashboardMetrics {
  healthScore: number
  scoreLabel: string
  diabetes: RiskSummary
  heart: RiskSummary
  timeline: RiskPoint[]
  recommendations: Recommendation[]
  unreadAlerts: number
  totalPredictions: number
  profileCompletion: number
}

function levelWeight(level?: string): number {
  switch ((level || '').toUpperCase()) {
    case 'CRITICAL':
      return 90
    case 'HIGH':
      return 72
    case 'MEDIUM':
      return 45
    case 'LOW':
      return 18
    default:
      return 0
  }
}

function riskOf(p: { riskPercentage?: number; riskLevel?: string }): number {
  if (typeof p.riskPercentage === 'number' && p.riskPercentage > 0) return p.riskPercentage
  return levelWeight(p.riskLevel)
}

function summarize(
  kind: 'diabetes' | 'heart',
  list: Array<DiabetesPrediction | HeartPrediction>,
): RiskSummary {
  if (list.length === 0) {
    return { kind, hasData: false, latestRisk: 0, level: '—', positive: false, trend: 'none', delta: 0, at: 0, count: 0 }
  }
  const latest = list[0]
  const latestRisk = Math.round(riskOf(latest))
  let trend: Trend = 'stable'
  let delta = 0
  if (list.length > 1) {
    const prev = Math.round(riskOf(list[1]))
    delta = latestRisk - prev
    trend = delta <= -3 ? 'improving' : delta >= 3 ? 'worsening' : 'stable'
  } else {
    trend = 'none'
  }
  return {
    kind,
    hasData: true,
    latestRisk,
    level: (latest.riskLevel || '—').toUpperCase(),
    positive: latest.predictionResult === 1,
    trend,
    delta,
    at: pointTime(latest),
    count: list.length,
  }
}

const PROFILE_FIELDS: (keyof Profile)[] = [
  'gender', 'dateOfBirth', 'heightCm', 'weightKg', 'bloodGroup', 'phone',
  'medicalHistory', 'currentMedications', 'allergies', 'emergencyContactName',
  'smokingStatus', 'alcoholUse', 'exerciseLevel', 'sleepHours', 'waterIntakeLiters',
]

function profileCompletion(profile: Profile | null): number {
  if (!profile) return 0
  const filled = PROFILE_FIELDS.filter((f) => {
    const v = profile[f]
    return v !== null && v !== undefined && v !== ''
  }).length
  return Math.round((filled / PROFILE_FIELDS.length) * 100)
}

function lifestyleBonus(p: Profile | null): number {
  if (!p) return 0
  let bonus = 0
  if (p.exerciseLevel === 'active') bonus += 5
  else if (p.exerciseLevel === 'moderate') bonus += 3
  if (p.smokingStatus === 'never') bonus += 4
  else if (p.smokingStatus === 'former') bonus += 2
  if (p.alcoholUse === 'none') bonus += 2
  if (p.sleepHours != null && p.sleepHours >= 7 && p.sleepHours <= 9) bonus += 3
  if (p.waterIntakeLiters != null && p.waterIntakeLiters >= 2) bonus += 2
  return bonus // up to ~16
}

/** Health score 0..100 — higher is better. */
function healthScore(diabetes: RiskSummary, heart: RiskSummary, profile: Profile | null): number {
  const risks: number[] = []
  if (diabetes.hasData) risks.push(diabetes.latestRisk)
  if (heart.hasData) risks.push(heart.latestRisk)

  let base: number
  if (risks.length > 0) {
    const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length
    base = 100 - avgRisk * 0.75 // high risk pulls the score down
  } else {
    base = 72 // neutral baseline before any prediction
  }
  const score = base + lifestyleBonus(profile) * 0.5
  return Math.max(1, Math.min(100, Math.round(score)))
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 30) return 'Needs attention'
  return 'At risk'
}

function buildTimeline(d: DiabetesPrediction[], h: HeartPrediction[]): RiskPoint[] {
  const pts: RiskPoint[] = []
  for (const p of d)
    pts.push({ kind: 'diabetes', id: p.id, risk: Math.round(riskOf(p)), level: p.riskLevel, positive: p.predictionResult === 1, at: pointTime(p) })
  for (const p of h)
    pts.push({ kind: 'heart', id: p.id, risk: Math.round(riskOf(p)), level: p.riskLevel, positive: p.predictionResult === 1, at: pointTime(p) })
  return pts.sort((a, b) => a.at - b.at)
}

function buildRecommendations(
  diabetes: RiskSummary,
  heart: RiskSummary,
  profile: Profile | null,
  completion: number,
): Recommendation[] {
  const recs: Recommendation[] = []

  if (diabetes.hasData && diabetes.latestRisk >= 60) {
    recs.push({
      id: 'dia-risk',
      icon: 'heart',
      priority: 'high',
      title: 'Manage your diabetes risk',
      detail: `Your latest diabetes risk is ${diabetes.latestRisk}%. Focus on low-glycemic meals and regular activity, and consider consulting a doctor.`,
    })
  }
  if (heart.hasData && heart.latestRisk >= 60) {
    recs.push({
      id: 'heart-risk',
      icon: 'heart',
      priority: 'high',
      title: 'Support your heart health',
      detail: `Your latest heart risk is ${heart.latestRisk}%. Reduce sodium and saturated fat, and keep moving daily.`,
    })
  }
  if (completion < 70) {
    recs.push({
      id: 'complete-profile',
      icon: 'user',
      priority: 'medium',
      title: 'Complete your health profile',
      detail: `Your profile is ${completion}% complete. Adding your metrics unlocks more accurate, personalized insights.`,
    })
  }
  if (profile?.exerciseLevel === 'sedentary' || !profile?.exerciseLevel) {
    recs.push({
      id: 'move-more',
      icon: 'activity',
      priority: 'medium',
      title: 'Add movement to your day',
      detail: 'Aim for 30 minutes of brisk activity most days — even short walks after meals help.',
    })
  }
  if (profile?.waterIntakeLiters != null && profile.waterIntakeLiters < 2) {
    recs.push({
      id: 'hydrate',
      icon: 'droplet',
      priority: 'low',
      title: 'Drink a little more water',
      detail: 'Try to reach around 2 litres a day to support metabolism and energy.',
    })
  }
  if (profile?.sleepHours != null && profile.sleepHours < 7) {
    recs.push({
      id: 'sleep',
      icon: 'moon',
      priority: 'low',
      title: 'Prioritize your sleep',
      detail: '7–9 hours nightly supports heart health and steady blood sugar.',
    })
  }

  // Sensible defaults when there's little data
  if (recs.length === 0) {
    recs.push(
      {
        id: 'balanced',
        icon: 'apple',
        priority: 'low',
        title: 'Keep up balanced eating',
        detail: 'Fill half your plate with vegetables and choose whole grains to maintain steady energy.',
      },
      {
        id: 'first-check',
        icon: 'activity',
        priority: 'medium',
        title: 'Run your first risk check',
        detail: 'Get a personalized diabetes or heart risk report to see tailored guidance here.',
      },
    )
  }

  const order = { high: 0, medium: 1, low: 2 }
  return recs.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 4)
}

export function computeMetrics(data: DashboardData): DashboardMetrics {
  const diabetes = summarize('diabetes', data.diabetes)
  const heart = summarize('heart', data.heart)
  const completion = profileCompletion(data.profile)
  const score = healthScore(diabetes, heart, data.profile)
  return {
    healthScore: score,
    scoreLabel: scoreLabel(score),
    diabetes,
    heart,
    timeline: buildTimeline(data.diabetes, data.heart),
    recommendations: buildRecommendations(diabetes, heart, data.profile, completion),
    unreadAlerts: data.alerts.filter((a: Alert) => !a.isRead).length,
    totalPredictions: data.diabetes.length + data.heart.length,
    profileCompletion: completion,
  }
}
