import { api } from '@/lib/api'

export interface Meal {
  type: string // Breakfast, Lunch, Dinner, Snack
  time: string
  calories: number
  name: string
  description: string
}

export interface NutritionPlan {
  id: string
  userId: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFats: number
  mealsJson: string // JSON array of Meal
  createdAt: string
}

export interface WorkoutRoutine {
  day: string
  workoutName: string
  durationMinutes: number
  caloriesBurned: number
  exercises: string[]
}

export interface FitnessPlan {
  id: string
  userId: string
  difficulty: string
  weeklyFrequency: number
  routinesJson: string // JSON array of WorkoutRoutine
  createdAt: string
}

export async function fetchNutritionPlan(userId: string): Promise<NutritionPlan | null> {
  try {
    const res = await api.get<NutritionPlan>(`/plans/nutrition/user/${userId}`)
    return res && res.id ? res : null
  } catch {
    return null
  }
}

export async function generateNutritionPlan(userId: string): Promise<NutritionPlan> {
  return await api.post<NutritionPlan>(`/plans/nutrition/generate`, { userId })
}

export async function fetchFitnessPlan(userId: string): Promise<FitnessPlan | null> {
  try {
    const res = await api.get<FitnessPlan>(`/plans/fitness/user/${userId}`)
    return res && res.id ? res : null
  } catch {
    return null
  }
}

export async function generateFitnessPlan(userId: string): Promise<FitnessPlan> {
  return await api.post<FitnessPlan>(`/plans/fitness/generate`, { userId })
}
