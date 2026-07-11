import { useEffect, useState, useMemo } from 'react'
import {
  Apple,
  Sparkles,
  ChefHat,
  RotateCw,
  Clock,
  Flame,
  Scale,
  Activity,
  Heart,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Card, Badge, Button, Spinner } from '@/components/ui'
import {
  fetchNutritionPlan,
  generateNutritionPlan,
  type NutritionPlan,
  type Meal,
} from '@/features/dashboard/plannerApi'
import { getProfile, type Profile } from '@/features/profile/profileApi'

export function Nutrition() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<NutritionPlan | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const loadData = async () => {
    if (!user?.userId) return
    setLoading(true)
    try {
      const [fetchedPlan, fetchedProfile] = await Promise.all([
        fetchNutritionPlan(user.userId),
        getProfile(),
      ])
      setPlan(fetchedPlan)
      setProfile(fetchedProfile)
    } catch (err) {
      console.error('Failed to load nutrition plan details', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.userId])

  const handleGenerate = async () => {
    if (!user?.userId) return
    setGenerating(true)
    try {
      const newPlan = await generateNutritionPlan(user.userId)
      setPlan(newPlan)
    } catch (err) {
      console.error('Failed to generate nutrition plan', err)
    } finally {
      setGenerating(false)
    }
  }

  const meals = useMemo<Meal[]>(() => {
    if (!plan?.mealsJson) return []
    try {
      return JSON.parse(plan.mealsJson) as Meal[]
    } catch {
      return []
    }
  }, [plan])

  // Macro calculation percentages
  const macros = useMemo(() => {
    if (!plan) return null
    const { targetProtein, targetCarbs, targetFats, targetCalories } = plan
    const proteinCal = (targetProtein || 0) * 4
    const carbsCal = (targetCarbs || 0) * 4
    const fatsCal = (targetFats || 0) * 9
    const sum = proteinCal + carbsCal + fatsCal || 1

    return {
      proteinPct: Math.round((proteinCal / sum) * 100),
      carbsPct: Math.round((carbsCal / sum) * 100),
      fatsPct: Math.round((fatsCal / sum) * 100),
      proteinGrams: targetProtein || 0,
      carbsGrams: targetCarbs || 0,
      fatsGrams: targetFats || 0,
      calories: targetCalories || 2000,
    }
  }, [plan])

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Spinner size={36} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">AI Nutrition Planner</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Clinical macro configurations and meal suggestions generated dynamically by AI based on your vitals.
          </p>
        </div>
        {plan && (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="outline"
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            {generating ? (
              <Spinner size={16} />
            ) : (
              <RotateCw className="h-4 w-4" />
            )}
            Regenerate Plan
          </Button>
        )}
      </div>

      {!plan ? (
        <Card className="p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600 mx-auto">
            <Apple className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-ink">No Nutrition Plan Found</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your profile does not currently have a dynamic meal program.
              Click the button below to analyze your health profile metrics (Weight, Height, Exercise frequency)
              and compile a custom dietitian guide.
            </p>
          </div>
          {profile && (
            <div className="rounded-xl border border-line bg-surface/50 p-3 max-w-sm mx-auto text-left text-xs text-ink-muted space-y-1">
              <p className="font-semibold text-ink">Extracted Profile Vitals:</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <span>Weight: {profile.weightKg ? `${profile.weightKg} kg` : 'Not set'}</span>
                <span>Height: {profile.heightCm ? `${profile.heightCm} cm` : 'Not set'}</span>
                <span>Lifestyle: {profile.exerciseLevel || 'Not set'}</span>
                <span>Allergies: {profile.allergies || 'None'}</span>
              </div>
            </div>
          )}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Spinner size={16} /> Compiling Custom Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Custom Nutrition Plan
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Target Calories & Macro breakdown */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="space-y-6" padding="lg">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Daily Calorie Target</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-ink tracking-tight">
                    {macros?.calories}
                  </span>
                  <span className="text-sm font-semibold text-ink-muted">kcal / day</span>
                </div>
              </div>

              {/* Progress visual splits */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Macro Distribution</h4>
                
                {/* Protein */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-ink">
                    <span className="flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-brand-500" />
                      Protein ({macros?.proteinPct}%)
                    </span>
                    <span className="text-ink-muted">{macros?.proteinGrams}g</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${macros?.proteinPct}%` }}
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-ink">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5 text-info" />
                      Carbohydrates ({macros?.carbsPct}%)
                    </span>
                    <span className="text-ink-muted">{macros?.carbsGrams}g</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-info rounded-full transition-all duration-500"
                      style={{ width: `${macros?.carbsPct}%` }}
                    />
                  </div>
                </div>

                {/* Fats */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-ink">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-coral-500" />
                      Fats ({macros?.fatsPct}%)
                    </span>
                    <span className="text-ink-muted">{macros?.fatsGrams}g</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-coral-500 rounded-full transition-all duration-500"
                      style={{ width: `${macros?.fatsPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Profile indicators context */}
            <Card padding="md" className="bg-surface/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle mb-2">Plan Context</h4>
              <div className="space-y-1.5 text-xs text-ink-muted">
                <div className="flex justify-between">
                  <span>Weight Indicator:</span>
                  <span className="font-semibold text-ink">{profile?.weightKg ? `${profile.weightKg} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Water Intake:</span>
                  <span className="font-semibold text-ink">{profile?.waterIntakeLiters ? `${profile.waterIntakeLiters} L` : '2 L'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lifestyle Mode:</span>
                  <span className="font-semibold text-brand-600 capitalize">{profile?.exerciseLevel || 'Sedentary'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Meals Timeline */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Recommended Meal Schedule</h3>

            {generating && (
              <Card className="flex items-center justify-center p-8 gap-3">
                <Spinner size={20} />
                <span className="text-sm font-medium text-ink">Compiling fresh menu targets...</span>
              </Card>
            )}

            {!generating && meals.length === 0 ? (
              <Card className="p-8 text-center text-sm text-ink-muted">
                No meals parsed in this plan.
              </Card>
            ) : (
              <div className="space-y-4">
                {meals.map((meal, idx) => (
                  <Card key={idx} padding="md" className="relative overflow-hidden group hover:border-brand-300 transition">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                          <ChefHat className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-ink">{meal.name}</h4>
                            <Badge tone="brand">{meal.type}</Badge>
                          </div>
                          <p className="text-xs text-ink-muted mt-1 leading-relaxed">{meal.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0 select-none">
                        <div className="flex items-center gap-1 text-xs text-ink-muted">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{meal.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-brand-600">
                          <Flame className="h-3.5 w-3.5" />
                          <span>{meal.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
