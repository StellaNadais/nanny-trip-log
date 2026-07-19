import { useEffect } from 'react'
import { OVERNIGHT_RATE } from '../data/bookingRates'
import BookExtrasField from './BookExtrasField'

/**
 * Booking form popup — dates come from calendar selection; times + details here.
 */
export default function BookSchedulingDock({
  open,
  onClose,
  careDateHeadline,
  careSpanSummary,
  overnightNights,
  overnightTotal,
  overnightRate = OVERNIGHT_RATE,
  careStart,
  careEnd,
  repeatDateISO,
  repeatDateOk,
  repeatDateMin,
  onCareStartTime,
  onCareEndTime,
  onRepeatDateChange,
  timeOk,
  childrenOnGig,
  familyName,
  phone,
  phoneOk,
  requestNotes,
  bookingExtras,
  onBookingExtrasChange,
  onChildrenOnGig,
  onFamilyName,
  onPhone,
  onRequestNotes,
  selectedBookingsCount,
  careStartIsPast,
  canSubmit,
  onSubmit,
  onClear,
  familyNameLocked = false,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="book-modal book-scheduling-modal book-modal--clear"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-scheduling-title"
    >
      <button
        type="button"
        className="book-modal__backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="book-modal__sheet book-scheduling-modal__sheet">
        <div className="book-modal__head">
          <div className="book-modal__head-text">
            <p className="book-modal__eyebrow">Your dates</p>
            <h2 id="book-scheduling-title" className="book-modal__title">
              Book
            </h2>
            <p className="book-modal__date">{careDateHeadline}</p>
            <p className="book-modal__sub muted">
              Set care times below, then add children and contact info.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost book-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {selectedBookingsCount > 0 ? (
          <p className="book-modal__note muted">
            This start day already has {selectedBookingsCount} request
            {selectedBookingsCount > 1 ? 's' : ''}. Submit only if your caregiver approved overlapping
            gigs.
          </p>
        ) : null}

        <form className="book-modal__form book-scheduling-modal__form" onSubmit={onSubmit}>
          <div className="book-modal__hotel-card" aria-label="Care times">
            <div className="book-modal__hotel-dates">
              <div className="book-modal__hotel-col">
                <span className="book-modal__hotel-kicker">Gig starts</span>
                <p className="book-scheduling-modal__date-readout" aria-hidden>
                  {careDateHeadline.split(' → ')[0]}
                </p>
                <label className="book-modal__hotel-time-label">
                  <span>Start time</span>
                  <input
                    type="time"
                    className="input input--line"
                    value={careStart}
                    onChange={(e) => onCareStartTime(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="book-modal__hotel-rail" aria-hidden />
              <div className="book-modal__hotel-col">
                <span className="book-modal__hotel-kicker">Gig ends</span>
                <p className="book-scheduling-modal__date-readout" aria-hidden>
                  {careDateHeadline.includes(' → ')
                    ? careDateHeadline.split(' → ')[1]
                    : careDateHeadline.split(' → ')[0]}
                </p>
                <label className="book-modal__hotel-time-label">
                  <span>End time</span>
                  <input
                    type="time"
                    className="input input--line"
                    value={careEnd}
                    onChange={(e) => onCareEndTime(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
            {careSpanSummary ? (
              <p className="book-modal__hotel-summary muted">{careSpanSummary}</p>
            ) : null}
            {overnightNights > 0 ? (
              <p className="book-modal__overnight-rate" role="note">
                Overnight total: {overnightNights} night{overnightNights === 1 ? '' : 's'} × $
                {overnightRate} = <strong>${overnightTotal}</strong>
              </p>
            ) : null}
            {!timeOk && careStart && careEnd ? (
              <p className="book-modal__hint book-modal__hint--warn book-modal__hotel-warn">
                End time must be after start (or counts as overnight the next day).
              </p>
            ) : null}
          </div>

          <div className="book-modal__block">
            <span className="book-modal__block-title">Repeat this booking</span>
            <label className="field-block book-modal__field-grow">
              <span className="field-block__label">Also request these times on (optional)</span>
              <input
                type="date"
                className="input input--line"
                value={repeatDateISO}
                min={repeatDateMin}
                onChange={(e) => onRepeatDateChange(e.target.value)}
              />
            </label>
            <p className="book-scheduling-modal__repeat-hint muted">
              We’ll send a separate pending request with the same times, children, notes, and extras.
            </p>
            {!repeatDateOk ? (
              <p className="book-modal__hint book-modal__hint--warn">
                Choose a different future date for the repeated request.
              </p>
            ) : null}
          </div>

          <div className="book-modal__block">
            <span className="book-modal__block-title">Children on this gig</span>
            <label className="field-block book-modal__field-grow">
              <span className="field-block__label">Names & ages</span>
              <input
                type="text"
                className="input input--line"
                value={childrenOnGig}
                onChange={(e) => onChildrenOnGig(e.target.value)}
                placeholder="e.g. Harper (5), Poppy (3)"
                autoComplete="off"
                required
              />
            </label>
          </div>

          <div className="book-modal__block">
            <span className="book-modal__block-title">Contact</span>
            <label className="field-block book-modal__field-grow">
              <span className="field-block__label">Family / parent name</span>
              <input
                type="text"
                className="input input--line"
                value={familyName}
                onChange={(e) => onFamilyName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                readOnly={familyNameLocked}
              />
            </label>
            <label className="field-block book-modal__field-grow">
              <span className="field-block__label">Phone</span>
              <input
                type="tel"
                className="input input--line"
                value={phone}
                onChange={(e) => onPhone(e.target.value)}
                placeholder="Your phone number"
                autoComplete="tel"
              />
            </label>
            {phone.trim() && !phoneOk ? (
              <p className="book-modal__hint book-modal__hint--warn">
                Enter a phone number with at least 7 digits.
              </p>
            ) : null}
          </div>

          <div className="book-modal__block">
            <label className="field-block book-modal__field-grow">
              <span className="field-block__label">Notes for caregiver (optional)</span>
              <textarea
                className="input input--area book-modal__notes"
                value={requestNotes}
                onChange={(e) => onRequestNotes(e.target.value)}
                placeholder="Diet, routines, pickup plans, second parent contact…"
                rows={3}
                maxLength={2000}
                autoComplete="off"
              />
            </label>
            <BookExtrasField items={bookingExtras} onChange={onBookingExtrasChange} />
          </div>

          {careStartIsPast ? (
            <p className="book-modal__hint book-modal__hint--warn">
              Start date has passed. Close and tap a future day on the calendar.
            </p>
          ) : null}

          <div className="book-modal__actions book-scheduling-modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClear}>
              Clear dates
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--work-primary"
              disabled={!canSubmit}
            >
              Submit request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
