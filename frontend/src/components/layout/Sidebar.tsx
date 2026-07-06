import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui'
import { Logo } from './Logo'
import { NAV } from './nav'

function NavRow({ item, onNavigate }: { item: (typeof NAV)[number]['items'][number]; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'text-brand-700 dark:text-brand-300'
            : 'text-ink-muted hover:bg-line/50 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 -z-10 rounded-xl bg-brand-500/12 ring-1 ring-inset ring-brand-500/20"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
          )}
          <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-brand-600')} strokeWidth={2} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.soon && (
            <span className="rounded-full bg-line/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
              Soon
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, displayName, role, user } = useAuth()
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-2 pt-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 no-scrollbar">
        {NAV.map((section) => (
          <div key={section.heading}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              {section.heading}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-2xl bg-surface/60 p-2">
          <Link
            to="/profile"
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition hover:bg-line/50"
            title="View profile"
          >
            <Avatar name={displayName} src={user?.avatarUrl} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
              <p className="truncate text-xs capitalize text-ink-subtle">
                {role} · @{user?.username}
              </p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-subtle transition hover:bg-danger/10 hover:text-danger"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Desktop persistent sidebar. */
export function Sidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-line bg-surface/50 lg:block">
      <div className="sticky top-0 h-dvh">
        <SidebarContent />
      </div>
    </aside>
  )
}
