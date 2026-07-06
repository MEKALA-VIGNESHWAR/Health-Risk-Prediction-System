import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  hideClose?: boolean
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn(
              'relative w-full rounded-t-3xl bg-card shadow-lift sm:rounded-3xl',
              'border border-line',
              SIZES[size],
            )}
          >
            {(title || !hideClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div>
                  {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
                </div>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="-mr-1.5 -mt-1.5 rounded-xl p-2 text-ink-subtle transition hover:bg-line/60 hover:text-ink"
                    aria-label="Close dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            {children && <div className="px-6 py-5">{children}</div>}
            {footer && (
              <div className="flex flex-col-reverse gap-2.5 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Premium confirm dialog — replaces window.confirm(). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm leading-relaxed text-ink-muted">{message}</p>}
    </Modal>
  )
}
