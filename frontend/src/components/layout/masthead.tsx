import { Link, NavLink } from 'react-router'

import { NAV_ITEMS } from '@/components/layout/nav-items'
import { ObjectSearch } from '@/components/layout/object-search'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { UtcClock } from '@/components/layout/utc-clock'
import { cn } from '@/lib/utils'

function MainNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Main" className={cn('flex items-stretch gap-6', className)}>
      {NAV_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'eyebrow relative flex shrink-0 items-center transition-colors hover:text-ink',
              isActive && 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-signal',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

/** Single-row top bar: wordmark, nav, search, UTC clock, theme switch. */
export function Masthead() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-12 max-w-[1280px] items-stretch gap-8 px-4 md:px-8">
        <Link to="/" className="flex shrink-0 items-center font-mono text-xs font-semibold tracking-[0.16em] text-ink">
          PLANETARY DEFENSE
        </Link>
        <MainNav className="hidden md:flex" />
        <div className="ml-auto flex items-center gap-5">
          <ObjectSearch className="hidden w-60 sm:block" />
          <UtcClock className="hidden xl:block" />
          <ThemeToggle />
        </div>
      </div>
      {/* Small screens: nav and search move to a second row. */}
      <div className="flex h-10 items-stretch gap-4 overflow-x-auto border-t border-hairline px-4 md:hidden">
        <MainNav />
      </div>
      <div className="border-t border-hairline px-4 py-2 sm:hidden">
        <ObjectSearch />
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-6 sm:flex-row sm:justify-between md:px-8">
        <p className="eyebrow">
          Data{' '}
          <a
            href="https://ssd-api.jpl.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="text-body underline-offset-4 hover:text-signal hover:underline"
          >
            NASA/JPL SSD &amp; CNEOS ↗
          </a>
        </p>
        <p className="eyebrow">Two-body approximations · not for operational use</p>
      </div>
    </footer>
  )
}
