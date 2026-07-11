import { useState, useEffect } from 'react'
import { Search, FileText, Activity, BellRing, Heart, ExternalLink } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { Modal } from './Modal'
import { Spinner } from './Spinner'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export function SearchBar({ className, placeholder = 'Search everywhere…' }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    reports?: any[]
    diabetes?: any[]
    heart?: any[]
    reminders?: any[]
  }>({})
  const [searching, setSearching] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!query.trim() || !user?.userId) {
      setResults({})
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get<any>(`/search?q=${encodeURIComponent(query)}&userId=${user.userId}`)
        setResults(res || {})
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, user?.userId])

  const navigateToResult = (path: string) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  const hasResults =
    (results.reports && results.reports.length > 0) ||
    (results.diabetes && results.diabetes.length > 0) ||
    (results.heart && results.heart.length > 0) ||
    (results.reminders && results.reminders.length > 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2.5 rounded-xl border border-line bg-surface/60 px-3.5 py-2 text-sm text-ink-subtle transition hover:border-brand-300 hover:text-ink-muted',
          className
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{placeholder}</span>
        <kbd className="rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle shrink-0">
          ⌘K
        </kbd>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Global Clinical Search"
        description="Search predictions, reports text, and medication schedules."
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-ink-subtle" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cholesterol, high risk, metformin..."
              className="w-full pl-11 pr-4 py-3 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-1 space-y-4 scrollbar-thin">
            {searching && (
              <div className="py-12 flex justify-center items-center gap-2">
                <Spinner size={18} />
                <span className="text-xs text-ink-muted">Searching database nodes...</span>
              </div>
            )}

            {!searching && query.trim() && !hasResults && (
              <div className="py-12 text-center text-xs text-ink-muted">
                No matching clinical documents found.
              </div>
            )}

            {!searching && !query.trim() && (
              <div className="py-12 text-center text-xs text-ink-muted">
                Type something to start cross-entity database scans.
              </div>
            )}

            {!searching && hasResults && (
              <div className="space-y-3">
                {results.reports && results.reports.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1">Medical Reports</h5>
                    <div className="space-y-1.5">
                      {results.reports.map((r: any) => (
                        <div
                          key={r.id}
                          onClick={() => navigateToResult('/history')}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface/30 hover:bg-surface transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs text-ink font-medium">
                            <FileText className="h-4 w-4 text-coral-500 shrink-0" />
                            {r.fileName}
                          </span>
                          <ExternalLink className="h-3 w-3 text-ink-subtle" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.diabetes && results.diabetes.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1">Diabetes Predictions</h5>
                    <div className="space-y-1.5">
                      {results.diabetes.map((d: any) => (
                        <div
                          key={d.id}
                          onClick={() => navigateToResult('/')}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface/30 hover:bg-surface transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs text-ink font-medium">
                            <Activity className="h-4 w-4 text-brand-500 shrink-0" />
                            Diabetes assessment: {d.riskLevel} Check
                          </span>
                          <ExternalLink className="h-3 w-3 text-ink-subtle" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.heart && results.heart.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1">Cardio Predictions</h5>
                    <div className="space-y-1.5">
                      {results.heart.map((h: any) => (
                        <div
                          key={h.id}
                          onClick={() => navigateToResult('/')}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface/30 hover:bg-surface transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs text-ink font-medium">
                            <Heart className="h-4 w-4 text-info shrink-0" />
                            Heart Risk assessment: {h.riskLevel} Check
                          </span>
                          <ExternalLink className="h-3 w-3 text-ink-subtle" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.reminders && results.reminders.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-1">Medication Reminders</h5>
                    <div className="space-y-1.5">
                      {results.reminders.map((rem: any) => (
                        <div
                          key={rem.id}
                          onClick={() => navigateToResult('/reminders')}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-line bg-surface/30 hover:bg-surface transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs text-ink font-medium">
                            <BellRing className="h-4 w-4 text-warning shrink-0" />
                            {rem.medicineName} ({rem.dosage})
                          </span>
                          <ExternalLink className="h-3 w-3 text-ink-subtle" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
