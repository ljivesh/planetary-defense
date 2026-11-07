import { Menu } from 'lucide-react'
import { useState } from 'react'

import { Brand } from '@/components/layout/brand'
import { ObjectSearch } from '@/components/layout/object-search'
import { DataCredit } from '@/components/layout/sidebar'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function Topbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-3">
          <SheetHeader className="p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand />
          </SheetHeader>
          <div className="mt-4 flex-1">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
          <DataCredit />
        </SheetContent>
      </Sheet>

      <ObjectSearch />
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
