import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { LoadingChart } from '@/components/common/loading-block'
import { Footer, Masthead } from '@/components/layout/masthead'

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Masthead />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 md:px-8">
        <Suspense fallback={<LoadingChart className="mt-14" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
