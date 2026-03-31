import { useEffect } from 'react'

const fields = [
  { key: 'wake', label: 'Wake / start', rows: 1, hint: 'e.g. 7:15 AM wake' },
  { key: 'dropoff', label: 'Drop-off / pickup', rows: 1, hint: 'School runs, handoffs' },
  { key: 'nap', label: 'Nap', rows: 1, hint: 'e.g. 12:40–3 or crib times' },
  { key: 'meals', label: 'Meals & snacks', rows: 2, hint: 'Foods, amounts' },
  { key: 'activities', label: 'Activities & outings', rows: 2, hint: 'Class, playdate, museum' },
  { key: 'health', label: 'Health / bathroom', rows: 2, hint: 'Miralax, poops, meds' },
  { key: 'notes', label: 'Day notes for parents', rows: 4, hint: 'Evening story, sleep times, mood' },
]

export function DayLogPanel({ iso, day, onChange, ensureDay }) {
  useEffect(() => {
    ensureDay(iso)
  }, [iso, ensureDay])

  const d = day || {}

  return (
    <div className="day-panel">
      <div className="day-panel__grid">
        {fields.map(({ key, label, rows, hint }) => (
          <label key={key} className="field-block">
            <span className="field-block__label">{label}</span>
            {rows === 1 ? (
              <input
                type="text"
                className="input input--line"
                value={d[key] || ''}
                placeholder={hint}
                onChange={(e) => onChange(iso, { [key]: e.target.value })}
              />
            ) : (
              <textarea
                className="input input--area"
                rows={rows}
                value={d[key] || ''}
                placeholder={hint}
                onChange={(e) => onChange(iso, { [key]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
    </div>
  )
}
