import { useLocation, Link } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'

const TITLES: Record<string, { title: string; blurb: string }> = {
  '/predictions': {
    title: 'Health Predictions',
    blurb: 'AI-powered diabetes & heart risk reports with visual explanations and timelines.',
  },
  '/analytics': {
    title: 'Health Analytics',
    blurb: 'Beautiful trends for BMI, blood sugar, blood pressure, sleep and more.',
  },
  '/reports': {
    title: 'Report Analysis',
    blurb: 'Upload lab reports & scans — AI extracts, explains and flags abnormal values.',
  },
  '/nutrition': {
    title: 'Nutrition Planner',
    blurb: 'Personalized meal plans with calories and macros tailored to your goals.',
  },
  '/fitness': {
    title: 'Fitness Planner',
    blurb: 'Custom walking, gym, yoga and cardio schedules matched to your level.',
  },
  '/reminders': {
    title: 'Medicine Reminders',
    blurb: 'Never miss a dose — schedules, notifications and adherence history.',
  },
}

export function ComingSoon() {
  const { pathname } = useLocation()
  const meta = TITLES[pathname] ?? {
    title: 'Coming soon',
    blurb: 'This part of your health platform is on the way.',
  }

  return (
    <div>
      <PageHeader title={meta.title} subtitle="Part of an upcoming release" />
      <Card variant="gradient" padding="lg" className="overflow-hidden">
        <div className="relative flex flex-col items-center py-10 text-center">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow animate-float">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="max-w-md text-balance text-2xl font-bold text-ink">{meta.title}</h2>
          <p className="mt-2 max-w-md text-balance text-ink-muted">{meta.blurb}</p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
