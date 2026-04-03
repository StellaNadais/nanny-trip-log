import { useId, useMemo } from 'react'
import { MILE_RATE } from '../data/tripPlaces'
import { computeTripMileageForText, splitTripLogForMirror } from '../utils/parseTripPlaces'

function placeClass(region) {
  if (region === 'oakland') return 'trip-place--oakland'
  if (region === 'moraga') return 'trip-place--moraga'
  if (region === 'lafayette') return 'trip-place--lafayette'
  return 'trip-place--unknown'
}

/** Split plain text runs so commas / breaks match meals “delim” styling. */
function mirrorNodesFromChunks(chunks) {
  const nodes = []
  let k = 0
  for (const c of chunks) {
    if (c.type === 'text') {
      const parts = c.value.split(/([,;.\n]+)/)
      for (const part of parts) {
        if (!part) continue
        if (/^[,;.\n]+$/.test(part)) {
          nodes.push(
            <span key={k++} className="meals-inline-delim">
              {part}
            </span>
          )
        } else {
          nodes.push(<span key={k++}>{part}</span>)
        }
      }
      continue
    }
    const cls = [
      'trip-place',
      c.place ? 'trip-place--counted' : '',
      c.place ? placeClass(c.place.region) : 'trip-place--unknown',
    ]
      .filter(Boolean)
      .join(' ')
    nodes.push(
      <span key={k++} className={cls}>
        {c.value}
      </span>
    )
  }
  return nodes
}

/**
 * Same pattern as meals: mirror highlights + footer strip with live feedback.
 */
export default function TripPlacesField({
  id,
  value,
  onChange,
  placeholder = '',
  'aria-labelledby': ariaLabelledby,
}) {
  const mileageHintId = useId()
  const chunks = useMemo(() => splitTripLogForMirror(value), [value])
  const mileage = useMemo(() => computeTripMileageForText(value), [value])
  const mirrorChildren = useMemo(() => mirrorNodesFromChunks(chunks), [chunks])
  const tally = mileage.rows.length

  return (
    <div className="meals-today-field trip-places-as-meals">
      <div className="meals-inline-host">
        <div className="meals-inline-inner">
          <div className="meals-inline-mirror" aria-hidden>
            {chunks.length === 0 && value === '' ? (
              '\u00a0'
            ) : mirrorChildren.length === 0 ? (
              '\u00a0'
            ) : (
              mirrorChildren
            )}
          </div>
          <textarea
            id={id}
            className="meals-inline-ta"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-labelledby={ariaLabelledby}
            aria-describedby={mileageHintId}
            spellCheck="true"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="trip-places-foot" id={mileageHintId} aria-live="polite">
        <span className="trip-places-foot__title">Mileage & receipt</span>
        {tally === 0 ? (
          <p className="trip-places-foot__body muted">
            Highlighted, styled names are counted. Finish typing a full saved place name — Oakland
            (code), Moraga (italic), Lafayette (bold + code) — then this day’s miles roll into{' '}
            <strong>Weekly receipt</strong> automatically.
          </p>
        ) : (
          <p className="trip-places-foot__body">
            <strong className="trip-places-foot__stat">{tally}</strong>{' '}
            {tally === 1 ? 'trip' : 'trips'} counted ·{' '}
            <strong className="trip-places-foot__stat">{mileage.totalMiles.toFixed(1)}</strong> mi
            round-trip ·{' '}
            <strong className="trip-places-foot__stat">${mileage.reimbursement.toFixed(2)}</strong>{' '}
            @ ${MILE_RATE}/mi — <span className="trip-places-foot__sync">on Weekly receipt</span>
          </p>
        )}
      </div>
    </div>
  )
}
