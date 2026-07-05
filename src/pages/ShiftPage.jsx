import { useEffect, useMemo, useState } from 'react'
import { DayStrip } from '../components/DayStrip'
import HoldConfirmControl from '../components/HoldConfirmControl'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { useBookings } from '../hooks/useBookings'
import {
  formatCountdownMs,
  hmToShiftLabel,
  shiftPickerOptionsFromHm,
  shiftTimeWindowStatus,
} from '../utils/shiftTimeWindow'
import { bookingCareTimesForDay, bookingsCoveringDate } from '../utils/bookingRange'
import ShiftContractSection from '../components/ShiftContractSection'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

const FALLBACK_ARRIVAL_TIMES = ['8:00 AM', '8:05 AM', '8:10 AM']
const FALLBACK_END_TIMES = ['5:00 PM', '5:05 PM', '5:10 PM']

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

/** Splits "8:00 AM" → { clock: "8:00", ap: "AM" } */
function splitTimeLabel(full) {
  const parts = String(full).trim().split(/\s+/)
  if (parts.length >= 2) {
    return { clock: parts[0], ap: parts.slice(1).join(' ') }
  }
  return { clock: full, ap: '' }
}

function ShiftTimeRow({
  legend,
  ariaGroupLabel,
  options,
  selected,
  onSelect,
  shiftDate,
  isShiftToday,
  now,
  kind,
}) {
  const status = selected ? shiftTimeWindowStatus(shiftDate, selected, now) : null

  return (
    <fieldset className="shift__pick-field time-pick">
      <legend className="time-pick__legend">{legend}</legend>
      <div className="shift__circle-row" role="group" aria-label={ariaGroupLabel}>
        {options.map((t) => {
          const { clock: clockPart, ap } = splitTimeLabel(t)
          const on = selected === t
          const live = on && isShiftToday && shiftTimeWindowStatus(shiftDate, t, now).status === 'inside'
          return (
            <button
              key={t}
              type="button"
              className={`shift__time-circle ${on ? 'shift__time-circle--on' : ''} ${live ? 'shift__time-circle--live' : ''}`}
              aria-pressed={on}
              aria-label={on ? `Clear ${kind} ${t}` : `Select ${kind} ${t}`}
              onClick={() => onSelect(on ? '' : t)}
            >
              <span className="shift__time-circle__clock">{clockPart}</span>
              {ap ? <span className="shift__time-circle__ap">{ap}</span> : null}
            </button>
          )
        })}
      </div>
      {selected && isShiftToday && status?.status === 'inside' ? (
        <p className="shift__window-hint shift__window-hint--ok" aria-live="polite">
          Press and hold below to log {kind}
        </p>
      ) : selected && isShiftToday && status?.status === 'before' ? (
        <p className="shift__window-hint muted" aria-live="polite">
          Unlocks in{' '}
          <strong className="shift__countdown">
            {formatCountdownMs(status.opensAt.getTime() - now.getTime())}
          </strong>
        </p>
      ) : selected && isShiftToday && status?.status === 'after' ? (
        <p className="shift__window-hint muted" aria-live="polite">
          Window passed for {selected}
        </p>
      ) : null}
    </fieldset>
  )
}

