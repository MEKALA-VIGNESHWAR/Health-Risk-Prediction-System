import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope,
  ShieldAlert,
  Activity,
  ClipboardList,
  HeartHandshake,
  Siren,
  Sparkles,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  History,
  Clock,
  AlertTriangle,
  CornerDownRight,
} from 'lucide-react'
import { Badge, Button, Card, Textarea, useToast } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/cn'

interface Condition {
  name: string
  likelihood: string
  description: string
}

interface SymptomResult {
  summary: string
  urgency: 'LOW' | 'MODERATE' | 'URGENT' | 'EMERGENCY'
  urgencyReason: string
  possibleConditions: Condition[]
  recommendedActions: string[]
  selfCare: string[]
  seekCareIf: string[]
  disclaimer: string
  aiGenerated: boolean
}

interface HistoryItem {
  id: string
  symptoms: string
  duration: string
  severity: string
  medicalHistory: string
  medications: string
  analysisResult: string
  createdAt: string
}

const URGENCY = {
  LOW: { label: 'Low urgency', tone: 'success', bar: 'bg-success', ring: 'ring-success/25 bg-success/10 text-success', icon: Activity },
  MODERATE: { label: 'Moderate', tone: 'gold', bar: 'bg-gold-400', ring: 'ring-gold-400/30 bg-gold-400/12 text-gold-500', icon: ShieldAlert },
  URGENT: { label: 'Urgent', tone: 'coral', bar: 'bg-coral-400', ring: 'ring-coral-400/30 bg-coral-400/12 text-coral-500', icon: Siren },
  EMERGENCY: { label: 'Emergency', tone: 'danger', bar: 'bg-danger', ring: 'ring-danger/30 bg-danger/12 text-danger', icon: Siren },
} as const

const LIKELIHOOD_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  high: 'danger',
  moderate: 'warning',
  low: 'success',
}

const EXAMPLES = [
  'I have a headache and mild fever since yesterday',
  'My chest feels tight when I walk up stairs',
  'I feel tired all day and often thirsty',
]

const SEVERITY_LEVELS = [
  { val: 'Low', desc: 'Mild symptoms, annoying but not limiting your activities.' },
  { val: 'Moderate', desc: 'Noticeable symptoms, slightly limiting daily routines.' },
  { val: 'High', desc: 'Significant symptoms, causing discomfort and disruptions.' },
  { val: 'Severe', desc: 'Intense or disabling symptoms, seek guidance immediately.' },
]

