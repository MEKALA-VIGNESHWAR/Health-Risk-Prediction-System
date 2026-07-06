import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui'
import { Logo } from '@/components/layout/Logo'

export function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <div className="mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
          <Compass className="h-8 w-8" />
        </div>
        <p className="mt-6 font-display text-6xl font-extrabold text-ink">404</p>
        <p className="mt-2 max-w-sm text-ink-muted">
          We couldn't find that page. It may have moved, or never existed.
        </p>
        <Link to="/" className="mt-6">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  )
}
