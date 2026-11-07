import { NavLink } from 'react-router'

import { NAV_ITEMS } from '@/components/layout/nav-items'
import { cn } from '@/lib/utils'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('size-4', isActive && 'text-sidebar-primary')} aria-hidden />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
