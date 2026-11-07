import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import RouteErrorPage from '@/pages/route-error-page'

/** Route-level code splitting: each page is its own chunk. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, lazy: page(() => import('@/pages/dashboard-page')) },
      { path: 'close-approaches', lazy: page(() => import('@/pages/close-approaches-page')) },
      { path: 'risk', lazy: page(() => import('@/pages/risk-page')) },
      { path: 'fireballs', lazy: page(() => import('@/pages/fireballs-page')) },
      { path: 'objects/:designation', lazy: page(() => import('@/pages/object-detail-page')) },
      { path: '*', lazy: page(() => import('@/pages/not-found-page')) },
    ],
  },
])
