import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, WEEKDAYS, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'

function todayISO() {
  return toISODateLocal(new Date())
}

function dateISOFromParts(y, m, dayNum) {
  return toISODateLocal(new Date(y, m, dayNum))
}

function formatCareWindow(careStart, careEnd) {
  if (!careStart || !careEnd) return null
  const fmt = (hm) => {
    const [h, m] = hm.split(':').map(Number)
    if (!Number.isFinite(h) || !Number.isFinite(m)) return hm
    return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  return `${fmt(careStart)} – ${fmt(careEnd)}`
}

/**
 * Caregiver schedule (page 2): upcoming care after families book via /book.
 */
export default function SchedulePage() {
  const { bookings } = useBookings()
  const today = new Date()
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selected, setSelected] = useState(() => new Date(today))

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

  const upcoming = useMemo(() => {
    const t = todayISO()
    return [...bookings]
      .filter((b) => b.dateISO && b.dateISO >= t)
      .sort((a, b) => {
        const c = a.dateISO.localeCompare(b.dateISO)
        return c !== 0 ? c : (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
      })
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

  function pickDay(dayNum) {
    if (dayNum == null) return
    setSelected(new Date(y, m, dayNum))
  }

  function prevMonth() {
    setCursor(new Date(y, m - 1, 1))
  }

  function nextMonth() {
    setCursor(new Date(y, m + 1, 1))
  }

  return (
    <div className="page page--calendar page--schedule">
      <div className="page__badge" aria-hidden>
        2
      </div>
      <header className="schedule__head">
        <Link to="/" className="page-back page-back--ghost">
          ← Home
        </Link>
        <h1 className="schedule__title">Schedule</h1>
        <p className="schedule__lede muted">
          After families submit requests through the parent-only link you share, those dates show up here.
        </p>
      </header>

      <div className="book-legend" aria-hidden>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--booked" /> Booked
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
        <div className="calendar__grid calendar__grid--book" role="grid" aria-label="Care schedule">
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
                aria-label={`${dayNum}${isBooked ? `, ${dayBookings.length} booking${dayBookings.length > 1 ? 's' : ''}` : ''}`}
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

      <section className="schedule-day-detail" aria-labelledby="schedule-day-title">
        <h2 id="schedule-day-title" className="schedule-day-detail__title">
          {selectedLabel}
        </h2>
        {selectedBookings.length === 0 ? (
          <p className="muted">No care booked this day.</p>
        ) : (
          <ul className="schedule-day-detail__list">
            {selectedBookings.map((b) => (
              <li key={b.id} className="schedule-day-detail__item">
                <strong>{b.familyName}</strong>
                <span className="muted">{b.contact}</span>
                {formatCareWindow(b.careStart, b.careEnd) ? (
                  <span className="schedule-day-detail__meta muted">
                    {formatCareWindow(b.careStart, b.careEnd)}
                    {b.kidCount != null
                      ? ` · ${b.kidCount} ${b.kidCount === 1 ? 'child' : 'children'}`
                      : ''}
                  </span>
                ) : b.kidCount != null ? (
                  <span className="schedule-day-detail__meta muted">
                    {b.kidCount} {b.kidCount === 1 ? 'child' : 'children'}
                  </span>
                ) : null}
                {b.notes ? <p className="schedule-day-detail__notes">{b.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="book-upcoming schedule-upcoming" aria-labelledby="schedule-upcoming-title">
        <h2 id="schedule-upcoming-title" className="book-upcoming__title">
          Upcoming care
        </h2>
        {upcoming.length === 0 ? (
          <p className="muted">No upcoming dates yet. Share your parent booking link when you’re ready.</p>
        ) : (
          <ul className="book-upcoming__list">
            {upcoming.map((b) => (
              <li key={b.id} className="book-upcoming__row">
                <time className="book-upcoming__date" dateTime={b.dateISO}>
                  {new Date(b.dateISO + 'T12:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <div className="book-upcoming__body">
                  <strong>{b.familyName}</strong>
                  <span className="muted">{b.contact}</span>
                  {formatCareWindow(b.careStart, b.careEnd) || b.kidCount != null ? (
                    <span className="book-upcoming__meta muted">
                      {[formatCareWindow(b.careStart, b.careEnd), b.kidCount != null ? `${b.kidCount} ${b.kidCount === 1 ? 'child' : 'children'}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  ) : null}
                  {b.notes ? <p className="book-upcoming__notes">{b.notes}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="calendar__footer schedule__footer">
        <Link to="/hub" className="btn btn--primary calendar__next">
          Continue to tools
        </Link>
      </div>
    </div>
  )
}
