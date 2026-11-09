import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

/** Two-position text switch: DARK / LIGHT, the active one in ink. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const target = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${target} theme`}
      className="eyebrow flex h-8 items-center gap-1 px-1 hover:text-body"
    >
      <span className={cn(theme === 'dark' && 'text-ink')}>Dark</span>
      <span aria-hidden>/</span>
      <span className={cn(theme === 'light' && 'text-ink')}>Light</span>
    </button>
  )
}
