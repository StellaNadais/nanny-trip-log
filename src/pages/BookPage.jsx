import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { OVERNIGHT_RATE } from '../data/bookingRates'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { useParentReminders } from '../hooks/useParentReminders'
import BookFollowUpModal from '../components/BookFollowUpModal'
import BookSchedulingDock from '../components/BookSchedulingDock'
import ScheduleCalendarFlip from '../components/ScheduleCalendarFlip'
import BookTabBar from '../components/BookTabBar'
import { bookingOccupiesCalendarSlot } from '../utils/bookingCalendar'
import {
  bookingEndMs,
  bookingOvernightNightCount,
  calendarSelectionRole,
  careIntervalValid,
  expandBookingCalendarDates,
  suggestCareEndDateISO,
} from '../utils/bookingRange'
import { parseChildrenOnGig } from '../utils/bookingChildren'
import { BOOK_THANKS_LEDE, BOOK_THANKS_SUPPORTERS } from '../data/bookThanks'

function todayISO() {
  return toISODateLocal(new Date())
}

function dateISOFromParts(y, m, dayNum) {
  return toISODateLocal(new Date(y, m, dayNum))
}

const DEFAULT_CARE_START = '09:00'
const DEFAULT_CARE_END = '17:00'

function phoneLooksReachable(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7
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

/**
 * Parent-only booking page. Share /book as a direct link — not part of the caregiver app flow.
 */
export default function BookPage() {
  const { bookings, addBooking } = useBookings()
  const { addRemindersForBooking } = useParentReminders()
  const today = new Date()
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [activeTab, setActiveTab] = useState('calendar')
  const [schedulingOpen, setSchedulingOpen] = useState(false)
  const [awaitingEndDate, setAwaitingEndDate] = useState(false)
  const [careStart, setCareStart] = useState(DEFAULT_CARE_START)
  const [careEnd, setCareEnd] = useState(DEFAULT_CARE_END)
  const [careStartDateISO, setCareStartDateISO] = useState('')
  const [careEndDateISO, setCareEndDateISO] = useState('')
  const [childrenOnGig, setChildrenOnGig] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [phone, setPhone] = useState('')
  const [requestNotes, setRequestNotes] = useState('')
  const [followUpBooking, setFollowUpBooking] = useState(null)
  const [bookToast, setBookToast] = useState('')

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
      .filter((b) => b.dateISO && bookingOccupiesCalendarSlot(b) && bookingEndMs(b) >= now)
      .sort((a, b) => {
        const a0 = new Date(`${a.dateISO}T${a.careStart || '00:00'}:00`).getTime()
        const b0 = new Date(`${b.dateISO}T${b.careStart || '00:00'}:00`).getTime()
        if (a0 !== b0) return a0 - b0
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
      })
  }, [bookings])

  const eventsByLocation = useMemo(() => groupFamilyEventsByLocation(), [])

  const title = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const selectedBookings = careStartDateISO ? (bookingsByDate[careStartDateISO] ?? []) : []
  const careStartIsPast = Boolean(careStartDateISO) && careStartDateISO < todayISO()

  const resolvedEndDateISO = useMemo(() => {
    if (!careStartDateISO) return ''
    return suggestCareEndDateISO(careStartDateISO, careStart, careEndDateISO || careStartDateISO, careEnd)
  }, [careStartDateISO, careStart, careEndDateISO, careEnd])

  const careDateHeadline = useMemo(() => {
    if (!careStartDateISO) return 'Select dates on the calendar'
    const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    const a = new Date(`${careStartDateISO}T12:00:00`).toLocaleDateString(undefined, opts)
    const b = new Date(`${resolvedEndDateISO}T12:00:00`).toLocaleDateString(undefined, opts)
    if (careStartDateISO === resolvedEndDateISO) return a
    return `${a} → ${b}`
  }, [careStartDateISO, resolvedEndDateISO])

  const careSpanSummary = useMemo(() => {
    if (!careStartDateISO || !resolvedEndDateISO) return null
    const d0 = new Date(`${careStartDateISO}T12:00:00`)
    const d1 = new Date(`${resolvedEndDateISO}T12:00:00`)
    const diff = Math.round((d1 - d0) / 86400000)
    if (diff === 0) return null
    const nights = bookingOvernightNightCount({
      dateISO: careStartDateISO,
      careEndDateISO: resolvedEndDateISO,
    })
    const rateLine =
      nights > 0 ? ` · ${nights} overnight${nights === 1 ? '' : 's'} × $${OVERNIGHT_RATE}` : ''
    if (diff === 1) return `Overnight gig · spans 2 days on the calendar${rateLine}`
    return `${diff + 1} calendar days · ${diff} overnight${diff === 1 ? '' : 's'}${rateLine}`
  }, [careStartDateISO, resolvedEndDateISO])

  const overnightNights = useMemo(() => {
    if (!careStartDateISO) return 0
    return bookingOvernightNightCount({
      dateISO: careStartDateISO,
      careEndDateISO: resolvedEndDateISO,
    })
  }, [careStartDateISO, resolvedEndDateISO])

  const overnightTotal = overnightNights * OVERNIGHT_RATE

  const timeOk = useMemo(
    () => careIntervalValid(careStartDateISO, careStart, resolvedEndDateISO, careEnd),
    [careStartDateISO, careStart, resolvedEndDateISO, careEnd]
  )
  const childrenParsed = useMemo(() => parseChildrenOnGig(childrenOnGig), [childrenOnGig])
  const kidsOk = childrenParsed.valid
  const nameOk = familyName.trim().length > 0
  const phoneOk = phoneLooksReachable(phone)

  function applyCareEndTime(nextEndHM) {
    setCareEnd(nextEndHM)
    setCareEndDateISO((prev) =>
      suggestCareEndDateISO(careStartDateISO, careStart, prev, nextEndHM)
    )
  }

  function applyCareStartTime(nextStartHM) {
    setCareStart(nextStartHM)
    setCareEndDateISO((prev) =>
      suggestCareEndDateISO(careStartDateISO, nextStartHM, prev, careEnd)
    )
  }

  function resetBookingForm() {
    setCareStart(DEFAULT_CARE_START)
    setCareEnd(DEFAULT_CARE_END)
    setCareStartDateISO('')
    setCareEndDateISO('')
    setChildrenOnGig('')
    setFamilyName('')
    setPhone('')
    setRequestNotes('')
    setSchedulingOpen(false)
    setAwaitingEndDate(false)
  }

  function clearScheduling() {
    resetBookingForm()
  }

  function handleCalendarDateSelect(iso) {
    if (iso < todayISO()) return

    if (!schedulingOpen || !awaitingEndDate) {
      setCareStartDateISO(iso)
      setCareEndDateISO(iso)
      setSchedulingOpen(true)
      setAwaitingEndDate(true)
      return
    }

    if (iso < careStartDateISO) {
      setCareStartDateISO(iso)
      setCareEndDateISO(iso)
      setAwaitingEndDate(true)
      return
    }

    setCareEndDateISO(iso)
    setAwaitingEndDate(false)
  }

  const selectionHint = useMemo(() => {
    if (!schedulingOpen) return 'Tap your start day on the calendar'
    if (awaitingEndDate) return 'Tap your end day on the calendar'
    return 'Complete your booking in the popup'
  }, [schedulingOpen, awaitingEndDate])

  const dateSelectionRole = useMemo(
    () => (iso) =>
      schedulingOpen
        ? calendarSelectionRole(iso, careStartDateISO, careEndDateISO)
        : null,
    [schedulingOpen, careStartDateISO, careEndDateISO]
  )

  function showBookToast(message) {
    setBookToast(message)
    window.setTimeout(() => setBookToast(''), 5000)
  }

  function prevMonth() {
    setCursor(new Date(y, m - 1, 1))
  }

  function nextMonth() {
    setCursor(new Date(y, m + 1, 1))
  }

  function submitBooking(e) {
    e.preventDefault()
    if (!schedulingOpen || careStartIsPast) return
    if (!timeOk || !kidsOk || !nameOk || !phoneOk) return
    const start = careStartDateISO
    const endDate = resolvedEndDateISO
    const booking = addBooking({
      dateISO: start,
      careEndDateISO: endDate,
      familyName: familyName.trim(),
      contact: phone.trim(),
      kidCount: childrenParsed.kidCount,
      childrenNames: childrenParsed.childrenNames,
      careStart,
      careEnd,
      notes: requestNotes.trim(),
    })
    resetBookingForm()
    if (booking?.id) {
      setFollowUpBooking({
        id: booking.id,
        dateISO: start,
        careEndDateISO: endDate,
        familyName: familyName.trim(),
      })
    } else {
      showBookToast('Request sent! Your caregiver will follow up.')
    }
  }

  function closeFollowUp() {
    setFollowUpBooking(null)
    showBookToast('Request sent! Your caregiver will follow up.')
  }

  function saveFollowUp(reminderRows) {
    if (followUpBooking?.id && reminderRows.length) {
      addRemindersForBooking(followUpBooking.id, reminderRows)
    }
    setFollowUpBooking(null)
    const hasExtras = reminderRows.length > 0
    showBookToast(
      hasExtras
        ? 'Request sent with grocery and reminders!'
        : 'Request sent! Your caregiver will follow up.'
    )
  }

  return (
    <div className="page page--calendar page--book page--book-portal page--schedule page--parents-only schedule-dashboard page--workspace work-ui">
      <div className="book-portal__shell">
        <header className="book-portal__head book-workspace-head">
          <p className="book-parents-banner" role="note">
            Parent & family portal · this link is not the caregiver app
          </p>
          <p className="book-workspace-head__eyebrow">Availability request</p>
          <h1 id="book-page-heading" className="sr-only">
            Book a gig
          </h1>
          <p className="book-workspace-head__sub muted">
            Tap your start day, then end day on the calendar — same view your caregiver uses.
          </p>
        </header>

        <BookTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="book-portal__canvas">
          {activeTab === 'calendar' ? (
            <div className="book-portal__panel" role="tabpanel" aria-labelledby="book-tab-calendar">
              {bookToast ? (
                <p className="book-toast" role="status">
                  {bookToast}
                </p>
              ) : null}

              <section className="schedule__calendar-panel work-ui__panel" aria-label="Booking calendar">
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
                  onDateSelect={handleCalendarDateSelect}
                  dateSelectionRole={dateSelectionRole}
                  selectionHint={selectionHint}
                  showSelectionLegend
                  listTitle="Your requests"
                  listFlipLabel="Your requests"
                  listEmptyMessage="No requests on file yet. Tap dates on the calendar to schedule."
                />
              </section>
            </div>
          ) : null}

          {activeTab === 'events' ? (
            <div className="book-portal__panel" role="tabpanel" aria-labelledby="book-tab-events">
              <section className="book-events__panel">
                <h2 className="book-events__summary-title">Local events</h2>
                <p className="muted book-events__lede">
                  Ideas near Moraga & Oakland — confirm times with each place. Your caregiver also has a full list in
                  Tools → Events.
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
              </section>
            </div>
          ) : null}

          {activeTab === 'thanks' ? (
            <div className="book-portal__panel" role="tabpanel" aria-labelledby="book-tab-thanks">
              <section className="book-thanks" aria-labelledby="book-thanks-heading">
                <h2 id="book-thanks-heading" className="book-thanks__title">
                  Thank you
                </h2>
                <p className="book-thanks__lede">{BOOK_THANKS_LEDE}</p>
                <ul className="book-thanks__list">
                  {BOOK_THANKS_SUPPORTERS.map((person) => (
                    <li key={person.name} className="book-thanks__item">
                      <strong className="book-thanks__name">{person.name}</strong>
                      <span className="book-thanks__note">{person.note}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : null}
        </main>
      </div>

      <BookSchedulingDock
        open={schedulingOpen && !awaitingEndDate}
        onClose={clearScheduling}
        careDateHeadline={careDateHeadline}
        careSpanSummary={careSpanSummary}
        overnightNights={overnightNights}
        overnightTotal={overnightTotal}
        careStart={careStart}
        careEnd={careEnd}
        onCareStartTime={applyCareStartTime}
        onCareEndTime={applyCareEndTime}
        timeOk={timeOk}
        childrenOnGig={childrenOnGig}
        familyName={familyName}
        phone={phone}
        phoneOk={phoneOk}
        requestNotes={requestNotes}
        onChildrenOnGig={setChildrenOnGig}
        onFamilyName={setFamilyName}
        onPhone={setPhone}
        onRequestNotes={setRequestNotes}
        selectedBookingsCount={selectedBookings.length}
        careStartIsPast={careStartIsPast}
        canSubmit={!careStartIsPast && timeOk && kidsOk && nameOk && phoneOk}
        onSubmit={submitBooking}
        onClear={clearScheduling}
      />

      <BookFollowUpModal
        open={Boolean(followUpBooking)}
        booking={followUpBooking}
        onClose={closeFollowUp}
        onDone={saveFollowUp}
      />
    </div>
  )
}
