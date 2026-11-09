import { Search } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { cn } from '@/lib/utils'

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/**
 * Jump to an object profile by designation, number or name (e.g. "Apophis",
 * "99942"). Press "/" anywhere to focus it.
 */
export function ObjectSearch({ className }: { className?: string }) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !isTypingTarget(e.target)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    navigate(`/objects/${encodeURIComponent(q)}`)
    setValue('')
    inputRef.current?.blur()
  }

  return (
    <search className={cn('w-full', className)}>
      <form onSubmit={onSubmit} className="group relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-ink" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
          placeholder="Apophis, Bennu, 99942…"
          aria-label="Look up an object by designation or name"
          className="h-8 w-full rounded-[2px] border border-hairline bg-surface pr-8 pl-8 font-mono text-xs text-ink outline-none placeholder:text-muted-ink focus:border-signal"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 border border-hairline-strong px-1 font-mono text-[10px] leading-4 text-muted-ink group-focus-within:hidden">
          /
        </kbd>
      </form>
    </search>
  )
}
