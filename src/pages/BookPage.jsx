import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { toISODateLocal, addDays } from '../utils/dates'
import { monthGrid, WEEKDAYS, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { careIntervalValid, expandBookingCalendarDates } from '../utils/bookingRange'

function todayISO() {
  return toISODateLocal(new Date())
}

function dateISOFromParts(y, m, dayNum) {
  return toISODateLocal(new Date(y, m, dayNum))
}

const DEFAULT_CARE_START = '09:00'
const DEFAULT_CARE_END = '17:00'
const BOOK_END_DATE_SPAN_DAYS = 90

function phoneLooksReachable(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7
}

function formatStayPickerDate(iso) {
  if (!iso) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTimeShort(hm) {
  if (!hm) return ''
  const [h, m] = hm.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hm
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
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
  const [bookModalOpen, setBookModalOpen] = useState(false)
  const [careStart, setCareStart] = useState(DEFAULT_CARE_START)
  const [careEnd, setCareEnd] = useState(DEFAULT_CARE_END)
  const [careEndDateISO, setCareEndDateISO] = useState(() => toISODateLocal(new Date()))
  const [kidCount, setKidCount] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [phone, setPhone] = useState('')
  const [requestNotes, setRequestNotes] = useState('')
  const [bookToast, setBookToast] = useState('')

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const cells = useMemo(() => monthGrid(y, m), [y, m])

  const bookingsByDate = useMemo(() => {
    const map = {}
    for (const b of bookings) {
      for (const iso of expandBookingCalendarDates(b)) {
        if (!map[iso]) map[iso] = []
        map[iso].push(b)
      }
    }
    return map
  }, [bookings])

  const eventsByLocation = useMemo(() => groupFamilyEventsByLocation(), [])

  const title = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const selectedISO = useMemo(() => toISODateLocal(selected), [selected])

  const selectedIsPast = selectedISO < todayISO()

  const careEndDateMax = useMemo(
    () => toISODateLocal(addDays(new Date(`${selectedISO}T12:00:00`), BOOK_END_DATE_SPAN_DAYS)),
    [selectedISO]
  )

  const stayNights = useMemo(() => {
    const a = new Date(`${selectedISO}T12:00:00`)
    const b = new Date(`${careEndDateISO}T12:00:00`)
    return Math.max(0, Math.round((b - a) / 86400000))
  }, [selectedISO, careEndDateISO])

  const timeOk = useMemo(
    () => careIntervalValid(selectedISO, careStart, careEndDateISO, careEnd),
    [selectedISO, careStart, careEndDateISO, careEnd]
  )

  const staySummaryLine = useMemo(() => {
    if (!timeOk) return null
    const endT = formatTimeShort(careEnd)
    if (stayNights === 0) {
      return `Same day · ends ${endT}`
    }
    return `${stayNights} night${stayNights === 1 ? '' : 's'} · check-out ${formatStayPickerDate(careEndDateISO)} · ${endT}`
  }, [timeOk, stayNights, careEndDateISO, careEnd])

  const kidsOk = useMemo(() => {
    const k = Number(kidCount)
    return kidCount !== '' && Number.isInteger(k) && k >= 1 && k <= 20
  }, [kidCount])
  const nameOk = familyName.trim().length > 0
  const phoneOk = phoneLooksReachable(phone)

  function resetBookingModal(startISO) {
    setCareStart(DEFAULT_CARE_START)
    setCareEnd(DEFAULT_CARE_END)
    setCareEndDateISO(startISO)
    setKidCount('')
    setFamilyName('')
    setPhone('')
    setRequestNotes('')
  }

  function openBookingModal(dayNum) {
    if (dayNum == null) return
    const dayDate = new Date(y, m, dayNum)
    const iso = toISODateLocal(dayDate)
    setSelected(dayDate)
    resetBookingModal(iso)
    setBookModalOpen(true)
  }

  function closeBookingModal() {
    setBookModalOpen(false)
  }

  useEffect(() => {
    if (!bookModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeBookingModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bookModalOpen])

  function prevMonth() {
    setCursor(new Date(y, m - 1, 1))
  }

  function nextMonth() {
    setCursor(new Date(y, m + 1, 1))
  }

  function submitBooking(e) {
    e.preventDefault()
    if (selectedIsPast) return
    if (!timeOk || !kidsOk || !nameOk || !phoneOk) return
    addBooking({
      dateISO: selectedISO,
      careEndDateISO,
      familyName: familyName.trim(),
      contact: phone.trim(),
      kidCount: Number(kidCount),
      careStart,
      careEnd,
      notes: requestNotes.trim(),
    })
    closeBookingModal()
    resetBookingModal(selectedISO)
    setBookToast('Request sent! Your caregiver will follow up.')
    window.setTimeout(() => setBookToast(''), 5000)
  }

  return (
    <div className="page page--calendar page--book page--parents-only">
      <header className="calendar__head calendar__head--book">
        <h1 className="calendar__title">Book care</h1>
        <p className="calendar__subtitle muted">
          Tap the <strong>start date</strong>, then set start and end times. End date can be later for overnight or
          multi-day care. A dot means there is already a request that day.
        </p>
        <p className="book-parents-note muted">This page is for parents and families only.</p>
      </header>

      <div className="book-legend" role="group" aria-label="Calendar legend">
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--booked" aria-hidden /> Has request(s)
        </span>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--today" aria-hidden /> Today
        </span>
        <span className="book-legend__item book-legend__item--hours">
          <strong>Overnight / multi-day:</strong> pick an end date after the start day if care crosses midnight.
        </span>
      </div>

      {bookToast ? (
        <p className="book-toast" role="status">
          {bookToast}
        </p>
      ) : null}

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

            const dayDate = new Date(y, m, dayNum)
            const dateForAria = dayDate.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
            const ariaBits = [
              dateForAria,
              isBooked ? `${dayBookings.length} request${dayBookings.length > 1 ? 's' : ''}` : 'No requests yet',
            ].filter(Boolean)

            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-label={ariaBits.join(', ')}
                className={`calendar__cell ${isSel ? 'calendar__cell--selected' : ''} ${isToday ? 'calendar__cell--today' : ''} ${isBooked ? 'calendar__cell--booked' : ''} ${isPast ? 'calendar__cell--past' : ''}`}
                onClick={() => openBookingModal(dayNum)}
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

      <p className="book-request-hint muted">
        Request form: start time on the day you chose, end date and time (can be the next day for overnight), children,
        contact info, optional notes.
      </p>

      {bookModalOpen ? (
        <div
          className="book-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-modal-title"
        >
          <button
            type="button"
            className="book-modal__backdrop"
            aria-label="Close booking form"
            onClick={closeBookingModal}
          />
          <div className="book-modal__sheet">
            <div className="book-modal__head">
              <div className="book-modal__head-text">
                <h2 id="book-modal-title" className="book-modal__title">
                  Book your dates
                </h2>
                <p className="book-modal__tagline muted">
                  Check-in and check-out — like reserving a hotel. Times are when care starts and ends.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--ghost book-modal__close"
                aria-label="Close"
                onClick={closeBookingModal}
              >
                ×
              </button>
            </div>

            {selectedBookings.length > 0 ? (
              <p className="book-modal__note muted">
                This date already has {selectedBookings.length} request
                {selectedBookings.length > 1 ? 's' : ''}. Submit only if your caregiver approved shared care.
              </p>
            ) : null}

            <form className="book-modal__form" onSubmit={submitBooking}>
              <div className="book-modal__stay-card" role="group" aria-label="Check-in and check-out">
                <div className="book-modal__stay-split">
                  <div className="book-modal__stay-pillar">
                    <span className="book-modal__stay-kicker">Check-in</span>
                    <label className="book-modal__stay-field">
                      <span className="book-modal__stay-field-label">Date</span>
                      <input
                        type="date"
                        className="input input--line book-modal__stay-date-control"
                        value={selectedISO}
                        min={todayISO()}
                        max={careEndDateMax}
                        onChange={(e) => {
                          const v = e.target.value
                          if (!v) return
                          setSelected(new Date(`${v}T12:00:00`))
                          setCareEndDateISO((end) => (end < v ? v : end))
                        }}
                        required
                      />
                    </label>
                    <label className="book-modal__stay-field">
                      <span className="book-modal__stay-field-label">From</span>
                      <input
                        type="time"
                        className="input input--line book-modal__stay-time-control"
                        value={careStart}
                        onChange={(e) => setCareStart(e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <div className="book-modal__stay-bridge" aria-hidden>
                    <span className="book-modal__stay-bridge-icon">→</span>
                  </div>

                  <div className="book-modal__stay-pillar">
                    <span className="book-modal__stay-kicker">Check-out</span>
                    <label className="book-modal__stay-field">
                      <span className="book-modal__stay-field-label">Date</span>
                      <input
                        type="date"
                        className="input input--line book-modal__stay-date-control"
                        value={careEndDateISO}
                        min={selectedISO}
                        max={careEndDateMax}
                        onChange={(e) => {
                          let v = e.target.value
                          if (!v || v < selectedISO) v = selectedISO
                          setCareEndDateISO(v)
                        }}
                        required
                      />
                    </label>
                    <label className="book-modal__stay-field">
                      <span className="book-modal__stay-field-label">Until</span>
                      <input
                        type="time"
                        className="input input--line book-modal__stay-time-control"
                        value={careEnd}
                        onChange={(e) => setCareEnd(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                </div>
                {staySummaryLine && timeOk ? (
                  <p className="book-modal__stay-summary">{staySummaryLine}</p>
                ) : null}
                {!timeOk && careStart && careEnd && careEndDateISO ? (
                  <p className="book-modal__hint book-modal__hint--warn book-modal__stay-warn">
                    Check-out date and time must be after check-in.
                  </p>
                ) : null}
              </div>

              {timeOk ? (
                <div className="book-modal__section">
                  <span className="book-modal__step">2</span>
                  <label className="field-block book-modal__field-grow">
                    <span className="field-block__label">Number of children</span>
                    <input
                      type="number"
                      className="input input--line"
                      min={1}
                      max={20}
                      step={1}
                      value={kidCount}
                      onChange={(e) => setKidCount(e.target.value)}
                      placeholder="e.g. 2"
                      inputMode="numeric"
                    />
                  </label>
                </div>
              ) : null}

              {timeOk && kidsOk ? (
                <div className="book-modal__section">
                  <span className="book-modal__step">3</span>
                  <label className="field-block book-modal__field-grow">
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
                </div>
              ) : null}

              {timeOk && kidsOk && nameOk ? (
                <div className="book-modal__section">
                  <span className="book-modal__step">4</span>
                  <label className="field-block book-modal__field-grow">
                    <span className="field-block__label">Phone number (so your caregiver can reach you)</span>
                    <input
                      type="tel"
                      className="input input--line"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      autoComplete="tel"
                    />
                  </label>
                  {phone.trim() && !phoneOk ? (
                    <p className="book-modal__hint book-modal__hint--warn">Enter a phone number with at least 7 digits.</p>
                  ) : null}
                </div>
              ) : null}

              {timeOk && kidsOk && nameOk && phoneOk ? (
                <div className="book-modal__section">
                  <span className="book-modal__step">5</span>
                  <label className="field-block book-modal__field-grow">
                    <span className="field-block__label">Notes for your caregiver (optional)</span>
                    <textarea
                      className="input input--area book-modal__notes"
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      placeholder="e.g. early pickup, allergies, backup contact…"
                      rows={3}
                      maxLength={2000}
                      autoComplete="off"
                    />
                  </label>
                </div>
              ) : null}

              {selectedIsPast ? (
                <p className="book-modal__hint book-modal__hint--warn">
                  This date has passed. Close and choose today or a future day.
                </p>
              ) : null}

              <div className="book-modal__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={closeBookingModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={
                    selectedIsPast || !timeOk || !kidsOk || !nameOk || !phoneOk
                  }
                >
                  Request these dates
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <details className="book-events-details">
        <summary className="book-events__summary">
          <span className="book-events__summary-title">Family-friendly events</span>
          <span className="book-events__summary-hint muted">Moraga & Oakland ideas</span>
        </summary>
        <div className="book-events__panel">
          <p className="muted book-events__lede">
            Ideas near Moraga & Oakland — confirm times with each place. Your caregiver also has a full list in Tools →
            Events.
          </p>
          <div className="book-events__grid">
            {EVENT_LOCATIONS.map(({ id, label }) => (
              <div key={id} className="book-events__col">
                <h3 className="book-events__loc">{label}</h3>
                <ul className="book-events__list">
                  {eventsByLocation[id]?.map((ev) => (
                    <li key={ev.id} className="book-events__item">
                      <span className="book-events__item-title">{ev.title}</span>
                      <span className="book-events__item-place muted">{ev.place}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link to="/events" className="btn btn--ghost book-events__more">
            Open full events list
          </Link>
        </div>
      </details>
    </div>
  )
}
