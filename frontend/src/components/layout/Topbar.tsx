import { Link } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Avatar, SearchBar, ThemeSwitcher } from '@/components/ui'
import { Logo } from './Logo'

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
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
        <SearchBar className="hidden lg:flex lg:w-72" />

        <div className="flex-1" />

        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-muted transition hover:bg-line/60 hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral-400 ring-2 ring-surface" />
        </button>

        <ThemeSwitcher />

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

