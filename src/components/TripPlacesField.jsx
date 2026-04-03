import { useId, useMemo } from 'react'
import { MILE_RATE } from '../data/tripPlaces'
import { computeTripMileageForText, splitTripLogForMirror } from '../utils/parseTripPlaces'
import { mirrorNodesFromChunks } from './placeMirrorNodes'

/**
 * Same pattern as meals: mirror highlights + footer strip with live feedback.
 * variant journal: nested in Kid journal "About today"; softer copy.
 */
export default function TripPlacesField({
  id,
  value,
  onChange,
  placeholder = '',
  'aria-labelledby': ariaLabelledby,
  variant = 'trip',
  nestedInAbout = false,
}) {
  const mileageHintId = useId()
  const chunks = useMemo(() => splitTripLogForMirror(value), [value])
  const mileage = useMemo(() => computeTripMileageForText(value), [value])
  const mirrorChildren = useMemo(() => mirrorNodesFromChunks(chunks), [chunks])
  const tally = mileage.rows.length

  const isJournal = variant === 'journal'

  return (
    <div
      className={`meals-today-field trip-places-as-meals${nestedInAbout ? ' trip-places-as-meals--about-nested' : ''}`}
    >
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
        <span className="trip-places-foot__title">
          {isJournal ? 'Outings in this note · mileage' : 'Mileage & receipt'}
        </span>
        {tally === 0 ? (
          <p className="trip-places-foot__body muted">
            {isJournal ? (
              <>
                Type a natural sentence — when a saved place name appears (e.g. <strong>Laf Library</strong>
                , <strong>Moraga Library</strong>), it highlights and counts toward this day&apos;s miles on{' '}
                <strong>Weekly receipt</strong> with Trip log.
              </>
            ) : (
              <>
                Highlighted, styled names are counted. Finish typing a full saved place name — Oakland
                (code), Moraga (italic), Lafayette (bold + code) — then this day&apos;s miles roll into{' '}
                <strong>Weekly receipt</strong> automatically.
              </>
            )}
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
