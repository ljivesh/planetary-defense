import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { Input } from '@/components/ui/input'

/** Jump to an object profile by designation, number or name (e.g. "Apophis", "99942"). */
export function ObjectSearch() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    navigate(`/objects/${encodeURIComponent(q)}`)
    setValue('')
  }

  return (
    <search className="w-full max-w-sm">
      <form onSubmit={onSubmit} className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Look up an object… (e.g. Apophis, Bennu, 99942)"
          aria-label="Look up an object by designation or name"
          className="pl-8"
        />
      </form>
    </search>
  )
}
