import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, WEEKDAYS, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { useUpcomingGigsThemePlayback } from '../hooks/useUpcomingGigsThemePlayback'
import { bookingOccupiesCalendarSlot } from '../utils/bookingCalendar'
import { expandBookingCalendarDates, formatCareBookingWindow, bookingEndMs } from '../utils/bookingRange'
import ScheduleCelebrationsFlip from '../components/ScheduleCelebrationsFlip'
import { useJournalDaySky } from '../hooks/useJournalDaySky'

function todayISO() {
  return toISODateLocal(new Date())
}

function dateISOFromParts(y, m, dayNum) {
  return toISODateLocal(new Date(y, m, dayNum))
}

function gigResponseStatus(b) {
  if (b.responseStatus === 'accepted' || b.responseStatus === 'declined') return b.responseStatus
  return 'pending'
}

const SCHEDULE_HEADING_TIP =
  'After families submit requests through the parent-only link you share, those dates show on the calendar. Tap Requests next to the title to review requests — accept or decline each one.'

const SCHEDULE_EYEBROW_TOOLTIP =
  'Families submit through your shared booking link. Open Requests to accept or decline each booking; your month view highlights confirmed days.'

const SCHEDULE_PAGE_INTRO_TEXT = `${SCHEDULE_HEADING_TIP} ${SCHEDULE_EYEBROW_TOOLTIP}`

/**
 * Caregiver schedule (page 2): requested dates after families book via /book.
 */
