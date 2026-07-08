import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

/**
 * Animated circular health-score gauge. Color shifts green→gold→coral as the
 * score drops. Pure SVG, no chart lib.
 */
export function ScoreRing({
  score,
  label,
  size = 168,
  stroke = 14,
}: {
  score: number
  label?: string
  size?: number
  stroke?: number
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  const dash = c * pct

  const color = score >= 70 ? '#0FA574' : score >= 50 ? '#E7B94F' : score >= 30 ? '#FF7A59' : '#E5484D'

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-line"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl font-extrabold leading-none text-ink"
          >
            {Math.round(score)}
          </motion.p>
          {label && (
            <p className={cn('mt-1 text-xs font-semibold uppercase tracking-wide')} style={{ color }}>
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
