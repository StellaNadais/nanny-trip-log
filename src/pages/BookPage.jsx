import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { getBookFamily } from '../data/bookFamilies'
import { OVERNIGHT_RATE } from '../data/bookingRates'
import { toISODateLocal } from '../utils/dates'
import { monthGrid, isSameDay } from '../utils/calendarMonth'
import { useBookings } from '../hooks/useBookings'
import { useParentReminders } from '../hooks/useParentReminders'
import BookFamilyGate from '../components/BookFamilyGate'
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
import { isBookFamilyUnlocked } from '../utils/bookFamilyAccess'

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

function bookingBelongsToFamily(booking, family) {
  if (!family) return false
  const name = String(booking?.familyName || '').toLowerCase()
  return (
    name.includes(family.lastName.toLowerCase()) ||
    name.includes(family.nickname.toLowerCase()) ||
    booking?.familySlug === family.slug
  )
}

function cellBookingMod(bookings) {
  if (bookings.some((b) => b.responseStatus === 'accepted')) return 'accepted'
  if (bookings.every((b) => b.responseStatus === 'declined')) return 'declined'
  return 'pending'
}

function cellBookingLabel(bookings, family) {
  if (family) {
    const mine = bookings.filter((b) => bookingBelongsToFamily(b, family))
    if (mine.length === 0) return 'Busy'
    if (mine.length > 1) return `${family.nickname.slice(0, 5)}+`
    return family.nickname.length > 7 ? `${family.nickname.slice(0, 6)}…` : family.nickname
  }
  const accepted = bookings.find((b) => b.responseStatus === 'accepted')
  const active = accepted || bookings.find((b) => b.responseStatus !== 'declined') || bookings[0]
  const raw = (active?.familyName || 'Gig').trim()
  const first = raw.split(/\s+/)[0] || 'Gig'
  if (bookings.length > 1) return `${first}+`
  return first.length > 7 ? `${first.slice(0, 6)}…` : first
}

/**
 * Parent-only booking page for one family: /book/:family
 */
