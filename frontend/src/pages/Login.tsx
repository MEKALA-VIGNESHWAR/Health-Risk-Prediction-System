import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AtSign, Lock, ArrowRight } from 'lucide-react'
import { AuthLayout } from './auth/AuthLayout'
import { Button, Input, useToast } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'

export function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password) {
      setError('Please enter your username and password.')
      return
    }
    setLoading(true)
    try {
      const user = await login(username.trim(), password)
      toast.success(`Welcome back, ${user.firstName || user.username}!`)
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout heading="Welcome back" subheading="Sign in to continue to your health dashboard.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Username"
          placeholder="your username"
          autoComplete="username"
          leftIcon={<AtSign className="h-4.5 w-4.5" />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={error && !username.trim() ? error : undefined}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4.5 w-4.5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && username.trim() && (
          <div className="rounded-xl border border-danger/30 bg-danger/8 px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500/30" />
            Remember me
          </label>
          <button type="button" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="h-4.5 w-4.5" />}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to AuraHealth?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-line bg-surface/60 p-3 text-center text-xs text-ink-subtle">
        Demo patient: <span className="font-mono font-semibold text-ink-muted">testuser</span> /{' '}
        <span className="font-mono font-semibold text-ink-muted">Test@123</span>
      </div>
    </AuthLayout>
  )
}
