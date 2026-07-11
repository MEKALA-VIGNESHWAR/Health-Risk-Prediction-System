import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './auth/AuthLayout'
import { Button, Input, useToast } from '@/components/ui'
import { api, ApiError } from '@/lib/api'

interface VerifyResponse {
  success: boolean
  message: string
}

export function VerifyEmail() {
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email address is required.')
      return
    }
    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit verification code.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post<VerifyResponse>('/api/auth/verify-email', {
        email: email.trim(),
        code: code.trim()
      })
      toast.success(res.message)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Verification failed.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout heading="Email Verified" subheading="Your account has been successfully verified.">
        <div className="space-y-5 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          
          <p className="text-sm text-ink-muted">
            Thank you! Your email has been verified. You can now access all features on your health dashboard.
          </p>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
          >
            Go to login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout heading="Verify Email" subheading="Enter the verification code sent to your email.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !email.trim() ? error : undefined}
        />
        <Input
          label="6-Digit Code"
          placeholder="000000"
          maxLength={6}
          leftIcon={<ShieldAlert className="h-4.5 w-4.5" />}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          error={error && (code.length !== 6 && code.length > 0) ? error : undefined}
        />

        {error && email.trim() && code.length === 6 && (
          <div className="rounded-xl border border-danger/30 bg-danger/8 px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="h-4.5 w-4.5" />}>
          Verify email
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </p>
    </AuthLayout>
  )
}
