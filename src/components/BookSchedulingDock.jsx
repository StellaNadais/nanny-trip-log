import { OVERNIGHT_RATE } from '../data/bookingRates'
import TodayPanelModal from './TodayPanelModal'

/**
 * Booking form popup — opens after check-in and check-out dates are picked.
 */
export default function BookSchedulingDock({
  open,
  onClose,
  onChangeDates,
  careDateHeadline,
  overnightNights,
  overnightTotal,
  careStart,
  careEnd,
  onCareStartTime,
  onCareEndTime,
  timeOk,
  childrenOnGig,
  familyName,
  phone,
  phoneOk,
  requestNotes,
  onChildrenOnGig,
  onFamilyName,
  onPhone,
  onRequestNotes,
  selectedBookingsCount,
  careStartIsPast,
  canSubmit,
  onSubmit,
  onClear,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="Complete your request"
      hideHead
      hideFoot
      modalClassName="about-today-modal--book-popup"
    >
      <section
        className="soft-panel soft-panel--booking soft-panel--book-popup"
        aria-labelledby="book-scheduling-title"
      >
        <div className="soft-panel__hero">
          <div className="soft-panel__hero-row">
            <div className="soft-panel__hero-copy">
              <p className="soft-panel__eyebrow">Your dates</p>
              <h2 id="book-scheduling-title" className="soft-panel__title">
                Complete your request
              </h2>
              <p className="soft-panel__meta">{careDateHeadline}</p>
              <p className="soft-panel__lede">
                Set care times, then add children and contact info.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--ghost soft-panel__hero-action"
              onClick={onChangeDates}
            >
              Change dates
            </button>
          </div>
        </div>

        <div className="soft-panel__body soft-panel__body--booking">
          {selectedBookingsCount > 0 ? (
            <p className="soft-panel__note muted">
              This start day already has {selectedBookingsCount} request
              {selectedBookingsCount > 1 ? 's' : ''}. Submit only if your caregiver approved overlapping
              gigs.
            </p>
          ) : null}

          <form className="book-scheduling-form" onSubmit={onSubmit}>
            <div className="book-modal__hotel-card" aria-label="Care times">
              <div className="book-modal__hotel-dates">
                <div className="book-modal__hotel-col">
                  <span className="book-modal__hotel-kicker">Gig starts</span>
                  <p className="book-scheduling-modal__date-readout">
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
                <div className="book-modal__hotel-col">
                  <span className="book-modal__hotel-kicker">Gig ends</span>
                  <p className="book-scheduling-modal__date-readout">
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
              {overnightNights > 0 ? (
                <p className="book-modal__overnight-rate" role="note">
                  Overnight total: {overnightNights} night{overnightNights === 1 ? '' : 's'} × $
                  {OVERNIGHT_RATE} = <strong>${overnightTotal}</strong>
                </p>
              ) : null}
              {!timeOk && careStart && careEnd ? (
                <p className="book-modal__hint book-modal__hint--warn book-modal__hotel-warn">
                  End time must be after start (or counts as overnight the next day).
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
            </div>

            {careStartIsPast ? (
              <p className="book-modal__hint book-modal__hint--warn">
                Start date has passed. Tap a future day on the calendar.
              </p>
            ) : null}

            <div className="soft-panel__actions">
              <button type="button" className="btn btn--ghost" onClick={onClear}>
                Clear
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

        <p className="soft-panel__footer">
          Your caregiver will confirm availability after you submit.
        </p>
      </section>
    </TodayPanelModal>
  )
}
