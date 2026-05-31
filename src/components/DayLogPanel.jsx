import { useEffect, useId, useMemo } from 'react'
import JournalParentMessageIdeas from './JournalParentMessageIdeas'
import TripPlacesField from './TripPlacesField'

/** Merge trip log + notes into one field for editing; persist as notes only so mileage math still runs on the same text. */
function mergedDayNotes(d) {
  const t = (d?.tripLog || '').trim()
  const n = d?.notes || ''
  if (t && n) return `${t}\n\n${n}`
  return t || n
}

export function DayLogPanel({ iso, day, onChange, ensureDay, receiptWeekKey = '' }) {
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
          <p className="trip-log__type-hint muted">
            Mood, story, sleep — and <strong>place names</strong> for mileage (same as Kid journal). Use{' '}
            <strong>then</strong> or <strong>+</strong> between stops for one trip. Weekly receipt totals trip log +
            journal together per day.
          </p>
          <TripPlacesField
            id={fieldId}
            value={displayValue}
            onChange={(v) => onChange(iso, { tripLog: '', notes: v })}
            aria-labelledby={labelId}
            placeholder="e.g. H's drop off then Lamorinda music…"
            receiptWeekKey={receiptWeekKey}
          />
          <JournalParentMessageIdeas dateISO={iso} variant="trip" />
        </div>
      </div>
    </div>
  )
}
