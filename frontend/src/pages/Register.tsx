import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AtSign, Lock, User, Mail, ArrowRight } from 'lucide-react'
import { AuthLayout } from './auth/AuthLayout'
import { Button, Input, useToast } from '@/components/ui'
import { useAuth } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'

interface FormState {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

const EMPTY: FormState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = useState(false)

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.firstName.trim()) next.firstName = 'Required'
    if (!form.lastName.trim()) next.lastName = 'Required'
    if (form.username.trim().length < 3) next.username = 'At least 3 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
    if (form.password.length < 6) next.password = 'At least 6 characters'
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      toast.success('Account created — welcome to AuraHealth!')
      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not create your account.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout heading="Create your account" subheading="Start your personalized health journey in seconds.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Jane"
            autoComplete="given-name"
            leftIcon={<User className="h-4.5 w-4.5" />}
            value={form.firstName}
            onChange={set('firstName')}
            error={errors.firstName}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set('lastName')}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Username"
          placeholder="janedoe"
          autoComplete="username"
          leftIcon={<AtSign className="h-4.5 w-4.5" />}
          value={form.username}
          onChange={set('username')}
          error={errors.username}
        />
        <Input
          label="Email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          leftIcon={<Mail className="h-4.5 w-4.5" />}
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4.5 w-4.5" />}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
          <Input
            label="Confirm"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
          />
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="h-4.5 w-4.5" />}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
