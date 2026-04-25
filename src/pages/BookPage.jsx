import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, WEEKDAYS, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'

function todayISO() {
  return toISODateLocal(new Date())
}

function dateISOFromParts(y, m, dayNum) {
  return toISODateLocal(new Date(y, m, dayNum))
}

const BOOK_CARE_HOURS_SHORT = '8–5'
const BOOK_CARE_HOURS_FULL = '8:00 AM – 5:00 PM'
const BOOK_CARE_HOURS_ARIA = '8 AM to 5 PM'
const CARE_TIME_MIN = '08:00'
const CARE_TIME_MAX = '17:00'
/** Monday–Friday: new requests cannot use 8 AM–5 PM; evening only from 6 PM. */
const WEEKDAY_EVENING_MIN = '18:00'
const WEEKDAY_EVENING_MAX = '23:59'
const WEEKDAY_EVENING_DEFAULT_START = '18:00'
const WEEKDAY_EVENING_DEFAULT_END = '21:00'

function minutesFromHM(hm) {
  if (!hm || typeof hm !== 'string' || !hm.includes(':')) return NaN
  const [h, m] = hm.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN
  return h * 60 + m
}

function careWindowValid(start, end, isWeekday) {
  const s = minutesFromHM(start)
  const e = minutesFromHM(end)
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return false
  if (isWeekday) {
    const lo = minutesFromHM(WEEKDAY_EVENING_MIN)
    const hi = minutesFromHM(WEEKDAY_EVENING_MAX)
    return s >= lo && e <= hi
  }
  const lo = minutesFromHM(CARE_TIME_MIN)
  const hi = minutesFromHM(CARE_TIME_MAX)
  return s >= lo && e <= hi
}

function phoneLooksReachable(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7
}

