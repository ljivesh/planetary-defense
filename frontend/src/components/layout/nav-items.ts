import { Flame, LayoutDashboard, Orbit, ShieldAlert, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, description: 'Situation at a glance' },
  { to: '/close-approaches', label: 'Close approaches', icon: Orbit, description: 'Upcoming Earth flybys' },
  { to: '/risk', label: 'Impact risk', icon: ShieldAlert, description: 'Sentry risk table' },
  { to: '/fireballs', label: 'Fireballs', icon: Flame, description: 'Atmospheric impacts' },
]
