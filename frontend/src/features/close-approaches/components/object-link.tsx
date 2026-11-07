import { Link } from 'react-router'

interface ObjectLinkProps {
  designation: string
  name?: string
}

/** Link to an object's profile page; strips JPL's parentheses from provisional names. */
export function ObjectLink({ designation, name }: ObjectLinkProps) {
  const label = (name ?? designation).replace(/^\((.*)\)$/, '$1')
  return (
    <Link
      to={`/objects/${encodeURIComponent(designation)}`}
      onClick={(e) => e.stopPropagation()}
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  )
}
