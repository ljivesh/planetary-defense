import { ExternalLink } from 'lucide-react'

import { Brand } from '@/components/layout/brand'
import { SidebarNav } from '@/components/layout/sidebar-nav'

/** Fixed left sidebar on large screens. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 lg:flex">
      <Brand />
      <div className="mt-6 flex-1">
        <SidebarNav />
      </div>
      <DataCredit />
    </aside>
  )
}

export function DataCredit() {
  return (
    <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
      Data:{' '}
      <a
        href="https://ssd-api.jpl.nasa.gov/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-0.5 underline-offset-2 hover:text-foreground hover:underline"
      >
        NASA/JPL SSD &amp; CNEOS <ExternalLink className="size-3" aria-hidden />
      </a>
    </p>
  )
}