function ShiftGigClock({
  gig,
  shiftDate,
  isShiftToday,
  now,
  arrival,
  end,
  onArrival,
  onEnd,
  onLogArrival,
  onLogEnd,
  canLogArrival,
  canLogEnd,
}) {
  const times = bookingCareTimesForDay(gig, shiftDate)
  if (!times) return null

  const arrivalOptions = times.arrivalHM ? shiftPickerOptionsFromHm(times.arrivalHM) : []
  const endOptions = times.endHM ? shiftPickerOptionsFromHm(times.endHM) : []
  const statusLabel =
    gig.responseStatus === 'accepted' ? 'Confirmed' : gig.responseStatus === 'declined' ? 'Declined' : 'Request'

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
          {times.arrivalHM ? (
            <p className="shift__requested muted">
              Requested arrival: <strong>{hmToShiftLabel(times.arrivalHM)}</strong>
            </p>
          ) : null}
          {times.endHM ? (
            <p className="shift__requested muted">
              Requested end: <strong>{hmToShiftLabel(times.endHM)}</strong>
            </p>
          ) : null}

          {arrivalOptions.length ? (
            <ShiftTimeRow
              legend="Arrival"
              ariaGroupLabel={`Arrival time for ${times.familyName}`}
              options={arrivalOptions}
              selected={arrival}
              onSelect={onArrival}
              shiftDate={shiftDate}
              isShiftToday={isShiftToday}
              now={now}
              kind="arrival"
            />
          ) : null}

          {endOptions.length ? (
            <ShiftTimeRow
              legend="End of shift"
              ariaGroupLabel={`End time for ${times.familyName}`}
              options={endOptions}
              selected={end}
              onSelect={onEnd}
              shiftDate={shiftDate}
              isShiftToday={isShiftToday}
              now={now}
              kind="end"
            />
          ) : null}

          <div className="shift__submit-row">
            {arrivalOptions.length ? (
              <HoldConfirmControl
                enabled={canLogArrival}
                onConfirm={onLogArrival}
                disabled={!canLogArrival}
                className={`btn btn--primary shift__submit-btn shift__submit-btn--arrival ${canLogArrival ? 'shift__submit-btn--live' : ''}`}
                aria-label={`Press and hold to log arrival for ${times.familyName}`}
              >
                Log arrival
              </HoldConfirmControl>
            ) : null}
            {endOptions.length ? (
              <HoldConfirmControl
                enabled={canLogEnd}
                onConfirm={onLogEnd}
                disabled={!canLogEnd}
                className={`btn btn--primary shift__submit-btn shift__submit-btn--end ${canLogEnd ? 'shift__submit-btn--live' : ''}`}
                aria-label={`Press and hold to log end for ${times.familyName}`}
              >
                Log end
              </HoldConfirmControl>
            ) : null}
          </div>
        </>
      )}
    </div>
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

  const [manualArrival, setManualArrival] = useState('')
  const [manualEnd, setManualEnd] = useState('')
  const [gigPicks, setGigPicks] = useState({})
  const [flash, setFlash] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const next = {}
    for (const gig of dayGigs) {
      const saved = entries.find((e) => e.dateISO === shiftDate && e.bookingId === gig.id)
      next[gig.id] = { arrival: saved?.arrival ?? '', end: saved?.end ?? '' }
    }
    setGigPicks(next)
    setManualArrival('')
    setManualEnd('')
    setFlash('')
  }, [shiftDate, dayGigs])

  const now = useMemo(() => new Date(), [tick])
  const todayIso = toISODateLocal(now)
  const isShiftToday = shiftDate === todayIso

  function shiftShiftWeek(delta) {
    setShiftWeekStart((w) => addDays(w, delta * 7))
  }

  function setGigPick(gigId, patch) {
    setGigPicks((prev) => ({
      ...prev,
      [gigId]: { ...prev[gigId], ...patch },
    }))
    setFlash('')
  }

  function logGigArrival(gigId) {
    const pick = gigPicks[gigId]
    if (!pick?.arrival || !isShiftToday) return
    if (shiftTimeWindowStatus(shiftDate, pick.arrival, now).status !== 'inside') return
    upsertShiftDay({ dateISO: shiftDate, bookingId: gigId, arrival: pick.arrival })
    setFlash('Arrival saved.')
  }

  function logGigEnd(gigId) {
    const pick = gigPicks[gigId]
    if (!pick?.end || !isShiftToday) return
    if (shiftTimeWindowStatus(shiftDate, pick.end, now).status !== 'inside') return
    upsertShiftDay({ dateISO: shiftDate, bookingId: gigId, end: pick.end })
    setFlash('End saved.')
  }

  function logManualArrival() {
    if (!manualArrival || !isShiftToday) return
    if (shiftTimeWindowStatus(shiftDate, manualArrival, now).status !== 'inside') return
    upsertShiftDay({ dateISO: shiftDate, arrival: manualArrival })
    setFlash('Arrival saved.')
  }

  function logManualEnd() {
    if (!manualEnd || !isShiftToday) return
    if (shiftTimeWindowStatus(shiftDate, manualEnd, now).status !== 'inside') return
    upsertShiftDay({ dateISO: shiftDate, end: manualEnd })
    setFlash('End saved.')
  }

  const manualCanLogArrival =
    isShiftToday &&
    Boolean(manualArrival && shiftTimeWindowStatus(shiftDate, manualArrival, now).status === 'inside')
  const manualCanLogEnd =
    isShiftToday &&
    Boolean(manualEnd && shiftTimeWindowStatus(shiftDate, manualEnd, now).status === 'inside')

  const clockPanel = (
    <section
      className="journal-mood-bar journal-panel journal-panel--shift-log shift__card shift__card--log"
      aria-label="Log shift times"
    >
      <div className="journal-mood-bar__track journal-panel__body shift__form">
        {dayGigs.length > 0 ? (
          <>
            <p className="shift__form-lede muted">
              Times are based on each family&apos;s request for {formatDayLabel(shiftDate)}.
            </p>
            {dayGigs.map((gig) => {
              const pick = gigPicks[gig.id] ?? { arrival: '', end: '' }
              const canLogArrival =
                isShiftToday &&
                Boolean(
                  pick.arrival && shiftTimeWindowStatus(shiftDate, pick.arrival, now).status === 'inside'
                )
              const canLogEnd =
                isShiftToday &&
                Boolean(pick.end && shiftTimeWindowStatus(shiftDate, pick.end, now).status === 'inside')
              return (
                <ShiftGigClock
                  key={gig.id}
                  gig={gig}
                  shiftDate={shiftDate}
                  isShiftToday={isShiftToday}
                  now={now}
                  arrival={pick.arrival}
                  end={pick.end}
                  onArrival={(v) => setGigPick(gig.id, { arrival: v })}
                  onEnd={(v) => setGigPick(gig.id, { end: v })}
                  onLogArrival={() => logGigArrival(gig.id)}
                  onLogEnd={() => logGigEnd(gig.id)}
                  canLogArrival={canLogArrival}
                  canLogEnd={canLogEnd}
                />
              )
            })}
          </>
        ) : (
          <>
            <p className="shift__form-lede muted">No gigs on this day — pick times manually.</p>
            <ShiftTimeRow
              legend="Arrival"
              ariaGroupLabel="Arrival time"
              options={FALLBACK_ARRIVAL_TIMES}
              selected={manualArrival}
              onSelect={setManualArrival}
              shiftDate={shiftDate}
              isShiftToday={isShiftToday}
              now={now}
              kind="arrival"
            />
            <ShiftTimeRow
              legend="End of shift"
              ariaGroupLabel="End of shift time"
              options={FALLBACK_END_TIMES}
              selected={manualEnd}
              onSelect={setManualEnd}
              shiftDate={shiftDate}
              isShiftToday={isShiftToday}
              now={now}
              kind="end"
            />
            <div className="shift__submit-row">
              <HoldConfirmControl
                enabled={manualCanLogArrival}
                onConfirm={logManualArrival}
                disabled={!manualCanLogArrival}
                className={`btn btn--primary shift__submit-btn shift__submit-btn--arrival ${manualCanLogArrival ? 'shift__submit-btn--live' : ''}`}
                aria-label="Press and hold to log arrival"
              >
                Log arrival
              </HoldConfirmControl>
              <HoldConfirmControl
                enabled={manualCanLogEnd}
                onConfirm={logManualEnd}
                disabled={!manualCanLogEnd}
                className={`btn btn--primary shift__submit-btn shift__submit-btn--end ${manualCanLogEnd ? 'shift__submit-btn--live' : ''}`}
                aria-label="Press and hold to log end"
              >
                Log end
              </HoldConfirmControl>
            </div>
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
              label: 'Clock in',
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
