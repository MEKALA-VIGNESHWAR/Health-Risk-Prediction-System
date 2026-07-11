import { useEffect, useState, useMemo } from 'react'
import {
  Dumbbell,
  Sparkles,
  Calendar,
  RotateCw,
  Clock,
  Flame,
  Activity,
  ListChecks,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Card, Badge, Button, Spinner } from '@/components/ui'
import {
  fetchFitnessPlan,
  generateFitnessPlan,
  type FitnessPlan,
  type WorkoutRoutine,
} from '@/features/dashboard/plannerApi'
import { getProfile, type Profile } from '@/features/profile/profileApi'

export function Fitness() {
  const { user } = useAuth()
  const [plan, setPlan] = useState<FitnessPlan | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const loadData = async () => {
    if (!user?.userId) return
    setLoading(true)
    try {
      const [fetchedPlan, fetchedProfile] = await Promise.all([
        fetchFitnessPlan(user.userId),
        getProfile(),
      ])
      setPlan(fetchedPlan)
      setProfile(fetchedProfile)
    } catch (err) {
      console.error('Failed to load fitness plan details', err)
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
      const newPlan = await generateFitnessPlan(user.userId)
      setPlan(newPlan)
    } catch (err) {
      console.error('Failed to generate fitness plan', err)
    } finally {
      setGenerating(false)
    }
  }

  const routines = useMemo<WorkoutRoutine[]>(() => {
    if (!plan?.routinesJson) return []
    try {
      return JSON.parse(plan.routinesJson) as WorkoutRoutine[]
    } catch {
      return []
    }
  }, [plan])

  // Total metrics aggregates
  const planAggregates = useMemo(() => {
    if (routines.length === 0) return null
    const totalDuration = routines.reduce((sum, r) => sum + (r.durationMinutes || 0), 0)
    const totalCalories = routines.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0)
    return {
      totalDuration,
      totalCalories,
      avgDuration: Math.round(totalDuration / routines.length),
    }
  }, [routines])

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
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">AI Workout Planner</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Personalized fitness routines, schedules, and active calories trackers built by AI.
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
            Regenerate Routine
          </Button>
        )}
      </div>

      {!plan ? (
        <Card className="p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600 mx-auto">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-ink">No Fitness Plan Found</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your profile does not currently have a weekly workout routine program.
              Click the button below to analyze your health profile metrics (Weight, Height, Exercise frequency)
              and compile a custom cardio, yoga, and strength training guide.
            </p>
          </div>
          {profile && (
            <div className="rounded-xl border border-line bg-surface/50 p-3 max-w-sm mx-auto text-left text-xs text-ink-muted space-y-1">
              <p className="font-semibold text-ink">Extracted Profile Vitals:</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <span>Weight: {profile.weightKg ? `${profile.weightKg} kg` : 'Not set'}</span>
                <span>Height: {profile.heightCm ? `${profile.heightCm} cm` : 'Not set'}</span>
                <span>Exercise Level: {profile.exerciseLevel || 'Sedentary'}</span>
                <span>Sleep Hours: {profile.sleepHours ? `${profile.sleepHours}h` : 'Not set'}</span>
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
                <Sparkles className="h-4 w-4" /> Generate Workout Routine Guide
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Plan parameters */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="space-y-6" padding="lg">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Workout Intensity</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-ink tracking-tight capitalize">
                    {plan.difficulty.toLowerCase()}
                  </span>
                </div>
                <div className="mt-2.5">
                  <Badge tone="brand">Target: {plan.weeklyFrequency} Workouts / week</Badge>
                </div>
              </div>

              {/* Aggregates */}
              {planAggregates && (
                <div className="space-y-3 pt-2.5 border-t border-line text-xs text-ink-muted">
                  <div className="flex justify-between items-center">
                    <span>Weekly Energy Cost:</span>
                    <span className="font-bold text-brand-600 flex items-center gap-0.5">
                      <Flame className="h-3.5 w-3.5" /> {planAggregates.totalCalories} kcal
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Workout Time:</span>
                    <span className="font-semibold text-ink flex items-center gap-0.5">
                      <Clock className="h-3.5 w-3.5" /> {planAggregates.totalDuration} mins
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Routine Length:</span>
                    <span className="font-semibold text-ink">{planAggregates.avgDuration} mins / session</span>
                  </div>
                </div>
              )}
            </Card>

            <Card padding="md" className="bg-surface/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle mb-2">Vitals Base</h4>
              <div className="space-y-1.5 text-xs text-ink-muted">
                <div className="flex justify-between">
                  <span>BMI Status:</span>
                  <span className="font-semibold text-ink">
                    {profile?.weightKg && profile?.heightCm
                      ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Restrictions:</span>
                  <span className="font-semibold text-ink truncate max-w-[140px]" title={profile?.medicalHistory || 'None'}>
                    {profile?.medicalHistory || 'None'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Routines List */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Weekly Exercise Schedule</h3>

            {generating && (
              <Card className="flex items-center justify-center p-8 gap-3">
                <Spinner size={20} />
                <span className="text-sm font-medium text-ink">Compiling workout guidelines...</span>
              </Card>
            )}

            {!generating && routines.length === 0 ? (
              <Card className="p-8 text-center text-sm text-ink-muted">
                No exercises registered.
              </Card>
            ) : (
              <div className="space-y-4">
                {routines.map((routine, idx) => (
                  <Card key={idx} padding="md" className="hover:border-brand-300 transition">
                    <div className="flex flex-col gap-3">
                      {/* Top banner */}
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-ink">{routine.workoutName}</h4>
                              <Badge tone="brand">{routine.day}</Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-muted select-none">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {routine.durationMinutes} mins
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-brand-600 font-semibold">
                                <Flame className="h-3.5 w-3.5" /> {routine.caloriesBurned} kcal
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Exercises checklist */}
                      {routine.exercises && routine.exercises.length > 0 && (
                        <div className="pt-2.5 border-t border-line space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle flex items-center gap-1 select-none">
                            <ListChecks className="h-3.5 w-3.5" /> Exercise Breakdowns
                          </p>
                          <div className="grid gap-1.5 sm:grid-cols-2">
                            {routine.exercises.map((ex, exIdx) => (
                              <div key={exIdx} className="flex gap-2 items-start rounded-lg border border-line bg-surface/30 p-2 hover:bg-surface transition">
                                <Activity className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                                <span className="text-xs text-ink leading-tight font-medium">{ex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
