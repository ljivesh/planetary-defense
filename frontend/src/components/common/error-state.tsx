import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  title?: string
  className?: string
}

export function ErrorState({ error, onRetry, title = 'Something went wrong', className }: ErrorStateProps) {
  const message = error instanceof ApiError || error instanceof Error ? error.message : 'An unexpected error occurred.'
  const code = error instanceof ApiError ? `${error.status} ${error.code}` : 'Error'
  return (
    <div role="alert" className={cn('border-l-2 border-status-critical py-2 pl-4', className)}>
      <p className="eyebrow text-status-critical">{code}</p>
      <p className="mt-1.5 text-base text-ink">{title}</p>
      <p className="mt-1 text-sm text-body">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  )
}
