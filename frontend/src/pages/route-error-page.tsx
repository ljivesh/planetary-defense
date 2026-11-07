import { isRouteErrorResponse, useRouteError } from 'react-router'

import { ErrorState } from '@/components/common/error-state'

/** Router-level error boundary (render errors, failed lazy imports). */
export default function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? new Error(`${error.status} ${error.statusText}`) : error
  return (
    <div className="mx-auto max-w-xl p-8">
      <ErrorState error={message} title="This page crashed" onRetry={() => window.location.reload()} />
    </div>
  )
}
