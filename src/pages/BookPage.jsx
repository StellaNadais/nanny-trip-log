import { useMemo, useState } from 'react'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, WEEKDAYS, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'

function todayISO() {
  return toISODateLocal(new Date())
}

function dateISOFromParts(y, m, dayNum) {
  return toISODateLocal(new Date(y, m, dayNum))
}

/**
 * Parent-only booking page. Share /book as a direct link — not part of the caregiver app flow.
 */
export default function BookPage() {
  const { bookings, addBooking } = useBookings()
  const today = new Date()
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selected, setSelected] = useState(() => new Date(today))
  const [familyName, setFamilyName] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [formMsg, setFormMsg] = useState('')

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const cells = useMemo(() => monthGrid(y, m), [y, m])

  const bookingsByDate = useMemo(() => {
    const map = {}
    for (const b of bookings) {
      const d = b.dateISO
      if (!d) continue
      if (!map[d]) map[d] = []
      map[d].push(b)
    }
    return map
  }, [bookings])

  const title = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const selectedISO = useMemo(() => toISODateLocal(selected), [selected])

  const selectedLabel = selected.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const selectedBookings = bookingsByDate[selectedISO] ?? []
  const selectedIsPast = selectedISO < todayISO()

  function pickDay(dayNum) {
    if (dayNum == null) return
    setSelected(new Date(y, m, dayNum))
    setFormMsg('')
  }

  function prevMonth() {
    setCursor(new Date(y, m - 1, 1))
  }

  function nextMonth() {
    setCursor(new Date(y, m + 1, 1))
  }

  function submitBooking(e) {
    e.preventDefault()
    if (selectedIsPast) {
      setFormMsg('Choose a today-or-future date to request care.')
      return
    }
    const name = familyName.trim()
    const c = contact.trim()
    if (!name || !c) {
      setFormMsg('Please add your family name and a way to reach you (email or phone).')
      return
    }
    addBooking({
      dateISO: selectedISO,
      familyName: name,
      contact: c,
      notes: notes.trim(),
    })
    setFamilyName('')
    setContact('')
    setNotes('')
    setFormMsg('Request sent! Your caregiver will follow up.')
  }

  return (
    <div className="page page--calendar page--book page--parents-only">
      <header className="calendar__head calendar__head--book">
        <h1 className="calendar__title">Book care</h1>
        <p className="calendar__subtitle muted">
          Pick a date and send a request. Days that already have requests show a dot on the calendar.
        </p>
        <p className="book-parents-note muted">This page is for parents and families only.</p>
      </header>

      <div className="book-legend" aria-hidden>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--booked" /> Has request(s)
        </span>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--today" /> Today
        </span>
      </div>

      <div className="calendar__panel calendar__panel--book">
        <div className="calendar__nav">
          <button type="button" className="btn btn--ghost" onClick={prevMonth}>
            ‹
          </button>
          <span className="calendar__month">{title}</span>
          <button type="button" className="btn btn--ghost" onClick={nextMonth}>
            ›
          </button>
        </div>
        <div className="calendar__weekdays" aria-hidden>
          {WEEKDAYS.map((w) => (
            <span key={w} className="calendar__wd">
              {w}
            </span>
          ))}
        </div>
        <div className="calendar__grid calendar__grid--book" role="grid" aria-label="Booking calendar">
          {cells.map((dayNum, i) => {
            if (dayNum == null) {
              return (
                <div
                  key={i}
                  className="calendar__cell calendar__cell--empty"
                  role="gridcell"
                />
              )
            }
            const iso = dateISOFromParts(y, m, dayNum)
            const dayBookings = bookingsByDate[iso] ?? []
            const isBooked = dayBookings.length > 0
            const isSel = isSameDay(selected, new Date(y, m, dayNum))
            const isToday = isSameDay(today, new Date(y, m, dayNum))
            const isPast = iso < todayISO()

            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-label={`${dayNum}${isBooked ? `, ${dayBookings.length} request${dayBookings.length > 1 ? 's' : ''}` : ''}`}
                className={`calendar__cell ${isSel ? 'calendar__cell--selected' : ''} ${isToday ? 'calendar__cell--today' : ''} ${isBooked ? 'calendar__cell--booked' : ''} ${isPast ? 'calendar__cell--past' : ''}`}
                onClick={() => pickDay(dayNum)}
              >
                <span className="calendar__cell-num">{dayNum}</span>
                {isBooked ? (
                  <span className="calendar__booked-mark" aria-hidden>
                    {dayBookings.length > 1 ? (
                      dayBookings.length
                    ) : (
                      <span className="calendar__booked-dot" />
                    )}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <section className="book-request" aria-labelledby="book-request-title">
        <h2 id="book-request-title" className="book-request__title">
          Request this date
        </h2>
        <p className="book-request__picked muted">{selectedLabel}</p>
        {selectedBookings.length > 0 ? (
          <p className="muted book-request__busy">
            This date already has {selectedBookings.length} request
            {selectedBookings.length > 1 ? 's' : ''}. You can still submit if your caregiver
            approved shared care.
          </p>
        ) : (
          <p className="muted book-request__empty">Open day — send a request below.</p>
        )}

        <form className="book-request__form" onSubmit={submitBooking}>
          {selectedIsPast ? (
            <p className="book-request__warn muted">
              This date has passed. Choose today or a future day.
            </p>
          ) : null}
          <label className="field-block">
            <span className="field-block__label">Family / parent name</span>
            <input
              type="text"
              className="input input--line"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label className="field-block">
            <span className="field-block__label">Email or phone</span>
            <input
              type="text"
              className="input input--line"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="How to reach you"
              autoComplete="email"
            />
          </label>
          <label className="field-block">
            <span className="field-block__label">Notes (optional)</span>
            <textarea
              className="input input--area"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Times needed, number of kids, etc."
            />
          </label>
          {formMsg ? (
            <p
              className={`book-request__msg ${formMsg.startsWith('Request') ? 'book-request__msg--ok' : ''}`}
              role="status"
            >
              {formMsg}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn btn--primary book-request__submit"
            disabled={selectedIsPast}
          >
            Submit booking request
          </button>
        </form>
      </section>
    </div>
  )
}
