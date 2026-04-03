import { useEffect, useId } from 'react'
import TripPlacesField from './TripPlacesField'

const fields = [
  { key: 'notes', label: 'Day notes for parents', rows: 4, hint: 'Evening story, sleep times, mood' },
]

export function DayLogPanel({ iso, day, onChange, ensureDay }) {
  useEffect(() => {
    ensureDay(iso)
  }, [iso, ensureDay])

  const d = day || {}
  const tripFieldId = useId()
  const tripLabelId = `${tripFieldId}-label`

  const tripLog = d.tripLog || ''

  return (
    <div className="day-panel">
      <div className="day-panel__grid">
        <div className="field-block field-block--trip-log">
          <span id={tripLabelId} className="field-block__label">
            Outings & locations
          </span>
          <p className="trip-log__type-hint muted">
            Same idea as <strong>Meals today</strong> in the journal: the colored / styled text is
            what counts — check the panel under the field for this day’s mileage on the receipt.
          </p>
          <TripPlacesField
            id={tripFieldId}
            value={tripLog}
            onChange={(v) => onChange(iso, { tripLog: v })}
            aria-labelledby={tripLabelId}
            placeholder="e.g. Morning at Moraga Library, afternoon Lafayette Library…"
          />
        </div>

        {fields.map(({ key, label, rows, hint }) => (
          <label key={key} className="field-block">
            <span className="field-block__label">{label}</span>
            <textarea
              className="input input--area"
              rows={rows}
              value={d[key] || ''}
              placeholder={hint}
              onChange={(e) => onChange(iso, { [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
