import { FilterSelect } from '@/components/common/filter-select'
import {
  APPROACH_FILTER_DEFAULTS,
  DISTANCE_OPTIONS,
  SIZE_OPTIONS,
  WINDOW_OPTIONS,
  type ApproachFilterState,
} from '@/features/close-approaches/filters'

interface ApproachFiltersProps {
  value: ApproachFilterState
  onChange: (patch: Partial<ApproachFilterState>) => void
  onReset: () => void
}

/** One filter row that scopes every chart and table below it. */
export function ApproachFiltersBar({ value, onChange, onReset }: ApproachFiltersProps) {
  const isDefault = (Object.keys(APPROACH_FILTER_DEFAULTS) as (keyof ApproachFilterState)[]).every(
    (k) => value[k] === APPROACH_FILTER_DEFAULTS[k],
  )
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-hairline py-3">
      <FilterSelect
        id="filter-window"
        label="Window"
        value={value.window}
        options={WINDOW_OPTIONS}
        onChange={(window) => onChange({ window })}
      />
      <FilterSelect
        id="filter-distance"
        label="Distance"
        value={value.dist}
        options={DISTANCE_OPTIONS}
        onChange={(dist) => onChange({ dist })}
      />
      <FilterSelect
        id="filter-size"
        label="Size"
        value={value.minSize}
        options={SIZE_OPTIONS}
        onChange={(minSize) => onChange({ minSize })}
      />
      {!isDefault && (
        <button type="button" onClick={onReset} className="eyebrow ml-auto text-body hover:text-signal">
          Reset ×
        </button>
      )}
    </div>
  )
}
