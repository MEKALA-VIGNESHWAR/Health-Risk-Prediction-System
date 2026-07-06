import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  containerClassName?: string
}

const baseField =
  'w-full rounded-xl border bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-subtle ' +
  'transition-all duration-200 outline-none focus:ring-4 focus:ring-brand-500/15 disabled:opacity-60'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, hint, error, leftIcon, type = 'text', id, ...props }, ref) => {
    const autoId = useId()
    const inputId = id || autoId
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const effectiveType = isPassword ? (show ? 'text' : 'password') : type

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              baseField,
              'h-11',
              leftIcon && 'pl-10',
              isPassword && 'pr-11',
              error
                ? 'border-danger/60 focus:ring-danger/15'
                : 'border-line focus:border-brand-400',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-subtle transition hover:bg-line/60 hover:text-ink"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-[13px] font-medium text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[13px] text-ink-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ className, label, error, id, ...props }, ref) => {
  const autoId = useId()
  const tid = id || autoId
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={tid} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        className={cn(
          baseField,
          'min-h-[110px] resize-y py-3 leading-relaxed',
          error ? 'border-danger/60 focus:ring-danger/15' : 'border-line focus:border-brand-400',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-[13px] font-medium text-danger">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'
