import {
  LayoutDashboard,
  Sparkles,
  Stethoscope,
  Activity,
  LineChart,
  BellRing,
  Apple,
  Dumbbell,
  FileText,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  soon?: boolean
  end?: boolean
}

export interface NavSection {
  heading: string
  items: NavItem[]
}

/**
 * Navigation reflects the product roadmap. Items marked `soon` are visible so
 * the platform feels complete, but route to a graceful "coming soon" screen —
 * they light up as later milestones ship.
 */
export const NAV: NavSection[] = [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true }],
  },
  {
    heading: 'AI Care',
    items: [
      { label: 'AI Assistant', to: '/assistant', icon: Sparkles },
      { label: 'Symptom Checker', to: '/symptoms', icon: Stethoscope },
    ],
  },
  {
    heading: 'Health',
    items: [
      { label: 'Predictions', to: '/predictions', icon: Activity, soon: true },
      { label: 'Analytics', to: '/analytics', icon: LineChart, soon: true },
      { label: 'Reports', to: '/reports', icon: FileText, soon: true },
    ],
  },
  {
    heading: 'Lifestyle',
    items: [
      { label: 'Nutrition', to: '/nutrition', icon: Apple, soon: true },
      { label: 'Fitness', to: '/fitness', icon: Dumbbell, soon: true },
      { label: 'Reminders', to: '/reminders', icon: BellRing, soon: true },
    ],
  },
  {
    heading: 'Account',
    items: [{ label: 'My Profile', to: '/profile', icon: UserRound }],
  },
]
