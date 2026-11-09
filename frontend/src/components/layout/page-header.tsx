import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Mono line above the title, e.g. the data source. */
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="pt-10 pb-10 md:pt-14">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display min-w-0 text-4xl md:text-5xl">{title}</h1>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-body">{description}</p>}
    </header>
  )
}
