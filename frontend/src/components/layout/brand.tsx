import { Shield } from 'lucide-react'
import { Link } from 'react-router'

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2 py-1">
      <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
        <Shield className="size-4.5" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Planetary Defense</span>
        <span className="block text-[11px] text-muted-foreground">NEO watch · JPL data</span>
      </span>
    </Link>
  )
}
