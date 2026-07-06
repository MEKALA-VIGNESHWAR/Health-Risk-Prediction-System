import { Link } from 'react-router-dom'
import { Menu, Moon, Sun, Bell, Search } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui'
import { Logo } from './Logo'

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { theme, toggle } = useTheme()
  const { displayName, user } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 glass">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Mobile: menu + logo */}
        <button
          onClick={onOpenMenu}
          className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition hover:bg-line/60 hover:text-ink lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <Logo compact />
        </div>

        {/* Desktop: search hint */}
        <button className="hidden items-center gap-2.5 rounded-xl border border-line bg-surface/60 px-3.5 py-2 text-sm text-ink-subtle transition hover:border-brand-300 hover:text-ink-muted lg:flex lg:w-72">
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle">
            ⌘K
          </kbd>
        </button>

        <div className="flex-1" />

        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition hover:bg-line/60 hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral-400 ring-2 ring-surface" />
        </button>

        <button
          onClick={toggle}
          className="grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition hover:bg-line/60 hover:text-ink"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <Link
          to="/profile"
          className="ml-1 rounded-full ring-2 ring-transparent transition hover:ring-brand-500/25"
          aria-label="Open profile"
          title="My profile"
        >
          <Avatar name={displayName} src={user?.avatarUrl} size="sm" />
        </Link>
      </div>
    </header>
  )
}
