import { AlertTriangle, RotateCw } from 'lucide-react'

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
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center',
        className,
      )}
    >
      <AlertTriangle className="size-6 text-status-serious" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  )
}