export default function SchedulePage() {
  const { bookings, patchBooking, removeBooking } = useBookings()
  const today = new Date()
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const cells = useMemo(() => monthGrid(y, m), [y, m])
  const calendarRowCount = useMemo(() => Math.ceil(cells.length / 7), [cells.length])

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

  const upcoming = useMemo(() => {
    const now = Date.now()
    return [...bookings]
      .filter((b) => b.dateISO && bookingEndMs(b) >= now)
      .sort((a, b) => {
        const a0 = new Date(`${a.dateISO}T${a.careStart || '00:00'}:00`).getTime()
        const b0 = new Date(`${b.dateISO}T${b.careStart || '00:00'}:00`).getTime()
        if (a0 !== b0) return a0 - b0
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
      })
  }, [bookings])

  const acceptedUpcoming = useMemo(() => {
    const now = Date.now()
    return [...bookings]
      .filter((b) => b.responseStatus === 'accepted' && b.dateISO && bookingEndMs(b) >= now)
      .sort((a, b) => {
        const a0 = new Date(`${a.dateISO}T${a.careStart || '00:00'}:00`).getTime()
        const b0 = new Date(`${b.dateISO}T${b.careStart || '00:00'}:00`).getTime()
        if (a0 !== b0) return a0 - b0
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
      })
  }, [bookings])

  const [carouselIndex, setCarouselIndex] = useState(0)
  const [enterAnim, setEnterAnim] = useState(null)
  const [requestsDockOpen, setRequestsDockOpen] = useState(false)
  /** Schedule “card”: month grid (front) flips to upcoming gigs list (back). */
  const [scheduleCardListFace, setScheduleCardListFace] = useState(false)

  useUpcomingGigsThemePlayback(scheduleCardListFace)

  useEffect(() => {
    if (upcoming.length === 0) {
      setCarouselIndex(0)
      return
    }
    setCarouselIndex((i) => Math.min(i, upcoming.length - 1))
  }, [upcoming.length])

  useEffect(() => {
    if (!enterAnim) return
    const t = window.setTimeout(() => setEnterAnim(null), 320)
    return () => window.clearTimeout(t)
  }, [carouselIndex, enterAnim])

  const currentGig = upcoming.length > 0 ? upcoming[carouselIndex] : null
  const gigStatus = currentGig ? gigResponseStatus(currentGig) : 'pending'

  function goNextGig() {
    if (upcoming.length <= 1) return
    setEnterAnim('next')
    setCarouselIndex((i) => (i + 1) % upcoming.length)
  }

  function goPrevGig() {
    if (upcoming.length <= 1) return
    setEnterAnim('prev')
    setCarouselIndex((i) => (i - 1 + upcoming.length) % upcoming.length)
  }

  function deleteCurrentGig() {
    if (!currentGig) return
    if (
      !window.confirm(
        'Delete this gig request? It will be removed from your calendar, the parent booking page, and upcoming gigs.'
      )
    ) {
      return
    }
    removeBooking(currentGig.id)
  }

  const title = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const daySky = useJournalDaySky(todayISO())

  function prevMonth() {
    setCursor(new Date(y, m - 1, 1))
  }

  function nextMonth() {
    setCursor(new Date(y, m + 1, 1))
  }

  return (
    <div
      className="page page--calendar page--schedule page--kid-journal schedule-dashboard work-ui"
      style={daySky.style}
      data-sky-phase={daySky.label}
    >
      <div className="schedule__stage">
      <header className="schedule__head schedule-workspace-head">
        <Link to="/" className="page-back page-back--ghost">
          ← Home
        </Link>
        <p
          className="schedule-workspace-head__eyebrow schedule-workspace-head__eyebrow--hover-tip"
          data-tooltip={SCHEDULE_EYEBROW_TOOLTIP}
          tabIndex={0}
        >
          Scheduling workspace
        </p>
        <p className="journal__sky-phase schedule__sky-phase" aria-live="polite">
          {daySky.label}
        </p>
        <div className="schedule__title-row">
          <h1
            className="schedule__title schedule__title--hover-tip"
            id="schedule-page-heading"
            aria-describedby="schedule-page-intro"
            data-tooltip={SCHEDULE_HEADING_TIP}
          >
            Schedule
          </h1>
          <div className={`schedule-requests-dock ${requestsDockOpen ? 'schedule-requests-dock--open' : ''}`}>
            <button
              type="button"
              className="schedule-requests-dock__tab"
              onClick={() => setRequestsDockOpen((o) => !o)}
              aria-expanded={requestsDockOpen}
              aria-controls="schedule-requests-panel"
              aria-label={
                upcoming.length > 0
                  ? `Open requests (${upcoming.length} pending)`
                  : 'Open requests'
              }
            >
              {requestsDockOpen ? (
                <span className="schedule-requests-dock__tab-x" aria-hidden>
                  ×
                </span>
              ) : (
                <>
                  <span className="schedule-requests-dock__tab-ico" aria-hidden>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  <span className="schedule-requests-dock__tab-lbl">Requests</span>
                  {upcoming.length > 0 ? (
                    <span className="schedule-requests-dock__badge" aria-hidden>
                      {upcoming.length > 99 ? '99+' : upcoming.length}
                    </span>
                  ) : null}
                </>
              )}
            </button>
            <div
              className="schedule-requests-dock__panel"
              id="schedule-requests-panel"
              role="region"
              aria-hidden={!requestsDockOpen}
              aria-labelledby="schedule-requested-dates-title"
            >
              <h2 id="schedule-requested-dates-title" className="schedule-requests-dock__title">
                Request queue
              </h2>
              {upcoming.length === 0 ? (
                <p className="muted">No requested dates yet. Share your parent booking link when you’re ready.</p>
              ) : (
                <div className="schedule-upcoming-carousel">
                  <div className="schedule-upcoming-carousel__nav" aria-label="Browse requested dates">
                    <button
                      type="button"
                      className="btn btn--ghost schedule-upcoming-carousel__arrow"
                      onClick={goPrevGig}
                      disabled={upcoming.length <= 1}
                      aria-label="Previous request"
                    >
                      ‹
                    </button>
                    <span className="schedule-upcoming-carousel__count muted">
                      {carouselIndex + 1} / {upcoming.length}
                    </span>
                    <button
                      type="button"
                      className="btn btn--ghost schedule-upcoming-carousel__arrow"
                      onClick={goNextGig}
                      disabled={upcoming.length <= 1}
                      aria-label="Next request"
                    >
                      ›
                    </button>
                  </div>

                  <div className="schedule-upcoming-carousel__window">
                    <div
                      className={`schedule-upcoming-card book-upcoming__row ${enterAnim === 'next' ? 'schedule-upcoming-card--enter-next' : ''} ${enterAnim === 'prev' ? 'schedule-upcoming-card--enter-prev' : ''}`}
                      key={currentGig.id}
                    >
                      <time className="book-upcoming__date" dateTime={currentGig.dateISO}>
                        {new Date(currentGig.dateISO + 'T12:00:00').toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      <div className="book-upcoming__body">
                        <strong>{currentGig.familyName}</strong>
                        <span className="muted">{currentGig.contact}</span>
                        {formatCareBookingWindow(currentGig) || currentGig.kidCount != null ? (
                          <span className="book-upcoming__meta muted">
                            {[formatCareBookingWindow(currentGig), currentGig.kidCount != null ? `${currentGig.kidCount} ${currentGig.kidCount === 1 ? 'child' : 'children'}` : null]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        ) : null}
                        {currentGig.notes ? <p className="book-upcoming__notes">{currentGig.notes}</p> : null}

                        <div className="schedule-upcoming-card__actions">
                          {gigStatus === 'pending' ? (
                            <>
                              <button
                                type="button"
                                className="btn btn--primary schedule-upcoming-card__btn"
                                onClick={() => patchBooking(currentGig.id, { responseStatus: 'accepted' })}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="btn btn--ghost schedule-upcoming-card__btn"
                                onClick={() => patchBooking(currentGig.id, { responseStatus: 'declined' })}
                              >
                                Decline
                              </button>
                            </>
                          ) : gigStatus === 'accepted' ? (
                            <p className="schedule-upcoming-card__status schedule-upcoming-card__status--accepted muted">
                              Accepted
                            </p>
                          ) : (
                            <>
                              <p className="schedule-upcoming-card__status schedule-upcoming-card__status--declined muted">
                                Declined
                              </p>
                              <button
                                type="button"
                                className="btn btn--ghost schedule-upcoming-card__btn schedule-upcoming-card__undo"
                                onClick={() => patchBooking(currentGig.id, { responseStatus: undefined })}
                              >
                                Undo decline
                              </button>
                            </>
                          )}
                        </div>
                        <div className="schedule-upcoming-card__delete-row">
                          <button
                            type="button"
                            className="btn btn--ghost schedule-upcoming-card__delete"
                            onClick={deleteCurrentGig}
                            aria-label="Delete this gig request"
                          >
                            Delete gig
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {requestsDockOpen ? (
          <button
            type="button"
            className="schedule-requests-dock__scrim"
            aria-label="Close requested dates"
            onClick={() => setRequestsDockOpen(false)}
          />
        ) : null}
        <p id="schedule-page-intro" className="sr-only">
          {SCHEDULE_PAGE_INTRO_TEXT}
        </p>
      </header>

      <div className="schedule-dashboard__hud" aria-label="Schedule overview">
        <div className="schedule-dashboard__stat">
          <span className="schedule-dashboard__stat-label">Queue</span>
          <span className="schedule-dashboard__stat-value">{upcoming.length}</span>
        </div>
        <div className="schedule-dashboard__stat">
          <span className="schedule-dashboard__stat-label">Confirmed</span>
          <span className="schedule-dashboard__stat-value">{acceptedUpcoming.length}</span>
        </div>
        <div className="schedule-dashboard__stat schedule-dashboard__stat--wide">
          <span className="schedule-dashboard__stat-label">Viewing</span>
          <span className="schedule-dashboard__stat-value">{title}</span>
        </div>
      </div>

      <div className="book-legend book-legend--work" aria-hidden>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--booked" /> Has booking
        </span>
        <span className="book-legend__item">
          <span className="book-legend__dot book-legend__dot--today" /> Today
        </span>
      </div>

      <div className="schedule-calendar-section">
        <div className="schedule-calendar-section__fun">
          <ScheduleCelebrationsFlip year={y} monthIndex={m} embedded />
        </div>
        <div className="schedule-flip schedule-calendar-flip">
          <div className="schedule-flip__scene">
            <div
              className={`schedule-flip__inner${scheduleCardListFace ? ' schedule-flip__inner--list' : ''}`}
              aria-live="polite"
            >
              <div
                className="schedule-flip__face schedule-flip__face--front calendar__panel calendar__panel--book work-ui__calendar-card"
                aria-hidden={scheduleCardListFace}
              >
                <div className="schedule-flip__calendar-main schedule-calendar-section__calendar">
                <div className="schedule-flip__calendar-top">
                  <div className="calendar__nav">
                    <button type="button" className="btn btn--ghost" onClick={prevMonth}>
                      ‹
                    </button>
                    <span className="calendar__month">{title}</span>
                    <button type="button" className="btn btn--ghost" onClick={nextMonth}>
                      ›
                    </button>
                  </div>
                </div>
                <div className="schedule-flip__upcoming-slot">
                  <button
                    type="button"
                    className="schedule-flip__upcoming-strip schedule-flip__upcoming-strip--gigs"
                    onClick={() => setScheduleCardListFace(true)}
                    aria-label="Open upcoming gigs list"
                  >
                    Upcoming gigs
                  </button>
                </div>
                <div
                  className="schedule-calendar-section__grid-grow"
                  style={{ '--schedule-calendar-rows': calendarRowCount }}
                >
                <div className="calendar__weekdays" aria-hidden>
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="calendar__wd">
                      {w}
                    </span>
                  ))}
                </div>
                <div className="calendar__grid calendar__grid--book" role="grid" aria-label="Gig schedule">
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
                    const isTodayCell = isSameDay(today, new Date(y, m, dayNum))
                    const isPast = iso < todayISO()

                    return (
                      <div
                        key={i}
                        role="gridcell"
                        aria-label={`${dayNum}${isBooked ? `, ${dayBookings.length} booking${dayBookings.length > 1 ? 's' : ''}` : ''}`}
                        className={`calendar__cell ${isTodayCell ? 'calendar__cell--today' : ''} ${isBooked ? 'calendar__cell--booked' : ''} ${isPast ? 'calendar__cell--past' : ''}`}
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
                      </div>
                    )
                  })}
                </div>
                </div>
                </div>
              </div>

              <div
                className="schedule-flip__face schedule-flip__face--back schedule-flip__retro32 calendar__panel calendar__panel--book work-ui__calendar-card"
                aria-hidden={!scheduleCardListFace}
              >
                <div className="schedule-flip__back-top">
                <button
                  type="button"
                  className="btn btn--ghost schedule-flip__back-btn"
                  onClick={() => setScheduleCardListFace(false)}
                >
                  ← Month
                </button>
                <h2 id="schedule-accepted-gigs-title" className="schedule-flip__back-heading">
                  Upcoming gigs
                </h2>
                </div>
                <div className="schedule-flip__list-scroll">
                {acceptedUpcoming.length === 0 ? (
                  <p className="muted schedule-flip__list-empty">
                    No confirmed upcoming gigs yet. Accept requests from the queue to see them here.
                  </p>
                ) : (
                  <ul className="schedule-accepted-gigs__list schedule-accepted-gigs__list--flip">
                    {acceptedUpcoming.map((b) => (
                      <li key={b.id} className="book-upcoming__row schedule-accepted-gigs__row">
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
                          {formatCareBookingWindow(b) || b.kidCount != null ? (
                            <span className="book-upcoming__meta muted">
                              {[formatCareBookingWindow(b), b.kidCount != null ? `${b.kidCount} ${b.kidCount === 1 ? 'child' : 'children'}` : null]
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="calendar__footer schedule__footer">
        <Link to="/hub" className="schedule__flow-hint schedule__flow-hint--link muted">
          <span className="schedule__flow-hint-mobile">Swipe left for Tools</span>
          <span className="schedule__flow-hint-desktop">Open Tools →</span>
        </Link>
      </div>
      </div>
    </div>
  )
}
