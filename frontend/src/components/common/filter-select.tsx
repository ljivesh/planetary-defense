import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface FilterOption {
  value: string
  label: string
}

interface FilterSelectProps {
  id: string
  label: string
  value: string
  options: readonly FilterOption[]
  onChange: (value: string) => void
}

/** Compact inline filter: mono label, then a borderless select. */
export function FilterSelect({ id, label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          size="sm"
          className="h-7 gap-1.5 border-hairline-strong bg-transparent px-2 text-xs text-ink shadow-none dark:bg-transparent"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-[2px] border-hairline-strong bg-canvas shadow-none">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
