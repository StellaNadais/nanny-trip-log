import { useEffect, useMemo, useState } from 'react'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { bookingOccupiesCalendarSlot } from '../utils/bookingCalendar'
import { expandBookingCalendarDates, formatCareBookingWindow, bookingEndMs } from '../utils/bookingRange'
import { formatBookingChildrenLabel } from '../utils/bookingChildren'
import ScheduleCalendarFlip from '../components/ScheduleCalendarFlip'
import ScheduleFunModal from '../components/ScheduleFunModal'
import ScheduleOverviewModal from '../components/ScheduleOverviewModal'
import TodayPanelModal from '../components/TodayPanelModal'
import TodaySpaceTile from '../components/TodaySpaceTile'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'
import BringAlongGrid from '../components/BringAlongGrid'
import { upcomingCelebrationsInMonth } from '../utils/scheduleCelebrations'

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

function cellBookingMod(bookings) {
  if (bookings.some((b) => b.responseStatus === 'accepted')) return 'accepted'
  if (bookings.every((b) => b.responseStatus === 'declined')) return 'declined'
  return 'pending'
}

function cellBookingLabel(bookings) {
  const accepted = bookings.find((b) => b.responseStatus === 'accepted')
  const active = accepted || bookings.find((b) => b.responseStatus !== 'declined') || bookings[0]
  const raw = (active?.familyName || 'Gig').trim()
  const first = raw.split(/\s+/)[0] || 'Gig'
  if (bookings.length > 1) return `${first}+`
  return first.length > 7 ? `${first.slice(0, 6)}…` : first
}

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
        const aPending = gigResponseStatus(a) === 'pending'
        const bPending = gigResponseStatus(b) === 'pending'
        if (aPending !== bPending) return aPending ? -1 : 1
        const a0 = new Date(`${a.dateISO}T${a.careStart || '00:00'}:00`).getTime()
        const b0 = new Date(`${b.dateISO}T${b.careStart || '00:00'}:00`).getTime()
        if (a0 !== b0) return a0 - b0
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
      })
  }, [bookings])

  const pendingUpcoming = useMemo(
    () => upcoming.filter((booking) => gigResponseStatus(booking) === 'pending'),
    [upcoming]
  )

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
  const [openPanel, setOpenPanel] = useState(null)
  const [bringAlongIds, setBringAlongIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nanny-bring-along-v1')) ?? []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('nanny-bring-along-v1', JSON.stringify(bringAlongIds))
  }, [bringAlongIds])

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

  useEffect(() => {
    setOpenPanel(null)
  }, [y, m])

  function openSchedulePanel(panel) {
    setOpenPanel(panel)
  }

  function closeSchedulePanel() {
    setOpenPanel(null)
  }

  function toggleBringAlong(toyId) {
    setBringAlongIds((current) =>
      current.includes(toyId) ? current.filter((id) => id !== toyId) : [...current, toyId]
    )
  }

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

  function prevMonth() {
    setCursor(new Date(y, m - 1, 1))
  }

  function nextMonth() {
    setCursor(new Date(y, m + 1, 1))
  }

  const overviewPreview = [
    `${pendingUpcoming.length} new request${pendingUpcoming.length === 1 ? '' : 's'}`,
    `${acceptedUpcoming.length} confirmed`,
    currentGig?.familyName,
  ]
    .filter(Boolean)
    .join(' · ')

  const funPreview = useMemo(() => {
    const list = upcomingCelebrationsInMonth(y, m, todayISO())
    if (!list.length) return ''
    return list
      .slice(0, 2)
      .map((c) => c.title)
      .join(', ')
  }, [y, m])

  const funCount = useMemo(
    () => upcomingCelebrationsInMonth(y, m, todayISO()).length,
    [y, m]
  )

  const requestsPanel = (
    <section
      className="schedule-overview__requests"
      aria-labelledby="schedule-requested-dates-title"
    >
      <h2 id="schedule-requested-dates-title" className="schedule-overview__requests-title">
        Requests
      </h2>
      {upcoming.length === 0 ? (
        <p className="schedule-overview__requests-empty muted">
          No requested dates yet. Share your parent booking link when you’re ready.
        </p>
      ) : (
        <div className="schedule-upcoming-carousel">
          <div className="schedule-upcoming-carousel__window">
            {currentGig ? (
              <div
                className={`schedule-upcoming-card book-upcoming__row ${enterAnim === 'next' ? 'schedule-upcoming-card--enter-next' : ''} ${enterAnim === 'prev' ? 'schedule-upcoming-card--enter-prev' : ''}`}
                key={currentGig.id}
              >
                <div className="schedule-upcoming-card__date-nav" aria-label="Browse requested dates">
                  <button
                    type="button"
                    className="btn btn--ghost schedule-upcoming-card__date-arrow"
                    onClick={goPrevGig}
                    disabled={upcoming.length <= 1}
                    aria-label="Previous request"
                  >
                    ‹
                  </button>
                  <time className="book-upcoming__date" dateTime={currentGig.dateISO}>
                    {new Date(currentGig.dateISO + 'T12:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <button
                    type="button"
                    className="btn btn--ghost schedule-upcoming-card__date-arrow"
                    onClick={goNextGig}
                    disabled={upcoming.length <= 1}
                    aria-label="Next request"
                  >
                    ›
                  </button>
                  <span className="schedule-upcoming-card__date-count muted">
                    {carouselIndex + 1} / {upcoming.length}
                  </span>
                </div>
                <div className="book-upcoming__body">
                  <strong>{currentGig.familyName}</strong>
                  <span className="muted">{currentGig.contact}</span>
                  {formatCareBookingWindow(currentGig) || formatBookingChildrenLabel(currentGig) ? (
                    <span className="book-upcoming__meta muted">
                      {[formatCareBookingWindow(currentGig), formatBookingChildrenLabel(currentGig)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  ) : null}
                  {currentGig.notes ? <p className="book-upcoming__notes">{currentGig.notes}</p> : null}
                  {currentGig.extras?.length ? (
                    <ul className="book-upcoming__meta muted" aria-label="Added for this gig">
                      {currentGig.extras.map((extra) => (
                        <li key={extra.id}>
                          {extra.kind}: {extra.text}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {currentGig.bringAlong?.length ? (
                    <p className="schedule-upcoming-card__bring-along">
                      <span>Family is bringing</span>
                      {currentGig.bringAlong.join(' · ')}
                    </p>
                  ) : null}

                  <div className="schedule-upcoming-card__actions">
                    {gigStatus === 'pending' ? (
                      <>
                        <p className="schedule-upcoming-card__status schedule-upcoming-card__status--pending">
                          New request
                        </p>
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
            ) : null}
          </div>
        </div>
      )}
    </section>
  )

  return (
    <div className="page page--schedule schedule-dashboard page--kid-journal page--workspace work-ui">
      <div className="journal__layout schedule__layout">
        <section className="schedule__calendar-panel work-ui__panel" aria-label="Gig calendar">
          <ScheduleCalendarFlip
            embedded
            title={title}
            cells={cells}
            y={y}
            m={m}
            today={today}
            calendarRowCount={calendarRowCount}
            bookingsByDate={bookingsByDate}
            upcoming={upcoming}
            dateISOFromParts={dateISOFromParts}
            todayISO={todayISO}
            isSameDay={isSameDay}
            cellBookingMod={cellBookingMod}
            cellBookingLabel={cellBookingLabel}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </section>

        <WorkspaceTileBoard
          workspaceId="schedule"
          tiles={[
            {
              id: 'overview',
              label: 'Overview',
              square: true,
              children: (
                <TodaySpaceTile
                  count={upcoming.length}
                  preview={overviewPreview}
                  hint={
                    pendingUpcoming.length
                      ? 'New requests are ready to review — tap to open.'
                      : 'Queue and requests — tap to open.'
                  }
                  onClick={() => openSchedulePanel('overview')}
                />
              ),
            },
            {
              id: 'fun',
              label: 'Do fun',
              square: true,
              children: (
                <TodaySpaceTile
                  count={funCount}
                  preview={funPreview}
                  hint="Celebrations this month — tap to open."
                  onClick={() => openSchedulePanel('fun')}
                />
              ),
            },
            {
              id: 'bring-along',
              label: 'Bring with me',
              square: true,
              children: (
                <TodaySpaceTile
                  count={bringAlongIds.length}
                  preview={bringAlongIds.length ? 'Toys packed for your next gig' : 'Pick toys for your next gig'}
                  hint="Your play kit — tap to browse."
                  onClick={() => openSchedulePanel('bring-along')}
                />
              ),
            },
          ]}
        />
      </div>

      <ScheduleOverviewModal
        open={openPanel === 'overview'}
        onClose={closeSchedulePanel}
        monthLabel={title}
        queueCount={upcoming.length}
        confirmedCount={acceptedUpcoming.length}
      >
        {requestsPanel}
      </ScheduleOverviewModal>

      <ScheduleFunModal
        open={openPanel === 'fun'}
        onClose={closeSchedulePanel}
        year={y}
        monthIndex={m}
      />

      <TodayPanelModal
        open={openPanel === 'bring-along'}
        onClose={closeSchedulePanel}
        eyebrow="Play kit"
        title="Bring with me"
        dateLabel="Choose a few favorites to pack."
        sheetClassName="bring-along-modal"
      >
        <BringAlongGrid
          heading="Bring with me"
          description="A small, ready-to-go toy shelf for the next gig."
          selectedIds={bringAlongIds}
          onToggle={toggleBringAlong}
        />
      </TodayPanelModal>
    </div>
  )
}
