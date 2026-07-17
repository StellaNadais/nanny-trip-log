import { useEffect, useId, useMemo } from 'react'
import TripPlacesField from './TripPlacesField'

/** Merge trip log + notes into one field for editing; persist as notes only so mileage math still runs on the same text. */
function mergedDayNotes(d) {
  const t = (d?.tripLog || '').trim()
  const n = d?.notes || ''
  if (t && n) return `${t}\n\n${n}`
  return t || n
}

export function DayLogPanel({ iso, day, onChange, ensureDay }) {
  useEffect(() => {
    ensureDay(iso)
  }, [iso, ensureDay])

  const d = day || {}
  const fieldId = useId()
  const labelId = `${fieldId}-label`

  const displayValue = useMemo(() => mergedDayNotes(d), [d.tripLog, d.notes])

  return (
    <div className="day-panel">
      <div className="day-panel__grid">
        <div className="field-block field-block--trip-log">
          <span id={labelId} className="field-block__label">
            Day notes &amp; outings
          </span>
          <TripPlacesField
            id={fieldId}
            value={displayValue}
            onChange={(v) => onChange(iso, { tripLog: '', notes: v })}
            aria-labelledby={labelId}
            placeholder="e.g. Drop-off then music…"
          />
        </div>
      </div>
    </div>
  )
}
