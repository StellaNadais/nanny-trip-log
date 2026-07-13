import { useEffect, useState } from 'react'
import { WEEKDAYS } from '../utils/calendarMonth'
import { formatCareBookingWindow } from '../utils/bookingRange'
import { formatBookingChildrenLabel } from '../utils/bookingChildren'
import { useUpcomingGigsThemePlayback } from '../hooks/useUpcomingGigsThemePlayback'

function gigResponseStatus(b) {
  if (b.responseStatus === 'accepted' || b.responseStatus === 'declined') return b.responseStatus
  return 'pending'
}

function gigStatusLabel(status) {
  if (status === 'accepted') return 'Confirmed'
  if (status === 'declined') return 'Declined'
  return 'Request'
}

export default function ScheduleCalendarFlip({
  title,
  cells,
  y,
  m,
  today,
  calendarRowCount,
  bookingsByDate,
  upcoming,
  dateISOFromParts,
  todayISO,
  isSameDay,
  cellBookingMod,
  cellBookingLabel,
  onPrevMonth,
  onNextMonth,
  embedded = false,
  listTitle = 'Upcoming gigs',
  listFlipLabel = 'Upcoming gigs',
  listEmptyMessage = 'No upcoming gigs on the calendar yet. Share your booking link with families.',
  onDateSelect,
  onDateHover,
  dateSelectionRole,
  showSelectionLegend = false,
}) {
  const [listFace, setListFace] = useState(false)

  useEffect(() => {
    setListFace(false)
  }, [y, m])

  useUpcomingGigsThemePlayback(listFace)

  return (
    <div
      className={`schedule-flip schedule-calendar-flip${embedded ? ' schedule-calendar-flip--embedded' : ''}`}
      style={{ '--schedule-calendar-rows': calendarRowCount }}
    >
      <div className="schedule-flip__scene">
        <div
          className={`schedule-flip__inner${listFace ? ' schedule-flip__inner--list' : ''}`}
          aria-live="polite"
        >
          <div
            className="schedule-flip__face schedule-flip__face--front calendar__panel calendar__panel--book work-ui__calendar-card"
            aria-hidden={listFace}
          >
            <div className="schedule-flip__calendar-main schedule-calendar-section__calendar">
              <div className="schedule-flip__calendar-top">
                <div className="calendar__nav">
                  <button type="button" className="btn btn--ghost" onClick={onPrevMonth}>
                    ‹
                  </button>
                  <span className="calendar__month">{title}</span>
                  <button type="button" className="btn btn--ghost" onClick={onNextMonth}>
                    ›
                  </button>
                </div>
                <div className="schedule-calendar-flip__legend" aria-hidden>
                  <span className="schedule-calendar-flip__legend-item schedule-calendar-flip__legend-item--today">
                    Today
                  </span>
                  <span className="schedule-calendar-flip__legend-item schedule-calendar-flip__legend-item--booked">
                    Confirmed
                  </span>
                  <span className="schedule-calendar-flip__legend-item schedule-calendar-flip__legend-item--pending">
                    Request
                  </span>
                  {showSelectionLegend ? (
                    <>
                      <span className="schedule-calendar-flip__legend-item schedule-calendar-flip__legend-item--select-start">
                        Start
                      </span>
                      <span className="schedule-calendar-flip__legend-item schedule-calendar-flip__legend-item--select-end">
                        End
                      </span>
                      <span className="schedule-calendar-flip__legend-item schedule-calendar-flip__legend-item--select-range">
                        Your dates
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="schedule-calendar-section__grid-grow">
                <div className="calendar__weekdays" aria-hidden>
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="calendar__wd">
                      {w}
                    </span>
                  ))}
                </div>
                <div
                  className="calendar__grid calendar__grid--book"
                  role="grid"
                  aria-label="Gig schedule"
                  onMouseLeave={() => onDateHover?.(null)}
                >
                  {cells.map((dayNum, i) => {
                    if (dayNum == null) {
                      return (
                        <div key={i} className="calendar__cell calendar__cell--empty" role="gridcell" />
                      )
                    }
                    const iso = dateISOFromParts(y, m, dayNum)
                    const dayBookings = bookingsByDate[iso] ?? []
                    const isBooked = dayBookings.length > 0
                    const bookingMod = isBooked ? cellBookingMod(dayBookings) : ''
                    const isTodayCell = isSameDay(today, new Date(y, m, dayNum))
                    const isPast = iso < todayISO()
                    const selectionRole = dateSelectionRole?.(iso) ?? null
                    const selectable = Boolean(onDateSelect) && !isPast
                    const cellClass = [
                      'calendar__cell',
                      isTodayCell ? 'calendar__cell--today' : '',
                      isBooked ? `calendar__cell--booked calendar__cell--booked-${bookingMod}` : '',
                      isPast ? 'calendar__cell--past' : '',
                      selectable ? 'calendar__cell--selectable' : '',
                      selectionRole === 'single' ? 'calendar__cell--select-single' : '',
                      selectionRole === 'start' ? 'calendar__cell--select-start' : '',
                      selectionRole === 'end' ? 'calendar__cell--select-end' : '',
                      selectionRole === 'between' ? 'calendar__cell--select-between' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    const label = `${dayNum}${isBooked ? `, ${dayBookings.length} booking${dayBookings.length > 1 ? 's' : ''}` : ''}${selectionRole ? `, selected ${selectionRole}` : ''}`

                    const inner = (
                      <>
                        <span className="calendar__cell-num">{dayNum}</span>
                        {isBooked ? (
                          <span className="calendar__booked-label" aria-hidden>
                            {cellBookingLabel(dayBookings)}
                          </span>
                        ) : null}
                      </>
                    )

                    if (selectable) {
                      return (
                        <button
                          key={i}
                          type="button"
                          role="gridcell"
                          aria-label={label}
                          aria-pressed={selectionRole != null}
                          className={cellClass}
                          onClick={() => onDateSelect(iso)}
                          onMouseEnter={() => onDateHover?.(iso)}
                          onFocus={() => onDateHover?.(iso)}
                        >
                          {inner}
                        </button>
                      )
                    }

                    return (
                      <div key={i} role="gridcell" aria-label={label} className={cellClass}>
                        {inner}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="schedule-flip__calendar-footer">
                <button
                  type="button"
                  className="schedule-flip__gigs-flip-btn"
                  onClick={() => setListFace(true)}
                  aria-expanded={listFace}
                >
                  <span className="schedule-flip__gigs-flip-btn-label">{listFlipLabel}</span>
                  {upcoming.length > 0 ? (
                    <span className="schedule-flip__gigs-flip-btn-count">{upcoming.length}</span>
                  ) : null}
                  <span className="schedule-flip__gigs-flip-btn-hint" aria-hidden>
                    View list →
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div
            className="schedule-flip__face schedule-flip__face--back schedule-flip__retro32 calendar__panel calendar__panel--book work-ui__calendar-card"
            aria-hidden={!listFace}
          >
            <div className="schedule-flip__back-top">
              <button
                type="button"
                className="btn btn--ghost schedule-flip__back-btn"
                onClick={() => setListFace(false)}
              >
                <span className="schedule-flip__back-btn-arrow" aria-hidden>
                  ←
                </span>
                <span className="schedule-flip__back-btn-label">Calendar</span>
              </button>
              <h2 className="schedule-flip__back-heading">{listTitle}</h2>
            </div>
            <div className="schedule-flip__list-scroll">
              {upcoming.length === 0 ? (
                <p className="muted schedule-flip__list-empty">{listEmptyMessage}</p>
              ) : (
                <ul className="schedule-accepted-gigs__list schedule-accepted-gigs__list--flip">
                  {upcoming.map((b) => {
                    const status = gigResponseStatus(b)
                    return (
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
                          <div className="schedule-gig-row__head">
                            <strong>{b.familyName}</strong>
                            <span className={`schedule-gig-status schedule-gig-status--${status}`}>
                              {gigStatusLabel(status)}
                            </span>
                          </div>
                          <span className="muted">{b.contact}</span>
                          {formatCareBookingWindow(b) || formatBookingChildrenLabel(b) ? (
                            <span className="book-upcoming__meta muted">
                              {[formatCareBookingWindow(b), formatBookingChildrenLabel(b)]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          ) : null}
                          {b.notes ? <p className="book-upcoming__notes">{b.notes}</p> : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
