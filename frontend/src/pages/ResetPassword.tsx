import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Key, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './auth/AuthLayout'
import { Button, Input, useToast } from '@/components/ui'
import { api, ApiError } from '@/lib/api'

interface ResetResponse {
  success: boolean
  message: string
}

export function ResetPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Pre-fill token if navigated from forgot-password
  const prefilledToken = (location.state as { token?: string } | null)?.token || ''

  const [token, setToken] = useState(prefilledToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token.trim()) {
      setError('Reset token is required.')
      return
    }
    if (!newPassword) {
      setError('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post<ResetResponse>('/auth/reset-password', {
        token: token.trim(),
        newPassword
      })
      toast.success(res.message)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to reset password.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout heading="Password updated" subheading="Your credentials have been securely refreshed.">
        <div className="space-y-5 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          
          <p className="text-sm text-ink-muted">
            Your password has been successfully reset. You can now log in using your new credentials.
          </p>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
          >
            Sign in to Dashboard
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout heading="Reset Password" subheading="Enter your reset token and configure a new password.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Reset Token"
          placeholder="Enter reset token"
          leftIcon={<Key className="h-4.5 w-4.5" />}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          error={error && !token.trim() ? error : undefined}
        />
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4.5 w-4.5" />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={error && newPassword.length < 6 && newPassword.length > 0 ? error : undefined}
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4.5 w-4.5" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={error && newPassword !== confirmPassword && confirmPassword.length > 0 ? error : undefined}
        />

        {error && token.trim() && newPassword && newPassword === confirmPassword && (
          <div className="rounded-xl border border-danger/30 bg-danger/8 px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="h-4.5 w-4.5" />}>
          Reset password
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
