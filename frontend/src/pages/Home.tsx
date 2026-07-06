import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Stethoscope,
  Activity,
  LineChart,
  ArrowRight,
  Droplets,
  Moon,
  HeartPulse,
  Sun,
  Apple,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const QUICK_ACTIONS = [
  {
    to: '/assistant',
    icon: Sparkles,
    title: 'AI Assistant',
    desc: 'Ask about symptoms, meds, diet & more',
    tone: 'from-brand-500/12 to-brand-500/5 text-brand-600',
    live: true,
  },
  {
    to: '/symptoms',
    icon: Stethoscope,
    title: 'Symptom Checker',
    desc: 'Describe how you feel in plain words',
    tone: 'from-coral-400/14 to-coral-400/5 text-coral-500',
    live: true,
  },
  {
    to: '/predictions',
    icon: Activity,
    title: 'Risk Prediction',
    desc: 'Diabetes & heart risk, explained',
    tone: 'from-info/12 to-info/5 text-info',
    live: false,
  },
  {
    to: '/analytics',
    icon: LineChart,
    title: 'Analytics',
    desc: 'Trends across your key metrics',
    tone: 'from-gold-400/16 to-gold-400/5 text-gold-500',
    live: false,
  },
]

const TIPS = [
  { icon: Droplets, title: 'Hydrate early', text: 'Aim for a glass of water within 30 minutes of waking to kick-start metabolism.', tone: 'text-info bg-info/10' },
  { icon: Moon, title: 'Protect your sleep', text: '7–9 hours nightly supports heart health and steady blood sugar.', tone: 'text-brand-600 bg-brand-500/10' },
  { icon: HeartPulse, title: 'Move often', text: 'A brisk 10-minute walk after meals helps blunt glucose spikes.', tone: 'text-coral-500 bg-coral-400/12' },
  { icon: Apple, title: 'Eat the rainbow', text: 'Colorful vegetables add fiber and antioxidants that support metabolic health.', tone: 'text-success bg-success/10' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function Home() {
  const { displayName } = useAuth()
  const firstName = displayName.split(' ')[0]

  return (
    <div className="space-y-7">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="solid" padding="none" className="relative overflow-hidden border-brand-500/15">
          <div className="absolute inset-0 bg-brand-gradient" />
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-coral-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Badge tone="neutral" className="!bg-white/15 !text-white !ring-white/20" icon={<Sun className="h-3.5 w-3.5" />}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Badge>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-[34px]">
                {greeting()}, {firstName}.
              </h1>
              <p className="mt-2 max-w-lg text-brand-50/90">
                Your AI health companion is ready. Ask a question, check a symptom, or explore your
                risk insights — all in one calm, private place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/assistant">
                  <Button variant="coral" size="lg" leftIcon={<Sparkles className="h-4.5 w-4.5" />}>
                    Ask AuraHealth
                  </Button>
                </Link>
                <Link to="/symptoms">
                  <Button
                    size="lg"
                    className="!bg-white/15 !text-white ring-1 ring-inset ring-white/25 hover:!bg-white/25"
                    leftIcon={<Stethoscope className="h-4.5 w-4.5" />}
                  >
                    Check symptoms
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="grid h-32 w-32 place-items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-sm animate-float">
                <HeartPulse className="h-14 w-14 text-white" strokeWidth={1.6} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <section>
        <div className="mb-3.5 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-ink">Quick actions</h2>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon
            return (
              <motion.div key={a.to} variants={item}>
                <Link to={a.to}>
                  <Card interactive padding="md" className="h-full">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${a.tone}`}>
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <h3 className="font-semibold text-ink">{a.title}</h3>
                      {!a.live && <Badge tone="neutral">Soon</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">{a.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-600">
                      {a.live ? 'Open' : 'Preview'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Health tips + getting started */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3.5 text-lg font-semibold text-ink">Today's health tips</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TIPS.map((t) => {
              const Icon = t.icon
              return (
                <Card key={t.title} padding="md" className="flex gap-3.5">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${t.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{t.title}</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">{t.text}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3.5 text-lg font-semibold text-ink">Get started</h2>
          <Card variant="gradient" padding="lg" className="h-[calc(100%-2.75rem)]">
            <h3 className="font-display text-lg font-bold text-ink">Make it yours</h3>
            <p className="mt-1.5 text-sm text-ink-muted">
              A few quick steps unlock personalized insights.
            </p>
            <ol className="mt-5 space-y-3.5">
              {[
                'Chat with the AI assistant about a health goal',
                'Describe any symptoms you have today',
                'Run your first risk prediction (coming soon)',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink">{step}</span>
                </li>
              ))}
            </ol>
            <Link to="/assistant" className="mt-6 block">
              <Button fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start with the assistant
              </Button>
            </Link>
          </Card>
        </section>
      </div>
    </div>
  )
}
