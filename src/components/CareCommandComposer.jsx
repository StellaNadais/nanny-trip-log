import { useMemo, useState } from 'react'
import { parseCareCommand } from '../utils/parseCareCommand'

const DESTINATION_LABELS = {
  grocery: 'groceries',
  reminder: 'notes & reminders',
  errand: 'errands',
}

function bookingLabel(booking) {
  const date = new Date(`${booking.dateISO}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  return `${booking.familyName || 'Care day'} · ${date}`
}

/**
 * A lightweight parent-to-caregiver composer. It routes messages into existing
 * shared task stores rather than creating a separate conversation surface.
 */
export default function CareCommandComposer({ bookings, onSend }) {
  const [draft, setDraft] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [feedback, setFeedback] = useState('')

  const availableBookings = useMemo(
    () => bookings.filter((booking) => booking.responseStatus !== 'declined'),
    [bookings]
  )

  const selectedBooking =
    availableBookings.find((booking) => booking.id === bookingId) || availableBookings[0] || null

  function submit(event) {
    event.preventDefault()
    const parsed = parseCareCommand(draft)
    if (!parsed.kind) {
      setFeedback(parsed.error)
      return
    }
    if (parsed.kind !== 'grocery' && !selectedBooking) {
      setFeedback('Choose a care day before sending a note or errand.')
      return
    }

    const result = onSend({ ...parsed, booking: selectedBooking })
    if (!result?.ok) {
      setFeedback(result?.message || 'That could not be sent. Try again.')
      return
    }
    setDraft('')
    setFeedback(result.message || `Added to ${DESTINATION_LABELS[parsed.kind]}.`)
  }

  return (
    <section className="care-command-composer work-ui__panel" aria-labelledby="care-command-heading">
      <div className="care-command-composer__head">
        <div>
          <p className="care-command-composer__eyebrow">For your caregiver</p>
          <h2 id="care-command-heading">Send a shared task</h2>
        </div>
        <span className="care-command-composer__route" aria-live="polite">
          {draft.startsWith('/') && parseCareCommand(draft).kind
            ? `→ ${DESTINATION_LABELS[parseCareCommand(draft).kind]}`
            : 'Shared with nanny'}
        </span>
      </div>

      <form className="care-command-composer__form" onSubmit={submit}>
        <label className="sr-only" htmlFor="care-command-input">
          Message for your caregiver
        </label>
        <textarea
          id="care-command-input"
          className="input input--area care-command-composer__input"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            if (feedback) setFeedback('')
          }}
          placeholder="/grocery oat milk, bananas · /reminder early pickup at 4 · /errand return library books"
          rows={2}
          maxLength={2000}
        />

        <div className="care-command-composer__bottom">
          {availableBookings.length ? (
            <label className="care-command-composer__booking">
              <span>Care day for note or errand</span>
              <select value={selectedBooking?.id || ''} onChange={(event) => setBookingId(event.target.value)}>
                {availableBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {bookingLabel(booking)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="care-command-composer__no-booking">
              Grocery items can be sent now. Add a care day first to send notes or errands.
            </p>
          )}
          <button className="btn btn--primary care-command-composer__send" type="submit" disabled={!draft.trim()}>
            Send
          </button>
        </div>
      </form>

      <p className="care-command-composer__hint">
        <code>/grocery</code> adds a shopping item, <code>/reminder</code> or <code>/note</code> adds a care note,
        and <code>/errand</code> adds an errand. Plain text becomes a note.
      </p>
      {feedback ? (
        <p className="care-command-composer__feedback" role="status">
          {feedback}
        </p>
      ) : null}
    </section>
  )
}