/** Monday–Friday (local time) — shown as busy on the booking calendar. */
function isMonToFri(date) {
  const d = date.getDay()
  return d >= 1 && d <= 5
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
  const [careStart, setCareStart] = useState(CARE_TIME_MIN)
  const [careEnd, setCareEnd] = useState(CARE_TIME_MAX)
  const [kidCount, setKidCount] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [phone, setPhone] = useState('')
  const [bookToast, setBookToast] = useState('')

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

  const eventsByLocation = useMemo(() => groupFamilyEventsByLocation(), [])

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
  const selectedIsWeekdayBusy = useMemo(() => isMonToFri(selected), [selected])

  const timeOk = useMemo(
    () => careWindowValid(careStart, careEnd, selectedIsWeekdayBusy),
    [careStart, careEnd, selectedIsWeekdayBusy]
  )
  const kidsOk = useMemo(() => {
    const k = Number(kidCount)
    return kidCount !== '' && Number.isInteger(k) && k >= 1 && k <= 20
  }, [kidCount])
  const nameOk = familyName.trim().length > 0
  const phoneOk = phoneLooksReachable(phone)

  function resetBookingModal(forWeekday) {
    if (forWeekday) {
      setCareStart(WEEKDAY_EVENING_DEFAULT_START)
      setCareEnd(WEEKDAY_EVENING_DEFAULT_END)
    } else {
      setCareStart(CARE_TIME_MIN)
      setCareEnd(CARE_TIME_MAX)
    }
    setKidCount('')
    setFamilyName('')
    setPhone('')
  }

  function openBookingModal(dayNum) {
    if (dayNum == null) return
    const dayDate = new Date(y, m, dayNum)
    setSelected(dayDate)
    resetBookingModal(isMonToFri(dayDate))
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
      familyName: familyName.trim(),
      contact: phone.trim(),
      kidCount: Number(kidCount),
      careStart,
      careEnd,
      notes: '',
    })
    closeBookingModal()
    resetBookingModal(isMonToFri(selected))
    setBookToast('Request sent! Your caregiver will follow up.')
    window.setTimeout(() => setBookToast(''), 5000)
  }

  return (
    <div className="page page--calendar page--book page--parents-only">
      <header className="calendar__head calendar__head--book">
        <h1 className="calendar__title">Book care</h1>
        <p className="calendar__subtitle muted">
          Tap a date to send a request. <strong>Monday–Friday</strong> are busy <strong>{BOOK_CARE_HOURS_FULL}</strong>{' '}
          — new requests can’t use those hours, but you can book <strong>evening care from 6:00 PM</strong> on weekdays.
          Weekends use daytime hours <strong>{BOOK_CARE_HOURS_FULL}</strong>. A dot means there is already a request that
          day.
        </p>
        <p className="book-parents-note muted">This page is for parents and families only.</p>
      </header>

      <div className="book-legend" role="group" aria-label="Calendar legend">
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--weekbusy" aria-hidden /> Mon–Fri busy{' '}
          <span className="book-legend__hours">({BOOK_CARE_HOURS_SHORT})</span>
        </span>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--booked" aria-hidden /> Has request(s)
        </span>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--today" aria-hidden /> Today
        </span>
        <span className="book-legend__item book-legend__item--hours">
          <strong>Weekends:</strong> requests <strong>{BOOK_CARE_HOURS_FULL}</strong>.{' '}
          <strong>Mon–Fri:</strong> evening only <strong>6:00 PM – 11:59 PM</strong>.
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
            const isWeekdayBusy = isMonToFri(dayDate)
            const dateForAria = dayDate.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
            const ariaBits = [
              dateForAria,
              isWeekdayBusy
                ? `Weekday busy ${BOOK_CARE_HOURS_ARIA}; evening requests from 6 PM`
                : `Daytime care ${BOOK_CARE_HOURS_ARIA}`,
              isBooked ? `${dayBookings.length} request${dayBookings.length > 1 ? 's' : ''}` : null,
            ].filter(Boolean)

            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-label={ariaBits.join(', ')}
                className={`calendar__cell ${isSel ? 'calendar__cell--selected' : ''} ${isToday ? 'calendar__cell--today' : ''} ${isWeekdayBusy ? 'calendar__cell--weekbusy' : ''} ${isBooked ? 'calendar__cell--booked' : ''} ${isPast ? 'calendar__cell--past' : ''}`}
                onClick={() => openBookingModal(dayNum)}
              >
                <span className="calendar__cell-num">{dayNum}</span>
                <span className="calendar__cell-hours" aria-hidden>
                  {isWeekdayBusy ? '6pm+' : BOOK_CARE_HOURS_SHORT}
                </span>
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
        Tap any day on the calendar to open the request form (time, number of children, your name, and phone).
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
                  Request care
                </h2>
                <p className="book-modal__date muted">{selectedLabel}</p>
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
            ) : selectedIsWeekdayBusy ? (
              <p className="book-modal__note muted">
                <strong>Weekday:</strong> daytime ({BOOK_CARE_HOURS_FULL}) isn’t available for new requests. Choose a
                window <strong>from 6:00 PM</strong> (evening care only).
              </p>
            ) : null}

            <form className="book-modal__form" onSubmit={submitBooking}>
              <div className="book-modal__section">
                <span className="book-modal__step">1</span>
                <div className="book-modal__fields">
                  <span className="field-block__label">
                    {selectedIsWeekdayBusy
                      ? 'Evening care (6:00 PM – 11:59 PM)'
                      : `Care time (${BOOK_CARE_HOURS_FULL})`}
                  </span>
                  <div className="book-modal__time-row">
                    <label className="book-modal__time-field">
                      <span className="book-modal__time-label">Start</span>
                      <input
                        type="time"
                        className="input input--line"
                        value={careStart}
                        min={selectedIsWeekdayBusy ? WEEKDAY_EVENING_MIN : CARE_TIME_MIN}
                        max={selectedIsWeekdayBusy ? WEEKDAY_EVENING_MAX : CARE_TIME_MAX}
                        onChange={(e) => setCareStart(e.target.value)}
                        required
                      />
                    </label>
                    <label className="book-modal__time-field">
                      <span className="book-modal__time-label">End</span>
                      <input
                        type="time"
                        className="input input--line"
                        value={careEnd}
                        min={
                          careStart ||
                          (selectedIsWeekdayBusy ? WEEKDAY_EVENING_MIN : CARE_TIME_MIN)
                        }
                        max={selectedIsWeekdayBusy ? WEEKDAY_EVENING_MAX : CARE_TIME_MAX}
                        onChange={(e) => setCareEnd(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  {!timeOk && careStart && careEnd ? (
                    <p className="book-modal__hint book-modal__hint--warn">
                      {selectedIsWeekdayBusy
                        ? 'On weekdays, pick a window from 6:00 PM through 11:59 PM, with end after start.'
                        : `Choose a window between ${BOOK_CARE_HOURS_FULL}, with end after start.`}
                    </p>
                  ) : null}
                </div>
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
                  Submit request
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
