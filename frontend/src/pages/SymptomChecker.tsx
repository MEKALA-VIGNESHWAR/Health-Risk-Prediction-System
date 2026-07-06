import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  Info,
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

const selectClass =
  'h-11 rounded-xl border border-line bg-surface px-3 text-[15px] text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15'

export function SymptomChecker() {
  const toast = useToast()
  const [text, setText] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SymptomResult | null>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .get<{ configured: boolean }>('/ai/status')
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false))
  }, [])

  async function analyze() {
    if (!text.trim()) {
      toast.warning('Please describe your symptoms first.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post<SymptomResult>('/ai/symptoms', {
        text: text.trim(),
        age: age ? Number(age) : null,
        sex: sex || null,
        duration: duration || null,
      })
      setResult(res)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not analyze symptoms.')
    } finally {
      setLoading(false)
    }
  }

  function resetAll() {
    setResult(null)
    setText('')
    setAge('')
    setSex('')
    setDuration('')
  }

  const urgency = result ? URGENCY[result.urgency] : null

  return (
    <div>
      <PageHeader
        eyebrow="AI Care"
        title="Symptom Checker"
        subtitle="Describe how you feel in your own words. AuraHealth outlines possibilities and next steps — it never diagnoses."
        action={configured === false ? <Badge tone="gold">Demo mode</Badge> : undefined}
      />

      {/* Safety disclaimer */}
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-coral-400/25 bg-coral-400/8 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" />
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">This is not a diagnosis.</span> For severe or sudden
          symptoms — chest pain, trouble breathing, stroke signs — call your local emergency number now.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Input */}
        <Card padding="lg" className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h2 className="font-semibold text-ink">Describe your symptoms</h2>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. I've had a throbbing headache and a mild fever since yesterday, and I feel a bit dizzy when I stand up."
            className="min-h-[130px]"
          />

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              className={selectClass}
              aria-label="Age"
            />
            <select value={sex} onChange={(e) => setSex(e.target.value)} className={selectClass} aria-label="Sex">
              <option value="">Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration"
              className={cn(selectClass, 'col-span-2 sm:col-span-1')}
              aria-label="Duration"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
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

          <Button
            className="mt-5"
            fullWidth
            size="lg"
            onClick={analyze}
            loading={loading}
            leftIcon={!loading ? <Sparkles className="h-4.5 w-4.5" /> : undefined}
          >
            {loading ? 'Analyzing…' : 'Analyze symptoms'}
          </Button>
        </Card>

        {/* Result */}
        <div className="lg:col-span-3">
          {loading ? (
            <ResultSkeleton />
          ) : !result ? (
            <Card padding="lg" className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                <ClipboardList className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">Your guidance will appear here</h3>
              <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
                Describe your symptoms and AuraHealth will suggest possible causes, urgency, and what to
                do next.
              </p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {!result.aiGenerated && (
                <div className="flex items-start gap-2.5 rounded-xl border border-gold-400/30 bg-gold-400/10 px-3.5 py-2.5 text-sm text-ink-muted">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                  <span>Demo response — enable AI on the server for a real analysis of your symptoms.</span>
                </div>
              )}

              {/* Urgency banner */}
              {urgency && (
                <Card padding="none" className="overflow-hidden">
                  <div className={cn('h-1.5 w-full', urgency.bar)} />
                  <div className="flex items-start gap-3.5 p-5">
                    <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset', urgency.ring)}>
                      <urgency.icon className="h-5.5 w-5.5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink">Assessed urgency</h3>
                        <Badge tone={urgency.tone}>{urgency.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">{result.urgencyReason}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Summary */}
              <Card padding="lg">
                <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-ink-subtle">Summary</h3>
                <p className="text-[15px] leading-relaxed text-ink">{result.summary}</p>
              </Card>

              {/* Possible conditions */}
              {result.possibleConditions.length > 0 && (
                <Card padding="lg">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
                    <Activity className="h-4.5 w-4.5 text-brand-600" /> Possible considerations
                  </h3>
                  <div className="space-y-2.5">
                    {result.possibleConditions.map((c, i) => (
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
                {result.recommendedActions.length > 0 && (
                  <ListCard
                    icon={<ClipboardList className="h-4.5 w-4.5 text-brand-600" />}
                    title="Recommended next steps"
                    items={result.recommendedActions}
                    marker="chevron"
                  />
                )}
                {result.selfCare.length > 0 && (
                  <ListCard
                    icon={<HeartHandshake className="h-4.5 w-4.5 text-success" />}
                    title="Self-care"
                    items={result.selfCare}
                    marker="dot"
                  />
                )}
              </div>

              {/* Seek care if */}
              {result.seekCareIf.length > 0 && (
                <Card padding="lg" variant="outline" className="border-danger/25 bg-danger/[0.04]">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-danger">
                    <Siren className="h-4.5 w-4.5" /> Seek urgent care if…
                  </h3>
                  <ul className="space-y-2">
                    {result.seekCareIf.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <p className="px-1 text-xs leading-relaxed text-ink-subtle">{result.disclaimer}</p>

              <Button variant="secondary" onClick={resetAll} leftIcon={<RotateCcw className="h-4 w-4" />}>
                Start a new check
              </Button>
            </motion.div>
          )}
        </div>
      </div>
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
