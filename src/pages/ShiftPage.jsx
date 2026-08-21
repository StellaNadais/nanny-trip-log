import { useMemo, useState } from 'react'
import { DayStrip } from '../components/DayStrip'
import ShiftClockPicker from '../components/ShiftClockPicker'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { useBookings } from '../hooks/useBookings'
import {
  composeShiftLabel,
  defaultShiftParts,
  hmToShiftLabel,
  partsFromShiftLabel,
} from '../utils/shiftTimeWindow'
import { bookingCareTimesForDay, bookingsCoveringDate } from '../utils/bookingRange'
import ShiftContractSection from '../components/ShiftContractSection'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

function formatDayLabel(iso) {
  if (!iso) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function initialDayOffsetForWeek(mondayDate) {
  const monIso = toISODateLocal(mondayDate)
  const todayIso = toISODateLocal(new Date())
  const diff = Math.round(
    (new Date(todayIso + 'T12:00:00') - new Date(monIso + 'T12:00:00')) / 86400000
  )
  return Math.max(0, Math.min(6, diff))
}

function emptyClock(kind) {
  return { ...defaultShiftParts(kind), saved: '' }
}

function clockFromSavedOrRequested(savedLabel, requestedHM, kind) {
  if (savedLabel) {
    return { ...partsFromShiftLabel(savedLabel, kind), saved: savedLabel }
  }
  if (requestedHM) {
    return { ...partsFromShiftLabel(hmToShiftLabel(requestedHM), kind), saved: '' }
  }
  return emptyClock(kind)
}

function ShiftGigClock({
  gig,
  shiftDate,
  arrival,
  end,
  onArrival,
  onEnd,
  onLogArrival,
  onLogEnd,
}) {
  const times = bookingCareTimesForDay(gig, shiftDate)
  if (!times) return null

  const statusLabel =
    gig.responseStatus === 'accepted' ? 'Confirmed' : gig.responseStatus === 'declined' ? 'Declined' : 'Request'

  const arrivalLabel = composeShiftLabel(arrival.hour, arrival.minute, arrival.ap)
  const endLabel = composeShiftLabel(end.hour, end.minute, end.ap)

  return (
    <div className="shift__family-block">
      <div className="shift__family-head">
        <h3 className="shift__family-name">{times.familyName}</h3>
        <span className={`shift__family-status shift__family-status--${gig.responseStatus || 'pending'}`}>
          {statusLabel}
        </span>
      </div>

      {times.middleDay ? (
        <p className="shift__family-note muted">Overnight care — middle day (no clock times requested).</p>
      ) : (
        <>
          <ShiftClockPicker
            legend="Clock in"
            ariaGroupLabel={`Clock-in time for ${times.familyName}`}
            hour={arrival.hour}
            minute={arrival.minute}
            ap={arrival.ap}
            onChange={(parts) => onArrival(parts)}
            clockedLabel={arrival.saved}
            requestedLabel={times.arrivalHM ? hmToShiftLabel(times.arrivalHM) : ''}
            onClock={onLogArrival}
            clockButtonLabel={arrival.saved && arrival.saved !== arrivalLabel ? 'Update clock in' : 'Clock in'}
            clockKind="arrival"
          />
          <ShiftClockPicker
            legend="Clock out"
            ariaGroupLabel={`Clock-out time for ${times.familyName}`}
            hour={end.hour}
            minute={end.minute}
            ap={end.ap}
            onChange={(parts) => onEnd(parts)}
            clockedLabel={end.saved}
            requestedLabel={times.endHM ? hmToShiftLabel(times.endHM) : ''}
            onClock={onLogEnd}
            clockButtonLabel={end.saved && end.saved !== endLabel ? 'Update clock out' : 'Clock out'}
            clockKind="end"
          />
        </>
      )}
    </div>
  )
}

function initGigPicks(shiftDate, dayGigs, entries) {
  const next = {}
  for (const gig of dayGigs) {
    const saved = entries.find((e) => e.dateISO === shiftDate && e.bookingId === gig.id)
    const times = bookingCareTimesForDay(gig, shiftDate)
    next[gig.id] = {
      arrival: clockFromSavedOrRequested(saved?.arrival, times?.arrivalHM, 'arrival'),
      end: clockFromSavedOrRequested(saved?.end, times?.endHM, 'end'),
    }
  }
  return next
}

function ShiftClockBoard({ shiftDate, dayGigs, entries, upsertShiftDay }) {
  const [gigPicks, setGigPicks] = useState(() => initGigPicks(shiftDate, dayGigs, entries))
  const [manualArrival, setManualArrival] = useState(() => {
    const saved = entries.find((e) => e.dateISO === shiftDate && !e.bookingId)
    return clockFromSavedOrRequested(saved?.arrival, '', 'arrival')
  })
  const [manualEnd, setManualEnd] = useState(() => {
    const saved = entries.find((e) => e.dateISO === shiftDate && !e.bookingId)
    return clockFromSavedOrRequested(saved?.end, '', 'end')
  })
  const [flash, setFlash] = useState('')

  function setGigPick(gigId, which, parts) {
    setGigPicks((prev) => ({
      ...prev,
      [gigId]: {
        ...prev[gigId],
        [which]: { ...prev[gigId]?.[which], ...parts },
      },
    }))
    setFlash('')
  }

  function logGigArrival(gigId, label) {
    if (!label) return
    upsertShiftDay({ dateISO: shiftDate, bookingId: gigId, arrival: label })
    setGigPicks((prev) => ({
      ...prev,
      [gigId]: { ...prev[gigId], arrival: { ...prev[gigId].arrival, saved: label } },
    }))
    setFlash('Clocked in.')
  }

  function logGigEnd(gigId, label) {
    if (!label) return
    upsertShiftDay({ dateISO: shiftDate, bookingId: gigId, end: label })
    setGigPicks((prev) => ({
      ...prev,
      [gigId]: { ...prev[gigId], end: { ...prev[gigId].end, saved: label } },
    }))
    setFlash('Clocked out.')
  }

  function logManualArrival(label) {
    if (!label) return
    upsertShiftDay({ dateISO: shiftDate, arrival: label })
    setManualArrival((prev) => ({ ...prev, saved: label }))
    setFlash('Clocked in.')
  }

  function logManualEnd(label) {
    if (!label) return
    upsertShiftDay({ dateISO: shiftDate, end: label })
    setManualEnd((prev) => ({ ...prev, saved: label }))
    setFlash('Clocked out.')
  }

  const manualArrivalLabel = composeShiftLabel(manualArrival.hour, manualArrival.minute, manualArrival.ap)
  const manualEndLabel = composeShiftLabel(manualEnd.hour, manualEnd.minute, manualEnd.ap)

  return (
    <section
      className="journal-mood-bar journal-panel journal-panel--shift-log shift__card shift__card--log"
      aria-label="Clock in and out"
    >
      <div className="journal-mood-bar__track journal-panel__body shift__form">
        {dayGigs.length > 0 ? (
          <>
            <p className="shift__form-lede muted">
              Pick the hour and minute you arrived or left for {formatDayLabel(shiftDate)}.
            </p>
            {dayGigs.map((gig) => {
              const pick = gigPicks[gig.id] ?? {
                arrival: emptyClock('arrival'),
                end: emptyClock('end'),
              }
              return (
                <ShiftGigClock
                  key={gig.id}
                  gig={gig}
                  shiftDate={shiftDate}
                  arrival={pick.arrival}
                  end={pick.end}
                  onArrival={(parts) => setGigPick(gig.id, 'arrival', parts)}
                  onEnd={(parts) => setGigPick(gig.id, 'end', parts)}
                  onLogArrival={(label) => logGigArrival(gig.id, label)}
                  onLogEnd={(label) => logGigEnd(gig.id, label)}
                />
              )
            })}
          </>
        ) : (
          <>
            <p className="shift__form-lede muted">
              No gigs on this day — pick the hour and minute you arrived or left.
            </p>
            <ShiftClockPicker
              legend="Clock in"
              ariaGroupLabel="Clock-in time"
              hour={manualArrival.hour}
              minute={manualArrival.minute}
              ap={manualArrival.ap}
              onChange={(parts) => {
                setManualArrival((prev) => ({ ...prev, ...parts }))
                setFlash('')
              }}
              clockedLabel={manualArrival.saved}
              onClock={logManualArrival}
              clockButtonLabel={
                manualArrival.saved && manualArrival.saved !== manualArrivalLabel
                  ? 'Update clock in'
                  : 'Clock in'
              }
              clockKind="arrival"
            />
            <ShiftClockPicker
              legend="Clock out"
              ariaGroupLabel="Clock-out time"
              hour={manualEnd.hour}
              minute={manualEnd.minute}
              ap={manualEnd.ap}
              onChange={(parts) => {
                setManualEnd((prev) => ({ ...prev, ...parts }))
                setFlash('')
              }}
              clockedLabel={manualEnd.saved}
              onClock={logManualEnd}
              clockButtonLabel={
                manualEnd.saved && manualEnd.saved !== manualEndLabel ? 'Update clock out' : 'Clock out'
              }
              clockKind="end"
            />
          </>
        )}

        {flash ? (
          <p className="shift__flash shift__flash--ok" role="status">
            {flash}
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default function ShiftPage() {
  const { bookings } = useBookings()
  const { entries, upsertShiftDay } = useShiftPunctuality()
  const [shiftWeekStart, setShiftWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )

  const weekKey = useMemo(() => toISODateLocal(shiftWeekStart), [shiftWeekStart])
  const shiftDate = useMemo(
    () => toISODateLocal(addDays(shiftWeekStart, dayOffset)),
    [shiftWeekStart, dayOffset]
  )

  const dayGigs = useMemo(() => bookingsCoveringDate(bookings, shiftDate), [bookings, shiftDate])
  const clockKey = `${shiftDate}|${dayGigs.map((g) => g.id).join(',')}`

  function shiftShiftWeek(delta) {
    setShiftWeekStart((w) => addDays(w, delta * 7))
  }

  const clockPanel = (
    <ShiftClockBoard
      key={clockKey}
      shiftDate={shiftDate}
      dayGigs={dayGigs}
      entries={entries}
      upsertShiftDay={upsertShiftDay}
    />
  )

  return (
    <div className="page page--shift page--kid-journal page--workspace work-ui">
      <div className="journal__layout shift__layout">
        <section className="journal__week-picker work-ui__panel" aria-label="Pick a day">
          <div className="journal__week-picker-top">
            <div className="trip-log__week-tools journal__week-tools">
              <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftShiftWeek(-1)}>
                ← Prev
              </button>
              <p className="journal__week-range" aria-live="polite">
                {formatWeekRange(shiftWeekStart)}
              </p>
              <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftShiftWeek(1)}>
                Next →
              </button>
            </div>
            <p className="journal__selected-day" aria-live="polite">
              {formatDayLabel(shiftDate)}
            </p>
          </div>
          <DayStrip
            weekStart={shiftWeekStart}
            selectedIso={shiftDate}
            onSelect={(iso) => {
              const a = new Date(weekKey + 'T12:00:00')
              const b = new Date(iso + 'T12:00:00')
              const diff = Math.round((b - a) / 86400000)
              setDayOffset(Math.max(0, Math.min(6, diff)))
            }}
          />
        </section>

        <WorkspaceTileBoard
          workspaceId="shift"
          tiles={[
            {
              id: 'clock',
              label: 'Clock',
              span: 2,
              hideHead: true,
              children: clockPanel,
            },
            {
              id: 'contract',
              label: 'Contract',
              span: 2,
              children: <ShiftContractSection selectedDateISO={shiftDate} />,
            },
          ]}
        />
      </div>
    </div>
  )
}
