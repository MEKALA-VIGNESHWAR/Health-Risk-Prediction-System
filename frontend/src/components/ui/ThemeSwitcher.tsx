import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className={cn(
        'relative overflow-hidden rounded-xl border border-line bg-surface/60 p-2 text-ink-muted hover:bg-line/60 hover:text-ink transition-colors duration-200 h-10 w-10 flex items-center justify-center',
        className
      )}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ y: theme === 'dark' ? 30 : 0, opacity: theme === 'dark' ? 0 : 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-center"
      >
        <Moon className="h-[18px] w-[18px] shrink-0" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ y: theme === 'dark' ? 0 : -30, opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 m-auto flex items-center justify-center"
      >
        <Sun className="h-[18px] w-[18px] shrink-0" />
      </motion.div>
    </button>
  )
}