export default function BookPage() {
  const { family: familySlug } = useParams()
  const family = useMemo(() => getBookFamily(familySlug), [familySlug])
  const [unlocked, setUnlocked] = useState(() =>
    familySlug ? isBookFamilyUnlocked(familySlug) : false
  )

  useEffect(() => {
    setUnlocked(familySlug ? isBookFamilyUnlocked(familySlug) : false)
  }, [familySlug])

  const { bookings, addBooking } = useBookings()
  const { addRemindersForBooking } = useParentReminders()
  const today = new Date()
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [activeTab, setActiveTab] = useState('calendar')
  const [schedulingOpen, setSchedulingOpen] = useState(false)
  const [awaitingEndDate, setAwaitingEndDate] = useState(false)
  const [hoverDateISO, setHoverDateISO] = useState(null)
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

  const overnightRate = family?.overnightRate ?? OVERNIGHT_RATE

  useEffect(() => {
    if (family) setFamilyName(family.lastName)
  }, [family])

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
      .filter(
        (b) =>
          b.dateISO &&
          bookingOccupiesCalendarSlot(b) &&
          bookingEndMs(b) >= now &&
          (!family || bookingBelongsToFamily(b, family))
      )
      .sort((a, b) => {
        const a0 = new Date(`${a.dateISO}T${a.careStart || '00:00'}:00`).getTime()
        const b0 = new Date(`${b.dateISO}T${b.careStart || '00:00'}:00`).getTime()
        if (a0 !== b0) return a0 - b0
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
      })
  }, [bookings, family])

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
      nights > 0 ? ` · ${nights} overnight${nights === 1 ? '' : 's'} × $${overnightRate}` : ''
    if (diff === 1) return `Overnight gig · spans 2 days on the calendar${rateLine}`
    return `${diff + 1} calendar days · ${diff} overnight${diff === 1 ? '' : 's'}${rateLine}`
  }, [careStartDateISO, resolvedEndDateISO, overnightRate])

  const overnightNights = useMemo(() => {
    if (!careStartDateISO) return 0
    return bookingOvernightNightCount({
      dateISO: careStartDateISO,
      careEndDateISO: resolvedEndDateISO,
    })
  }, [careStartDateISO, resolvedEndDateISO])

  const overnightTotal = overnightNights * overnightRate

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
    setFamilyName(family?.lastName || '')
    setPhone('')
    setRequestNotes('')
    setSchedulingOpen(false)
    setAwaitingEndDate(false)
    setHoverDateISO(null)
  }

  function clearScheduling() {
    resetBookingForm()
  }

  function handleCalendarDateSelect(iso) {
    if (iso < todayISO()) return

    if (!schedulingOpen || !awaitingEndDate) {
      setCareStartDateISO(iso)
      setCareEndDateISO(iso)
      setHoverDateISO(null)
      setSchedulingOpen(true)
      setAwaitingEndDate(true)
      return
    }

    if (iso < careStartDateISO) {
      setCareStartDateISO(iso)
      setCareEndDateISO(iso)
      setHoverDateISO(null)
      setAwaitingEndDate(true)
      return
    }

    setCareEndDateISO(iso)
    setHoverDateISO(null)
    setAwaitingEndDate(false)
  }

  function handleCalendarDateHover(iso) {
    if (!awaitingEndDate) {
      setHoverDateISO(null)
      return
    }
    setHoverDateISO(iso)
  }

  const selectionHint = useMemo(() => {
    if (!schedulingOpen) {
      return 'Tap your start day on the calendar, then the last day of care.'
    }
    if (awaitingEndDate) {
      return 'Next, tap the last day of care. For overnight, choose a later day; for same-day only, tap this start day again.'
    }
    return 'Finish times and contact details in the popup.'
  }, [schedulingOpen, awaitingEndDate])

  const dateSelectionRole = useMemo(() => {
    if (!schedulingOpen || !careStartDateISO) return () => null

    const previewEnd =
      awaitingEndDate && hoverDateISO ? hoverDateISO : careEndDateISO || careStartDateISO
    const start = careStartDateISO <= previewEnd ? careStartDateISO : previewEnd
    const end = careStartDateISO <= previewEnd ? previewEnd : careStartDateISO

    return (iso) => calendarSelectionRole(iso, start, end)
  }, [schedulingOpen, awaitingEndDate, careStartDateISO, careEndDateISO, hoverDateISO])

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
      familySlug: family?.slug,
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

  if (!family) {
    return <Navigate to="/book" replace />
  }

  if (!unlocked) {
    return <BookFamilyGate family={family} onUnlocked={() => setUnlocked(true)} />
  }

  return (
    <div className="page page--calendar page--book page--book-portal page--schedule page--parents-only schedule-dashboard page--workspace work-ui">
      <div className="book-portal__shell">
        <header className="book-portal__head book-workspace-head">
          <p className="book-parents-banner" role="note">
            {family.nickname} · parent portal
          </p>
          <p className="book-workspace-head__eyebrow">Availability request</p>
          <h1 id="book-page-heading" className="sr-only">
            Book a gig — {family.nickname}
          </h1>
          {family.availabilityNote ? (
            <p className="book-family-availability muted">{family.availabilityNote}</p>
          ) : null}
          <p className="book-workspace-head__sub muted" role="status" aria-live="polite">
            {selectionHint}
          </p>
          <Link to="/book" className="book-family-switch">
            Switch family
          </Link>
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
                  cellBookingLabel={(dayBookings) => cellBookingLabel(dayBookings, family)}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                  onDateSelect={handleCalendarDateSelect}
                  onDateHover={handleCalendarDateHover}
                  dateSelectionRole={dateSelectionRole}
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
                  Sample outing ideas near Cedar Grove & Bayfront — confirm times with each place. Your caregiver also
                  has a full list in Tools → Events.
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
        overnightRate={overnightRate}
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
        familyNameLocked
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
