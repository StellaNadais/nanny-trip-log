import { useEffect, useId, useRef } from 'react'
import TripPlacesField from './TripPlacesField'
import { placesGroupedForSelect } from '../data/tripPlaces'

const fields = [
  { key: 'notes', label: 'Day notes for parents', rows: 4, hint: 'Evening story, sleep times, mood' },
]

const GROUPS = placesGroupedForSelect()

export function DayLogPanel({ iso, day, onChange, ensureDay }) {
  useEffect(() => {
    ensureDay(iso)
  }, [iso, ensureDay])

  useEffect(() => {
    if (selectRef.current) selectRef.current.value = ''
  }, [iso])

  const d = day || {}
  const tripFieldId = useId()
  const tripLabelId = `${tripFieldId}-label`
  const selectRef = useRef(null)

  const tripLog = d.tripLog || ''

  function appendPlace(placeId) {
    const token = `«p:${placeId}»`
    const next = tripLog ? `${tripLog} ${token} ` : `${token} `
    onChange(iso, { tripLog: next })
    if (selectRef.current) selectRef.current.value = ''
  }

  return (
    <div className="day-panel">
      <div className="day-panel__grid">
        <div className="field-block field-block--trip-log">
          <span id={tripLabelId} className="field-block__label">
            Outings & locations
          </span>
          <label className="trip-log__picker-label">
            <span className="sr-only">Add a place</span>
            <select
              ref={selectRef}
              className="input input--line trip-log__select"
              defaultValue=""
              aria-labelledby={tripLabelId}
              onChange={(e) => {
                const v = e.target.value
                if (v) appendPlace(v)
              }}
            >
              <option value="">Add place…</option>
              {GROUPS.map((g) => (
                <optgroup key={g.region} label={g.label}>
                  {g.places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <TripPlacesField id={tripFieldId} value={tripLog} onChange={(v) => onChange(iso, { tripLog: v })} aria-labelledby={tripLabelId} />
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
