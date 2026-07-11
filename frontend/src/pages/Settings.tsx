import { useState } from 'react'
import {
  Download,
  Moon,
  Sun,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Card, Button, Badge, Spinner } from '@/components/ui'
import { fetchReports } from '@/features/dashboard/reportsApi'
import { fetchDashboard } from '@/features/dashboard/dashboardApi'

export function Settings() {
  const { user } = useAuth()
  
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'glassmorphism')
  
  // Notification states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Export states
  const [exporting, setExporting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Toggle html document classes
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'glassmorphism')
    root.classList.add(newTheme)
  }

  const handleExportData = async () => {
    if (!user?.userId) return
    setExporting(true)
    setSuccess(false)
    try {
      const [fetchedReports, dashboardData] = await Promise.all([
        fetchReports(user.userId),
        fetchDashboard(user.userId),
      ])

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        userId: user.userId,
        username: user.username,
        email: user.email,
        diabetesPredictions: dashboardData.diabetes || [],
        heartPredictions: dashboardData.heart || [],
        labReports: fetchedReports || [],
      }

      // Trigger download
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aurahealth_export_${user.username}_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      setSuccess(true)
    } catch (err) {
      console.error('Failed to export metrics', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Platform Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Configure visual themes, browser triggers, and export local medical logs.
        </p>
      </div>

      <div className="space-y-6">
        {/* Visual Settings */}
        <Card padding="lg" className="space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Visual Theme</h3>
            <p className="text-xs text-ink-muted mt-0.5">Toggle interface accents.</p>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <button
              onClick={() => handleThemeChange('light')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-semibold transition',
                theme === 'light'
                  ? 'border-brand-500 bg-brand-50/5 text-brand-700 dark:text-brand-400'
                  : 'border-line hover:border-brand-200 text-ink-muted hover:text-ink',
              )}
            >
              <Sun className="h-5 w-5" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-semibold transition',
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-50/5 text-brand-700 dark:text-brand-400'
                  : 'border-line hover:border-brand-200 text-ink-muted hover:text-ink',
              )}
            >
              <Moon className="h-5 w-5" />
              <span>Dark Mode</span>
            </button>
            <button
              onClick={() => handleThemeChange('glassmorphism')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-semibold transition',
                theme === 'glassmorphism'
                  ? 'border-brand-500 bg-brand-50/5 text-brand-700 dark:text-brand-400'
                  : 'border-line hover:border-brand-200 text-ink-muted hover:text-ink',
              )}
            >
              <Eye className="h-5 w-5" />
              <span>Glassmorphism</span>
            </button>
          </div>
        </Card>

        {/* Notifications config */}
        <Card padding="lg" className="space-y-4 flex items-center justify-between">
          <div className="space-y-0.5 max-w-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Browser Notifications</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Enable reactive alerts for upcoming medication dosages and vital boundary warnings.
            </p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-xl border transition',
              notificationsEnabled
                ? 'border-brand-200 bg-brand-50/10 text-brand-700 dark:text-brand-400'
                : 'border-line text-ink-subtle',
            )}
          >
            {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </Card>

        {/* Data exporter */}
        <Card padding="lg" className="space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-subtle">Export Health Record</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Download all your historical predictions, diagnostic report analysis datasets, and logged parameters as a structured JSON file.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <Button
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-2 self-start"
            >
              {exporting ? (
                <>
                  <Spinner size={16} /> Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Export All Records
                </>
              )}
            </Button>
            {success && (
              <Badge tone="brand">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> File exported successfully.
                </span>
              </Badge>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

// Inline classnames utility fallback helper
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export default Settings
