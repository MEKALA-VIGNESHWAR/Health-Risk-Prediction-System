import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'coral' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-soft hover:shadow-glow hover:brightness-[1.04] active:brightness-95',
  secondary:
    'bg-surface text-ink border border-line shadow-soft hover:border-brand-300 hover:bg-brand-50/60 dark:hover:bg-brand-500/10',
  outline:
    'border border-brand-500/40 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10',
  ghost: 'text-ink-muted hover:bg-line/60 hover:text-ink',
  subtle: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-500/16',
  coral: 'bg-coral-gradient text-white shadow-soft hover:brightness-[1.04] active:brightness-95',
  danger: 'bg-danger text-white shadow-soft hover:brightness-105 active:brightness-95',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'group relative inline-flex select-none items-center justify-center font-semibold',
          'transition-all duration-200 ease-spring outline-none',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
          'active:scale-[0.98]',
          VARIANTS[variant],
          SIZES[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon}
        {size !== 'icon' && children}
        {size === 'icon' && !loading && children}
        {!loading && rightIcon}
      </button>
    )
  },
)
Button.displayName = 'Button'
