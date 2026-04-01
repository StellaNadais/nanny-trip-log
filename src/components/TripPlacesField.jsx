import { useMemo } from 'react'
import { splitTripLogForMirror } from '../utils/parseTripPlaces'

function placeClass(region) {
  if (region === 'oakland') return 'trip-place--oakland'
  if (region === 'moraga') return 'trip-place--moraga'
  if (region === 'lafayette') return 'trip-place--lafayette'
  return 'trip-place--unknown'
}

export default function TripPlacesField({
  id,
  value,
  onChange,
  placeholder = '',
  'aria-labelledby': ariaLabelledby,
}) {
  const chunks = useMemo(() => splitTripLogForMirror(value), [value])

  return (
    <div className="trip-places-field">
      <div className="trip-places-inline-host">
        <div className="trip-places-inline-inner">
          <div className="trip-places-inline-mirror" aria-hidden>
            {chunks.length === 0 ? (
              value === '' ? (
                '\u00a0'
              ) : null
            ) : (
              chunks.map((c, i) => {
                if (c.type === 'text') {
                  return <span key={i}>{c.value}</span>
                }
                if (c.place) {
                  return (
                    <span key={i} className={placeClass(c.place.region)}>
                      {c.place.label}
                    </span>
                  )
                }
                return (
                  <span key={i} className="trip-place--unknown">
                    «{c.id}»
                  </span>
                )
              })
            )}
          </div>
          <textarea
            id={id}
            className="trip-places-inline-ta"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-labelledby={ariaLabelledby}
            spellCheck="true"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
