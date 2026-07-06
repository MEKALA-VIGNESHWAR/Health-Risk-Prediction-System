import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
    >
      {icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
