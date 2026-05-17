import { useId, useMemo, useState } from 'react'
import { MILE_RATE } from '../data/tripPlaces'
import { computeTripMileageForText, splitTripLogForMirror } from '../utils/parseTripPlaces'
import { mirrorNodesFromChunks } from './placeMirrorNodes'
import ExtraExpenseModal from './ExtraExpenseModal'

/**
 * Same pattern as meals: mirror highlights + footer strip with live feedback.
 * variant journal: nested in Kid journal "About today"; softer copy.
 * receiptWeekKey: Monday ISO for weekly receipt extras (manual expense popup).
 */
export default function TripPlacesField({
  id,
  value,
  onChange,
  placeholder = '',
  'aria-labelledby': ariaLabelledby,
  variant = 'trip',
  nestedInAbout = false,
  receiptWeekKey = '',
}) {
  const footRegionId = useId()
  const chunks = useMemo(() => splitTripLogForMirror(value), [value])
  const mileage = useMemo(() => computeTripMileageForText(value), [value])
  const mirrorChildren = useMemo(() => mirrorNodesFromChunks(chunks), [chunks])
  const tally = mileage.rows.length
  const [expenseOpen, setExpenseOpen] = useState(false)

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
            aria-describedby={footRegionId}
            spellCheck="true"
            autoComplete="off"
          />
        </div>
      </div>

      <details className="trip-places-foot-details" id={footRegionId} aria-live="polite">
        <summary className="trip-places-foot__summary">
          {isJournal ? 'Outings & mileage' : 'Mileage & expenses'}
        </summary>
        <div className="trip-places-foot-panel">
          <div className="trip-places-foot">
            {tally === 0 ? (
              <p className="trip-places-foot__body muted">
                Saved place names count toward mileage on <strong>Weekly receipt</strong>. Chain stops with{' '}
                <strong>then</strong> or <strong>+</strong> so one outing isn’t double-counted.
              </p>
            ) : (
              <p className="trip-places-foot__body">
                <strong className="trip-places-foot__stat">{tally}</strong>{' '}
                {tally === 1 ? 'trip' : 'trips'} counted ·{' '}
                <strong className="trip-places-foot__stat">{mileage.totalMiles.toFixed(1)}</strong> mi round-trip ·{' '}
                <strong className="trip-places-foot__stat">${mileage.reimbursement.toFixed(2)}</strong>{' '}
                @ ${MILE_RATE}/mi — <span className="trip-places-foot__sync">on Weekly receipt</span>
              </p>
            )}
          </div>
          {receiptWeekKey ? (
            <div className="trip-places-foot__actions">
              <button
                type="button"
                className="btn btn--primary trip-places-foot__expense-btn"
                onClick={() => setExpenseOpen(true)}
              >
                {isJournal ? 'Add parking, tolls…' : 'Add expense to week…'}
              </button>
            </div>
          ) : null}
        </div>
      </details>

      <ExtraExpenseModal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        receiptWeekKey={receiptWeekKey}
      />
    </div>
  )
}
