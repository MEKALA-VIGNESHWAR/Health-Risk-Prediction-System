import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  eyebrow?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  )
}
