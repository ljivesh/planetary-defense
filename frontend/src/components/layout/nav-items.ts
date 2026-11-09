export interface NavItem {
  to: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview' },
  { to: '/close-approaches', label: 'Approaches' },
  { to: '/risk', label: 'Risk' },
  { to: '/fireballs', label: 'Fireballs' },
]
