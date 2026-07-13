import { useMemo } from 'react'
import { OVERNIGHT_RATE } from '../data/bookingRates'
import { bookingOvernightNightCount } from '../utils/bookingRange'
import TodayPanelModal from './TodayPanelModal'

function formatShort(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Today-style popup for overnight start/end dates (transparent backdrop).
 */
export default function OvernightDateModal({
  open,
  onClose,
  startISO,
  endISO,
  onStartChange,
  onEndChange,
  onContinue,
  minISO,
}) {
  const nights = useMemo(
    () =>
      bookingOvernightNightCount({
        dateISO: startISO,
        careEndDateISO: endISO || startISO,
      }),
    [startISO, endISO],
  )
  const overnightTotal = nights * OVERNIGHT_RATE
  const canContinue = Boolean(startISO && endISO && endISO >= startISO)

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      transparentBackdrop
      eyebrow="Care dates"
      title="Overnight"
      dateLabel={
        startISO
          ? `${formatShort(startISO)}${endISO && endISO !== startISO ? ` → ${formatShort(endISO)}` : ''}`
          : 'Pick start and end'
      }
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!canContinue}
            onClick={() => onContinue?.()}
          >
            Continue
          </button>
        </>
      }
    >
      <section className="about-today-modal__section overnight-date-modal" aria-label="Overnight dates">
        <p className="overnight-date-modal__lede muted">
          Same-day care needs no overnight. For a sleepover gig, set the end date after the start.
        </p>

        <div className="overnight-date-modal__fields">
          <label className="field-block overnight-date-modal__field">
            <span className="field-block__label">Start date</span>
            <input
              type="date"
              className="input input--line"
              value={startISO || ''}
              min={minISO || undefined}
              onChange={(e) => onStartChange?.(e.target.value)}
              required
            />
          </label>
          <label className="field-block overnight-date-modal__field">
            <span className="field-block__label">End date</span>
            <input
              type="date"
              className="input input--line"
              value={endISO || startISO || ''}
              min={startISO || minISO || undefined}
              onChange={(e) => onEndChange?.(e.target.value)}
              required
            />
          </label>
        </div>

        {nights > 0 ? (
          <p className="overnight-date-modal__rate" role="note">
            Overnight total: {nights} night{nights === 1 ? '' : 's'} × ${OVERNIGHT_RATE} ={' '}
            <strong>${overnightTotal}</strong>
          </p>
        ) : (
          <p className="overnight-date-modal__rate overnight-date-modal__rate--zero muted" role="note">
            No overnight charge for a same-day gig.
          </p>
        )}
      </section>
    </TodayPanelModal>
  )
}