export function SymptomChecker() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check')
  
  // Multi-step checker states
  const [step, setStep] = useState(1)
  const [text, setText] = useState('')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState('Low')
  const [medHistory, setMedHistory] = useState('')
  const [medications, setMedications] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SymptomResult | null>(null)
  
  // History states
  const [historyList, setHistoryList] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<SymptomResult | null>(null)

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  async function fetchHistory() {
    setHistoryLoading(true)
    try {
      const items = await api.get<HistoryItem[]>('/symptoms/history')
      setHistoryList(items)
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  async function analyze() {
    if (!text.trim()) {
      toast.warning('Please describe your symptoms first.')
      setStep(1)
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post<SymptomResult>('/symptoms/check', {
        text: text.trim(),
        duration: duration.trim(),
        severity,
        medicalHistory: medHistory.trim(),
        medications: medications.trim(),
      })
      setResult(res)
      setStep(6) // Result stage
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not analyze symptoms.')
    } finally {
      setLoading(false)
    }
  }

  function resetAll() {
    setResult(null)
    setText('')
    setDuration('')
    setSeverity('Low')
    setMedHistory('')
    setMedications('')
    setStep(1)
    setSelectedHistory(null)
  }

  const handleNext = () => {
    if (step === 1 && !text.trim()) {
      toast.warning('Please describe your symptoms first.')
      return
    }
    setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            <label className="mb-2 block text-sm font-semibold text-ink-subtle">
              1. What symptoms are you experiencing?
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. I've had a throbbing headache and a mild fever since yesterday, and I feel a bit dizzy when I stand up."
              className="min-h-[140px]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setText(ex)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-ink"
                >
                  {ex}
                </button>
              ))}
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            <label className="mb-2 block text-sm font-semibold text-ink-subtle">
              2. How long have you had these symptoms?
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 2 days, 1 week, since this morning"
              className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {['Just started', 'Few hours', '2-3 days', 'Over a week', 'Chronic'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-ink"
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            <label className="mb-3 block text-sm font-semibold text-ink-subtle">
              3. Assess your symptom severity:
            </label>
            <div className="grid gap-2.5">
              {SEVERITY_LEVELS.map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => setSeverity(lvl.val)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-3.5 text-left transition',
                    severity === lvl.val
                      ? 'border-brand-500 bg-brand-500/[0.04] ring-2 ring-brand-500'
                      : 'border-line bg-surface/50 hover:bg-surface'
                  )}
                >
                  <span className="font-semibold text-ink">{lvl.val}</span>
                  <span className="text-xs text-ink-muted mt-0.5">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            <label className="mb-2 block text-sm font-semibold text-ink-subtle">
              4. Relevant medical history (Optional)
            </label>
            <Textarea
              value={medHistory}
              onChange={(e) => setMedHistory(e.target.value)}
              placeholder="e.g. Hypertension, type-2 diabetes, peanut allergy, or none"
              className="min-h-[100px]"
            />
          </motion.div>
        )
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            <label className="mb-2 block text-sm font-semibold text-ink-subtle">
              5. Are you currently taking any medications? (Optional)
            </label>
            <Textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g. Metformin 500mg, Lisinopril 10mg, or none"
              className="min-h-[100px]"
            />
          </motion.div>
        )
      default:
        return null
    }
  }

  const renderResult = (res: SymptomResult) => {
    const urgency = URGENCY[res.urgency]
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Urgency banner */}
        <Card padding="none" className="overflow-hidden">
          <div className={cn('h-1.5 w-full', urgency.bar)} />
          <div className="flex items-start gap-3.5 p-5">
            <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset', urgency.ring)}>
              <urgency.icon className="h-5.5 w-5.5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-ink">Assessed Urgency</h3>
                <Badge tone={urgency.tone}>{urgency.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{res.urgencyReason}</p>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card padding="lg">
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-subtle">Case Summary</h3>
          <p className="text-[15px] leading-relaxed text-ink">{res.summary}</p>
        </Card>

        {/* Possible conditions */}
        {res.possibleConditions.length > 0 && (
          <Card padding="lg">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
              <Activity className="h-4.5 w-4.5 text-brand-600" /> Possible Conditions
            </h3>
            <div className="space-y-2.5">
              {res.possibleConditions.map((c, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface/50 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{c.name}</p>
                    <Badge tone={LIKELIHOOD_TONE[c.likelihood] ?? 'neutral'}>{c.likelihood}</Badge>
                  </div>
                  {c.description && <p className="mt-1 text-sm text-ink-muted">{c.description}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions + self care */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {res.recommendedActions.length > 0 && (
            <ListCard
              icon={<ClipboardList className="h-4.5 w-4.5 text-brand-600" />}
              title="Recommended next steps"
              items={res.recommendedActions}
              marker="chevron"
            />
          )}
          {res.selfCare.length > 0 && (
            <ListCard
              icon={<HeartHandshake className="h-4.5 w-4.5 text-success" />}
              title="Self-care advice"
              items={res.selfCare}
              marker="dot"
            />
          )}
        </div>

        {/* Seek care if */}
        {res.seekCareIf.length > 0 && (
          <Card padding="lg" variant="outline" className="border-danger/25 bg-danger/[0.04]">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-danger">
              <Siren className="h-4.5 w-4.5" /> Seek urgent care if…
            </h3>
            <ul className="space-y-2">
              {res.seekCareIf.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <p className="px-1 text-xs leading-relaxed text-ink-subtle">{res.disclaimer}</p>
      </motion.div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Care"
        title="Symptom Checker 2.0"
        subtitle="Step-by-step smart clinical symptom evaluation with direct feedback and assessment history storage."
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-line pb-px">
        <button
          onClick={() => { setActiveTab('check'); setSelectedHistory(null) }}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition focus:outline-none',
            activeTab === 'check' && !selectedHistory
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-ink-subtle hover:text-ink'
          )}
        >
          <Stethoscope className="h-4.5 w-4.5" /> Check Symptoms
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition focus:outline-none',
            activeTab === 'history' || selectedHistory
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-ink-subtle hover:text-ink'
          )}
        >
          <History className="h-4.5 w-4.5" /> Assessment History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedHistory ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <CornerDownRight className="h-5 w-5 text-brand-500" /> Historical Analysis Result
              </h2>
              <Button variant="secondary" onClick={() => setSelectedHistory(null)}>
                Back to history list
              </Button>
            </div>
            {renderResult(selectedHistory)}
          </div>
        ) : activeTab === 'check' ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            {/* Steps & Form */}
            <Card padding="lg" className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-ink">Progress Step {step}/5</h3>
                </div>
                <Badge tone={step === 5 ? 'success' : 'neutral'}>
                  {step === 5 ? 'Ready' : `${step * 20}%`}
                </Badge>
              </div>

              {/* Step indicator bar */}
              <div className="mb-5 h-1.5 w-full rounded-full bg-line overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>

              <div className="min-h-[220px]">
                {renderStep()}
              </div>

              <div className="mt-6 flex justify-between border-t border-line pt-4">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={step === 1 || loading}
                  leftIcon={<ChevronLeft className="h-4.5 w-4.5" />}
                >
                  Back
                </Button>

                {step < 5 ? (
                  <Button
                    onClick={handleNext}
                    rightIcon={<ChevronRight className="h-4.5 w-4.5" />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={analyze}
                    loading={loading}
                    leftIcon={!loading ? <Sparkles className="h-4.5 w-4.5" /> : undefined}
                  >
                    Analyze symptoms
                  </Button>
                )}
              </div>
            </Card>

            {/* Results display panel */}
            <div className="lg:col-span-3">
              {loading ? (
                <ResultSkeleton />
              ) : !result ? (
                <Card padding="lg" className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                    <ClipboardList className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">Complete steps to analyze</h3>
                  <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
                    Fill out the symptom checking wizard. PulseMind will analyze severity, suggest possibilities, and note warnings.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-ink">Analysis Results</h3>
                    <Button variant="secondary" onClick={resetAll} leftIcon={<RotateCcw className="h-4 w-4" />}>
                      Reset
                    </Button>
                  </div>
                  {renderResult(result)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {historyLoading ? (
              <div className="space-y-3">
                <div className="skeleton h-20 rounded-xl" />
                <div className="skeleton h-20 rounded-xl" />
                <div className="skeleton h-20 rounded-xl" />
              </div>
            ) : historyList.length === 0 ? (
              <Card padding="lg" className="text-center py-10">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface text-ink-muted mb-3">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-ink">No assessment history</h3>
                <p className="text-sm text-ink-muted mt-1">
                  You haven't run any AI symptom evaluations yet. Complete a check to save history.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3.5">
                {historyList.map((item) => {
                  let parsed: SymptomResult | null = null
                  try {
                    parsed = JSON.parse(item.analysisResult)
                  } catch (e) {
                    console.error('Failed to parse history result', e)
                  }

                  const urgency = parsed ? URGENCY[parsed.urgency] : null

                  return (
                    <Card
                      key={item.id}
                      padding="lg"
                      className="cursor-pointer transition hover:border-brand-300 hover:shadow-soft"
                      onClick={() => parsed && setSelectedHistory(parsed)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-ink line-clamp-1">{item.symptoms}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(item.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {item.duration && <span>Duration: {item.duration}</span>}
                            {item.severity && (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-gold-500" />
                                Severity: {item.severity}
                              </span>
                            )}
                          </div>
                        </div>

                        {urgency && (
                          <div className="shrink-0">
                            <Badge tone={urgency.tone}>{urgency.label}</Badge>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ListCard({
  icon,
  title,
  items,
  marker,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  marker: 'chevron' | 'dot'
}) {
  return (
    <Card padding="lg" className="h-full">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
        {icon} {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
            {marker === 'chevron' ? (
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            ) : (
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ResultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-24 rounded-2xl" />
      <div className="skeleton h-28 rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    </div>
  )
}
