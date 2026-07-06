import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Sidebar, SidebarContent } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <div className="flex min-h-dvh">
      <Sidebar />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute left-0 top-0 h-full w-[280px] border-r border-line bg-surface shadow-lift"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-5 z-10 grid h-9 w-9 place-items-center rounded-xl text-ink-subtle transition hover:bg-line/60 hover:text-ink"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
