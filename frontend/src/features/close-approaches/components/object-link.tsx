import { Link } from 'react-router'

import { displayName } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ObjectLinkProps {
  designation: string
  name?: string
  className?: string
}

/** Link to an object's profile page. */
export function ObjectLink({ designation, name, className }: ObjectLinkProps) {
  return (
    <Link
      to={`/objects/${encodeURIComponent(designation)}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'text-ink decoration-hairline-strong underline-offset-4 hover:text-signal hover:underline',
        className,
      )}
    >
      {displayName(name ?? designation)}
    </Link>
  )
}
