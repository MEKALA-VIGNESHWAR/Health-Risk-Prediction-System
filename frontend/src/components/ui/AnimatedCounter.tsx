import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef<number>(0)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const startVal = prevValueRef.current
    const controls = animate(startVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate(val) {
        node.textContent = `${prefix}${val.toFixed(decimals)}${suffix}`
      },
    })

    prevValueRef.current = value
    return () => controls.stop()
  }, [value, duration, decimals, prefix, suffix])

  return (
    <span ref={nodeRef} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}
