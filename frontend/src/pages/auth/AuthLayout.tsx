import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Activity } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'

const HIGHLIGHTS = [
  { icon: Sparkles, title: 'AI health assistant', desc: 'Ask anything about symptoms, meds, diet & fitness.' },
  { icon: Activity, title: 'Risk intelligence', desc: 'Explainable diabetes & heart risk, visualized.' },
  { icon: ShieldCheck, title: 'Private & secure', desc: 'Your health data stays yours, always.' },
]

export function AuthLayout({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode
  heading: string
  subheading: string
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-gradient lg:block">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-coral-400/25 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo className="[&_span]:!text-white [&_span_span]:!text-cream-100" />

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md font-display text-4xl font-extrabold leading-tight text-balance"
            >
              Your intelligent partner in everyday health.
            </motion.h2>
            <p className="mt-4 max-w-md text-brand-50/90">
              PulseMind turns complex health signals into clear, personalized guidance — powered by AI.
            </p>

            <div className="mt-10 space-y-4">
              {HIGHLIGHTS.map((h, i) => {
                const Icon = h.icon
                return (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex items-start gap-3.5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{h.title}</p>
                      <p className="text-sm text-brand-50/80">{h.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <p className="text-sm text-brand-50/70">
            Not a medical device. PulseMind provides guidance, not diagnosis.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">{heading}</h1>
          <p className="mt-1.5 text-ink-muted">{subheading}</p>
          <div className="mt-7">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}
