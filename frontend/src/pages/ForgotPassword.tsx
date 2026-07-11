import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './auth/AuthLayout'
import { Button, Input, useToast } from '@/components/ui'
import { api, ApiError } from '@/lib/api'

interface ForgotResponse {
  success: boolean
  message: string
  token?: string
}

export function ForgotPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post<ForgotResponse>('/auth/forgot-password', { email: email.trim() })
      toast.success(res.message)
      if (res.token) {
        setResetToken(res.token)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to send reset link.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (resetToken) {
    return (
      <AuthLayout heading="Check your email" subheading="Instructions and a reset token have been dispatched.">
        <div className="space-y-5 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-ink-muted">
              We have generated a password reset token for your account. You can use it to set a new password.
            </p>
            <div className="rounded-xl border border-brand-500/15 bg-brand-50/20 p-3.5 font-mono text-[13px] font-semibold text-brand-700 select-all">
              {resetToken}
            </div>
          </div>

          <Button
            fullWidth
            onClick={() => navigate('/reset-password', { state: { token: resetToken } })}
            rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
          >
            Reset password now
          </Button>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-subtle hover:text-ink transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout heading="Forgot Password" subheading="Enter your email address and we'll send reset instructions.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          leftIcon={<Mail className="h-4.5 w-4.5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ? error : undefined}
        />

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="h-4.5 w-4.5" />}>
          Request reset token
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
