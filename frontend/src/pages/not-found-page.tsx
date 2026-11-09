import { EmptyState } from '@/components/common/empty-state'
import { TextLink } from '@/components/common/text-link'

export default function NotFoundPage() {
  return (
    <EmptyState
      label="404"
      title="Nothing at these coordinates."
      description="The page you asked for doesn't exist."
      action={<TextLink to="/">Back to overview</TextLink>}
      className="py-24"
    />
  )
}
