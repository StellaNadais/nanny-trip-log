import { useId, useMemo, useState } from 'react'
import { splitTripLogForMirror } from '../utils/parseTripPlaces'
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
  const mirrorChildren = useMemo(() => mirrorNodesFromChunks(chunks), [chunks])
  const [expenseOpen, setExpenseOpen] = useState(false)

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

      <details className="trip-places-foot-details trip-places-foot-details--expenses" id={footRegionId}>
        <summary className="trip-places-foot__summary">Add expenses</summary>
        <div className="trip-places-foot-panel">
          {receiptWeekKey ? (
            <div className="trip-places-foot__actions">
              <button
                type="button"
                className="trip-places-foot__expense-btn"
                onClick={() => setExpenseOpen(true)}
              >
                Add parking, tolls…
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
