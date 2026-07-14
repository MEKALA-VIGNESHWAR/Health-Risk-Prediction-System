import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/auth/ProtectedRoute'
import { LoadingState } from '@/components/ui'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { VerifyEmail } from '@/pages/VerifyEmail'
import { NotFound } from '@/pages/NotFound'

// Code-split with retry on chunk loading failure (forces refresh to fetch new chunks after deployment)
function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | T>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const pageHasAlreadyForceReloaded = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-reloaded') || 'false'
    )

    try {
      const result = await componentImport()
      window.sessionStorage.setItem('page-has-been-force-reloaded', 'false')
      return 'default' in result ? result : { default: result } as any
    } catch (error) {
      if (!pageHasAlreadyForceReloaded) {
        window.sessionStorage.setItem('page-has-been-force-reloaded', 'true')
        window.location.reload()
      }
      throw error
    }
  })
}

const Assistant = lazyWithRetry(() => import('@/pages/Assistant').then((m) => ({ default: m.Assistant })))
const SymptomChecker = lazyWithRetry(() =>
  import('@/pages/SymptomChecker').then((m) => ({ default: m.SymptomChecker })),
)
const Profile = lazyWithRetry(() => import('@/pages/Profile').then((m) => ({ default: m.Profile })))
const Dashboard = lazyWithRetry(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const History = lazyWithRetry(() => import('@/pages/History').then((m) => ({ default: m.History })))
const Analytics = lazyWithRetry(() => import('@/pages/Analytics').then((m) => ({ default: m.Analytics })))
const Nutrition = lazyWithRetry(() => import('@/pages/Nutrition').then((m) => ({ default: m.Nutrition })))
const Fitness = lazyWithRetry(() => import('@/pages/Fitness').then((m) => ({ default: m.Fitness })))
const Reminders = lazyWithRetry(() => import('@/pages/Reminders').then((m) => ({ default: m.Reminders })))
const Reports = lazyWithRetry(() => import('@/pages/Reports').then((m) => ({ default: m.Reports })))
const Predictions = lazyWithRetry(() => import('@/pages/Predictions').then((m) => ({ default: m.Predictions })))
const Settings = lazyWithRetry(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))
const Admin = lazyWithRetry(() => import('@/pages/Admin').then((m) => ({ default: m.Admin })))

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState label="Preparing…" />}>{children}</Suspense>
}

export default function App() {
  return (
    <Routes>
      {/* Public auth pages */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Lazy><Dashboard /></Lazy>} />
          <Route path="/assistant" element={<Lazy><Assistant /></Lazy>} />
          <Route path="/symptoms" element={<Lazy><SymptomChecker /></Lazy>} />
          <Route path="/profile" element={<Lazy><Profile /></Lazy>} />
          <Route path="/history" element={<Lazy><History /></Lazy>} />
          <Route path="/analytics" element={<Lazy><Analytics /></Lazy>} />
          <Route path="/reports" element={<Lazy><Reports /></Lazy>} />
          <Route path="/predictions" element={<Lazy><Predictions /></Lazy>} />
          <Route path="/nutrition" element={<Lazy><Nutrition /></Lazy>} />
          <Route path="/fitness" element={<Lazy><Fitness /></Lazy>} />
          <Route path="/reminders" element={<Lazy><Reminders /></Lazy>} />
          <Route path="/settings" element={<Lazy><Settings /></Lazy>} />
          <Route path="/admin" element={<Lazy><Admin /></Lazy>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
