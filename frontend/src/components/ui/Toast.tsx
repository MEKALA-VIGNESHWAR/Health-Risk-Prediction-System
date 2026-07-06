import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  title?: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastOptions {
  title?: string
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const ACCENT: Record<ToastVariant, string> = {
  success: 'text-success bg-success/10',
  error: 'text-danger bg-danger/10',
  warning: 'text-warning bg-warning/10',
  info: 'text-info bg-info/10',
}

const BAR: Record<ToastVariant, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message: string, variant: ToastVariant = 'info', options?: ToastOptions) => {
      const id = ++idRef.current
      const duration = options?.duration ?? 4200
      setToasts((prev) => [...prev, { id, message, variant, title: options?.title, duration }])
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration)
      }
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: push,
      success: (m, o) => push(m, 'success', o),
      error: (m, o) => push(m, 'error', o),
      warning: (m, o) => push(m, 'warning', o),
      info: (m, o) => push(m, 'info', o),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2.5 px-4 pt-4 sm:items-end sm:px-6">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="glass-strong pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl shadow-lift"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3 p-3.5 pr-10">
                  <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', ACCENT[t.variant])}>
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    {t.title && <p className="text-sm font-semibold text-ink">{t.title}</p>}
                    <p className="text-sm leading-snug text-ink-muted">{t.message}</p>
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="absolute right-2.5 top-2.5 rounded-lg p-1 text-ink-subtle transition hover:bg-line/60 hover:text-ink"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {t.duration > 0 && (
                  <motion.div
                    className={cn('absolute bottom-0 left-0 h-[3px]', BAR[t.variant])}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: t.duration / 1000, ease: 'linear' }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
