import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui'
import { Logo } from './Logo'
import { NAV } from './nav'

function NavRow({
  item,
  onNavigate,
  collapsed = false,
}: {
  item: (typeof NAV)[number]['items'][number]
  onNavigate?: () => void
  collapsed?: boolean
}) {
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
          collapsed && 'justify-center px-0 h-10 w-10 mx-auto'
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
          {isActive && !collapsed && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
          )}
          <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-brand-600')} strokeWidth={2} />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          {!collapsed && item.soon && (
            <span className="rounded-full bg-line/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
              Soon
            </span>
          )}

          {/* Premium custom tooltip on hover when collapsed */}
          {collapsed && (
            <span className="absolute left-14 z-50 pointer-events-none hidden group-hover:flex items-center">
              <span className="h-2 w-2 bg-ink rotate-45 -mr-1 z-20" />
              <span className="rounded-md bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-soft whitespace-nowrap">
                {item.label}
                {item.soon && ' (Soon)'}
              </span>
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggle,
}: {
  onNavigate?: () => void
  collapsed?: boolean
  onToggle?: () => void
}) {
  const { logout, displayName, role, user } = useAuth()
  return (
    <div className="flex h-full flex-col">
      <div className={cn('px-5 pb-2 pt-6 flex items-center justify-between', collapsed && 'px-3 justify-center')}>
        <Logo compact={collapsed} />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 no-scrollbar">
        {NAV.map((section) => (
          <div key={section.heading}>
            {!collapsed ? (
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                {section.heading}
              </p>
            ) : (
              <div className="mx-auto my-3 w-8 border-t border-line/60" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={onNavigate} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3 space-y-2">
        <div className={cn('flex items-center gap-2 rounded-2xl bg-surface/60 p-2', collapsed && 'justify-center p-1')}>
          <Link
            to="/profile"
            onClick={onNavigate}
            className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition hover:bg-line/50', collapsed && 'p-0 justify-center')}
            title={collapsed ? `${displayName} (${role})` : 'View profile'}
          >
            <Avatar name={displayName} src={user?.avatarUrl} size={collapsed ? 'sm' : 'md'} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                <p className="truncate text-xs capitalize text-ink-subtle">
                  {role} · @{user?.username}
                </p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={logout}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-subtle transition hover:bg-danger/10 hover:text-danger"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          {collapsed && (
            <button
              onClick={logout}
              className="grid h-9 w-9 mx-auto place-items-center rounded-xl text-ink-subtle transition hover:bg-danger/10 hover:text-danger"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          )}

          {onToggle && (
            <button
              onClick={onToggle}
              className={cn(
                'hidden lg:grid h-9 w-9 place-items-center rounded-xl text-ink-subtle hover:bg-line/60 hover:text-ink transition-colors duration-200',
                collapsed ? 'mx-auto' : 'ml-auto',
              )}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronLeft className="h-[18px] w-[18px]" />
              </motion.div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Desktop persistent sidebar. */
export function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden shrink-0 border-r border-line bg-surface/50 lg:block overflow-hidden"
    >
      <div className="sticky top-0 h-dvh w-full">
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </div>
    </motion.aside>
  )
}

