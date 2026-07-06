import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/auth/ProtectedRoute'
import { LoadingState } from '@/components/ui'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Home } from '@/pages/Home'
import { ComingSoon } from '@/pages/ComingSoon'
import { NotFound } from '@/pages/NotFound'

// Code-split the heavier feature pages.
const Assistant = lazy(() => import('@/pages/Assistant').then((m) => ({ default: m.Assistant })))
const SymptomChecker = lazy(() =>
  import('@/pages/SymptomChecker').then((m) => ({ default: m.SymptomChecker })),
)
const Profile = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.Profile })))

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
      </Route>

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="/assistant" element={<Lazy><Assistant /></Lazy>} />
          <Route path="/symptoms" element={<Lazy><SymptomChecker /></Lazy>} />
          <Route path="/profile" element={<Lazy><Profile /></Lazy>} />
          <Route path="/predictions" element={<ComingSoon />} />
          <Route path="/analytics" element={<ComingSoon />} />
          <Route path="/reports" element={<ComingSoon />} />
          <Route path="/nutrition" element={<ComingSoon />} />
          <Route path="/fitness" element={<ComingSoon />} />
          <Route path="/reminders" element={<ComingSoon />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
