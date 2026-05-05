import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { toISODateLocal, addDays } from '../utils/dates'
import { monthGrid, WEEKDAYS, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { bookingOccupiesCalendarSlot } from '../utils/bookingCalendar'
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

/** Hover tooltip on “Book a gig” (styled bubble; copy matches user-requested wording). */
const BOOK_GIG_HEADING_TIP =
  'Tap a day to request a gig: set when the nanny’s shift starts and when it ends (including overnight). Then add your family details.'

function phoneLooksReachable(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7
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
  const [careStartDateISO, setCareStartDateISO] = useState(() => toISODateLocal(new Date()))
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
      if (!bookingOccupiesCalendarSlot(b)) continue
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

  const selectedBookings = bookingsByDate[careStartDateISO] ?? []
  const careStartIsPast = careStartDateISO < todayISO()

  useEffect(() => {
    if (!bookModalOpen) return
    setSelected(new Date(`${careStartDateISO}T12:00:00`))
  }, [bookModalOpen, careStartDateISO])

  const careDateHeadline = useMemo(() => {
    const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    const a = new Date(`${careStartDateISO}T12:00:00`).toLocaleDateString(undefined, opts)
    const b = new Date(`${careEndDateISO}T12:00:00`).toLocaleDateString(undefined, opts)
    if (careStartDateISO === careEndDateISO) return a
    return `${a} → ${b}`
  }, [careStartDateISO, careEndDateISO])

  const careSpanSummary = useMemo(() => {
    const d0 = new Date(`${careStartDateISO}T12:00:00`)
    const d1 = new Date(`${careEndDateISO}T12:00:00`)
    const diff = Math.round((d1 - d0) / 86400000)
    if (diff === 0) return null
    if (diff === 1) return 'Overnight gig · spans 2 days on the calendar'
    return `${diff + 1} calendar days · this gig includes ${diff} overnight${diff === 1 ? '' : 's'}`
  }, [careStartDateISO, careEndDateISO])

  const careEndDateMax = useMemo(
    () => toISODateLocal(addDays(new Date(`${careStartDateISO}T12:00:00`), BOOK_END_DATE_SPAN_DAYS)),
    [careStartDateISO]
  )

  const timeOk = useMemo(
    () => careIntervalValid(careStartDateISO, careStart, careEndDateISO, careEnd),
    [careStartDateISO, careStart, careEndDateISO, careEnd]
  )
  const kidsOk = useMemo(() => {
    const k = Number(kidCount)
    return kidCount !== '' && Number.isInteger(k) && k >= 1 && k <= 20
  }, [kidCount])
  const nameOk = familyName.trim().length > 0
  const phoneOk = phoneLooksReachable(phone)

  function resetBookingModal(startISO) {
    setCareStart(DEFAULT_CARE_START)
    setCareEnd(DEFAULT_CARE_END)
    setCareStartDateISO(startISO)
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
    if (careStartIsPast) return
    if (!timeOk || !kidsOk || !nameOk || !phoneOk) return
    const start = careStartDateISO
    addBooking({
      dateISO: start,
      careEndDateISO,
      familyName: familyName.trim(),
      contact: phone.trim(),
      kidCount: Number(kidCount),
      careStart,
      careEnd,
      notes: requestNotes.trim(),
    })
    closeBookingModal()
    resetBookingModal(start)
    setBookToast('Request sent! Your caregiver will follow up.')
    window.setTimeout(() => setBookToast(''), 5000)
  }

  return (
    <div className="page page--calendar page--book page--parents-only">
      <header className="calendar__head calendar__head--book">
        <p className="book-parents-banner" role="note">
          This page is for parents and families only.
        </p>
        <h1
          className="calendar__title calendar__title--book-tip"
          id="book-page-heading"
          aria-describedby="book-page-intro"
          data-tooltip={BOOK_GIG_HEADING_TIP}
        >
          Book a gig
        </h1>
        <p id="book-page-intro" className="sr-only">
          {BOOK_GIG_HEADING_TIP} Dots show days that already have a request.
        </p>
      </header>

      <div className="book-legend" role="group" aria-label="Calendar legend">
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--booked" aria-hidden /> Has request(s)
        </span>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--today" aria-hidden /> Today
        </span>
        <span className="book-legend__item book-legend__item--hours">
          <strong>Shift length:</strong> choose end date and time after start for overnight or multi-day nanny gigs.
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
        Pick a start day on the calendar, then set gig start and end date-times in the form.
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
                <p className="book-modal__eyebrow">Gig request</p>
                <h2 id="book-modal-title" className="book-modal__title">
                  Request a nanny gig
                </h2>
                <p className="book-modal__date">{careDateHeadline}</p>
                <p className="book-modal__sub muted">
                  When does the gig start, and when does it end? You can cover evenings and overnights.
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
                This start day already has {selectedBookings.length} request
                {selectedBookings.length > 1 ? 's' : ''}. Submit only if your caregiver approved overlapping gigs.
              </p>
            ) : null}

            <form className="book-modal__form" onSubmit={submitBooking}>
              <div className="book-modal__hotel-card" aria-label="Gig start and end">
                <div className="book-modal__hotel-dates">
                  <div className="book-modal__hotel-col">
                    <span className="book-modal__hotel-kicker">Gig starts</span>
                    <input
                      type="date"
                      className="input input--line book-modal__hotel-date"
                      value={careStartDateISO}
                      onChange={(e) => {
                        const v = e.target.value
                        if (!v) return
                        setCareStartDateISO(v)
                        setCareEndDateISO((prev) => (prev < v ? v : prev))
                      }}
                      required
                    />
                    <label className="book-modal__hotel-time-label">
                      <span>Start time</span>
                      <input
                        type="time"
                        className="input input--line"
                        value={careStart}
                        onChange={(e) => setCareStart(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <div className="book-modal__hotel-rail" aria-hidden />
                  <div className="book-modal__hotel-col">
                    <span className="book-modal__hotel-kicker">Gig ends</span>
                    <input
                      type="date"
                      className="input input--line book-modal__hotel-date"
                      value={careEndDateISO}
                      min={careStartDateISO}
                      max={careEndDateMax}
                      onChange={(e) => {
                        let v = e.target.value
                        if (!v || v < careStartDateISO) v = careStartDateISO
                        setCareEndDateISO(v)
                      }}
                      required
                    />
                    <label className="book-modal__hotel-time-label">
                      <span>End time</span>
                      <input
                        type="time"
                        className="input input--line"
                        value={careEnd}
                        onChange={(e) => setCareEnd(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                </div>
                {careSpanSummary ? (
                  <p className="book-modal__hotel-summary muted">{careSpanSummary}</p>
                ) : null}
                {!timeOk && careStart && careEnd && careStartDateISO && careEndDateISO ? (
                  <p className="book-modal__hint book-modal__hint--warn book-modal__hotel-warn">
                    End date and time must be after the gig starts.
                  </p>
                ) : null}
              </div>

              <div className="book-modal__block">
                <span className="book-modal__block-title">Children on this gig</span>
                <label className="field-block book-modal__field-grow">
                  <span className="field-block__label">How many</span>
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

              <div className="book-modal__block">
                <span className="book-modal__block-title">Contact</span>
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
                <label className="field-block book-modal__field-grow">
                  <span className="field-block__label">Phone</span>
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
                  <p className="book-modal__hint book-modal__hint--warn">
                    Enter a phone number with at least 7 digits.
                  </p>
                ) : null}
              </div>

              <div className="book-modal__block">
                <span className="book-modal__block-title">Notes for caregiver</span>
                <label className="field-block book-modal__field-grow">
                  <span className="field-block__label">Notes (optional)</span>
                  <textarea
                    className="input input--area book-modal__notes"
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Diet, routines, pickup plans, second parent contact…"
                    rows={3}
                    maxLength={2000}
                    autoComplete="off"
                  />
                </label>
              </div>

              {careStartIsPast ? (
                <p className="book-modal__hint book-modal__hint--warn">
                  Gig start date has passed. Close and pick today or a future day on the calendar.
                </p>
              ) : null}

              <div className="book-modal__actions">
                <button type="button" className="btn btn--ghost" onClick={closeBookingModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={careStartIsPast || !timeOk || !kidsOk || !nameOk || !phoneOk}
                >
                  Send request
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
