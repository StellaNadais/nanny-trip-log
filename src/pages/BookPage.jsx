import { useMemo, useState } from 'react'
import { OVERNIGHT_RATE } from '../data/bookingRates'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { useParentReminders } from '../hooks/useParentReminders'
import BookFollowUpModal from '../components/BookFollowUpModal'
import BookSchedulingDock from '../components/BookSchedulingDock'
import ScheduleCalendarFlip from '../components/ScheduleCalendarFlip'
import BookTabBar from '../components/BookTabBar'
import BookThanksPanel from '../components/BookThanksPanel'
import BookTasksPanel from '../components/BookTasksPanel'
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
  const [awaitingEndDate, setAwaitingEndDate] = useState(false)
  const [hoverEndDateISO, setHoverEndDateISO] = useState('')
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
    setAwaitingEndDate(false)
    setHoverEndDateISO('')
  }

  function clearScheduling() {
    resetBookingForm()
  }

  function changeDatesOnCalendar() {
    setHoverEndDateISO('')
    setAwaitingEndDate(true)
  }

  function handleCalendarDateSelect(iso) {
    if (iso < todayISO()) return
    setHoverEndDateISO('')

    if (careStartDateISO && !awaitingEndDate) {
      setCareStartDateISO(iso)
      setCareEndDateISO(iso)
      setAwaitingEndDate(true)
      return
    }

    if (!careStartDateISO || !awaitingEndDate) {
      setCareStartDateISO(iso)
      setCareEndDateISO(iso)
      setAwaitingEndDate(true)
      return
    }

    if (iso < careStartDateISO) {
      setCareStartDateISO(iso)
      setCareEndDateISO(iso)
      return
    }

    setCareEndDateISO(iso)
    setAwaitingEndDate(false)
  }

  function handleCalendarDateHover(iso) {
    if (!awaitingEndDate || !careStartDateISO) {
      setHoverEndDateISO('')
      return
    }
    if (!iso || iso < todayISO()) {
      setHoverEndDateISO('')
      return
    }
    setHoverEndDateISO(iso)
  }

  function clearCalendarDateHover() {
    setHoverEndDateISO('')
  }

  function prevMonth() {
    setHoverEndDateISO('')
    setCursor(new Date(y, m - 1, 1))
  }

  function nextMonth() {
    setHoverEndDateISO('')
    setCursor(new Date(y, m + 1, 1))
  }

  const showBookingForm = Boolean(careStartDateISO) && !awaitingEndDate

  const selectionHint = useMemo(() => {
    if (!careStartDateISO) {
      return 'Tap check-in, then check-out — tap the same date if no overnight'
    }
    if (awaitingEndDate) {
      return 'No overnight? Tap the same date again. Otherwise tap your check-out day'
    }
    return 'Your dates are set — finish your request in the popup'
  }, [careStartDateISO, awaitingEndDate])

  const dateSelectionRole = useMemo(() => {
    // While picking check-out, preview start → hovered end (incl. same day).
    // Dates before check-in stay unfilled; CSS :hover still marks the cell.
    const previewEnd =
      awaitingEndDate && hoverEndDateISO && hoverEndDateISO >= careStartDateISO
        ? hoverEndDateISO
        : awaitingEndDate
          ? ''
          : careEndDateISO
    return (iso) =>
      careStartDateISO ? calendarSelectionRole(iso, careStartDateISO, previewEnd) : null
  }, [careStartDateISO, careEndDateISO, awaitingEndDate, hoverEndDateISO])

  const rangeHoverActive = Boolean(
    awaitingEndDate && hoverEndDateISO && hoverEndDateISO >= careStartDateISO
  )

  const checkInLabel = useMemo(() => {
    if (!careStartDateISO) return ''
    return new Date(`${careStartDateISO}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }, [careStartDateISO])

  function showBookToast(message) {
    setBookToast(message)
    window.setTimeout(() => setBookToast(''), 5000)
  }

  function submitBooking(e) {
    e.preventDefault()
    if (!careStartDateISO || awaitingEndDate || careStartIsPast) return
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
        ? 'Request sent with lists and notes!'
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
            Tap check-in, then check-out. Same date if no overnight.
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

              <div className="book-calendar-booking">
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
                    onDateHover={awaitingEndDate ? handleCalendarDateHover : undefined}
                    onDateHoverEnd={awaitingEndDate ? clearCalendarDateHover : undefined}
                    dateSelectionRole={dateSelectionRole}
                    rangeHoverActive={rangeHoverActive}
                    selectionHint={selectionHint}
                    showSelectionLegend
                    listTitle="Your requests"
                    listFlipLabel="Your requests"
                    listEmptyMessage="No requests on file yet. Tap dates on the calendar to schedule."
                  />
                </section>

                {careStartDateISO && awaitingEndDate ? (
                  <div className="book-calendar-selection-bar" role="status">
                    <div className="book-calendar-selection-bar__copy">
                      <p className="book-calendar-selection-bar__text">
                        <strong>Check-in:</strong> {checkInLabel}
                      </p>
                      <p className="book-calendar-selection-bar__hint muted">
                        No overnight? Tap the same date again.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost btn--small book-calendar-selection-bar__cancel"
                      onClick={clearScheduling}
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}

              </div>
            </div>
          ) : null}

          {activeTab === 'tasks' ? (
            <div className="book-portal__panel" role="tabpanel" aria-labelledby="book-tab-tasks">
              <BookTasksPanel />
            </div>
          ) : null}

          {activeTab === 'thanks' ? (
            <div className="book-portal__panel" role="tabpanel" aria-labelledby="book-tab-thanks">
              <BookThanksPanel />
            </div>
          ) : null}
        </main>
      </div>

      <BookSchedulingDock
        open={showBookingForm}
        onClose={clearScheduling}
        onChangeDates={changeDatesOnCalendar}
        careDateHeadline={careDateHeadline}
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
