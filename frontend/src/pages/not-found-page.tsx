import { Telescope } from 'lucide-react'
import { Link } from 'react-router'

import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Telescope}
      title="Lost in space"
      description="We couldn't find that page."
      action={
        <Button asChild variant="outline">
          <Link to="/">Back to overview</Link>
        </Button>
      }
      className="py-24"
    />
  )
}
