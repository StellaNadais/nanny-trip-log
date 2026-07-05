import { useEffect, useMemo, useState } from 'react'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { bookingOccupiesCalendarSlot } from '../utils/bookingCalendar'
import { expandBookingCalendarDates, bookingEndMs } from '../utils/bookingRange'
import { upcomingCelebrationsInMonth } from '../utils/scheduleCelebrations'
import { CUSTOM_CELEBRATIONS_UPDATED_EVENT } from '../utils/customCelebrationsStorage'
import ScheduleCalendarFlip from '../components/ScheduleCalendarFlip'
import ScheduleFunModal from '../components/ScheduleFunModal'
import ScheduleFunListTile from '../components/ScheduleFunListTile'
import ScheduleOverviewModal from '../components/ScheduleOverviewModal'
import ScheduleOverviewListTile from '../components/ScheduleOverviewListTile'
import ScheduleOverviewRequestList from '../components/ScheduleOverviewRequestList'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

function todayISO() {
  return toISODateLocal(new Date())
}

function dateISOFromParts(y, m, dayNum) {
  return toISODateLocal(new Date(y, m, dayNum))
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

  const [openPanel, setOpenPanel] = useState(null)
  const [customFunRev, setCustomFunRev] = useState(0)

  useEffect(() => {
    const refresh = () => setCustomFunRev((r) => r + 1)
    window.addEventListener(CUSTOM_CELEBRATIONS_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CUSTOM_CELEBRATIONS_UPDATED_EVENT, refresh)
  }, [])

  useEffect(() => {
    setOpenPanel(null)
  }, [y, m])

  function openSchedulePanel(panel) {
    setOpenPanel(panel)
  }

  function closeSchedulePanel() {
    setOpenPanel(null)
  }

  function deleteGig(gig) {
    if (
      !window.confirm(
        'Delete this gig request? It will be removed from your calendar, the parent booking page, and upcoming gigs.'
      )
    ) {
      return
    }
    removeBooking(gig.id)
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

  const funCelebrations = useMemo(() => {
    void customFunRev
    return upcomingCelebrationsInMonth(y, m, todayISO())
  }, [y, m, customFunRev])

  const requestsPanel = (
    <ScheduleOverviewRequestList
      upcoming={upcoming}
      onAccept={(id) => patchBooking(id, { responseStatus: 'accepted' })}
      onDecline={(id) => patchBooking(id, { responseStatus: 'declined' })}
      onUndoDecline={(id) => patchBooking(id, { responseStatus: undefined })}
      onDelete={deleteGig}
    />
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
              span: 2,
              hideHead: true,
              children: (
                <ScheduleOverviewListTile
                  monthLabel={title}
                  queueCount={upcoming.length}
                  confirmedCount={acceptedUpcoming.length}
                  upcoming={upcoming}
                  onClick={() => openSchedulePanel('overview')}
                />
              ),
            },
            {
              id: 'fun',
              label: 'Do fun',
              span: 2,
              hideHead: true,
              children: (
                <ScheduleFunListTile
                  monthLabel={title}
                  celebrations={funCelebrations}
                  onClick={() => openSchedulePanel('fun')}
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
    </div>
  )
}
