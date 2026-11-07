import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { LoadingChart } from '@/components/common/loading-block'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export function AppShell() {
  return (
    <div className="flex min-h-dvh dark:starfield">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
          <Suspense fallback={<LoadingChart />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
