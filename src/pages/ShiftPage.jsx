import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayStrip } from '../components/DayStrip'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { formatCountdownMs, shiftTimeWindowStatus } from '../utils/shiftTimeWindow'
import ShiftContractSection from '../components/ShiftContractSection'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'
import { useJournalDaySky } from '../hooks/useJournalDaySky'

const ARRIVAL_TIMES = ['8:00 AM', '8:05 AM', '8:10 AM']
const END_TIMES = ['5:00 PM', '5:05 PM', '5:10 PM']

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

export default function ShiftPage() {
  const { upsertShiftDay } = useShiftPunctuality()
  const [shiftWeekStart, setShiftWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )

  const weekKey = useMemo(() => toISODateLocal(shiftWeekStart), [shiftWeekStart])
  const shiftDate = useMemo(
    () => toISODateLocal(addDays(shiftWeekStart, dayOffset)),
    [shiftWeekStart, dayOffset]
  )

  const [arrival, setArrival] = useState('')
  const [end, setEnd] = useState('')
  const [flash, setFlash] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const clock = useMemo(() => {
    const now = new Date()
    const todayIso = toISODateLocal(now)
    const isShiftToday = shiftDate === todayIso
    const arrivalSt = arrival ? shiftTimeWindowStatus(shiftDate, arrival, now) : null
    const endSt = end ? shiftTimeWindowStatus(shiftDate, end, now) : null
    return {
      now,
      isShiftToday,
      arrivalSt,
      endSt,
      canLogArrival: isShiftToday && Boolean(arrival && arrivalSt?.status === 'inside'),
      canLogEnd: isShiftToday && Boolean(end && endSt?.status === 'inside'),
    }
  }, [tick, shiftDate, arrival, end])

  const daySky = useJournalDaySky(shiftDate)

  function shiftShiftWeek(delta) {
    setShiftWeekStart((w) => addDays(w, delta * 7))
  }

  function logArrival() {
    if (!clock.canLogArrival) return
    upsertShiftDay({ dateISO: shiftDate, arrival })
    setFlash('Arrival saved. Log end when you leave, inside its ±5 minute window.')
  }

  function logEnd() {
    if (!clock.canLogEnd) return
    upsertShiftDay({ dateISO: shiftDate, end })
    const pair = Boolean(arrival && end)
    setFlash(
      pair
        ? "Today's shift is logged."
        : 'End saved.'
    )
  }

  return (
    <div
      className="page page--shift page--kid-journal work-ui"
      style={daySky.style}
      data-sky-phase={daySky.label}
    >
      <ToolWorkspaceHead
        eyebrow="Shift workspace"
        title="Shift"
        lede="Pick the week and day, then log arrival and end inside each ±5 minute window."
      />

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
            <p className="journal__sky-phase" aria-live="polite">
              {daySky.label}
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

        <section
          className="journal-mood-bar journal-panel journal-panel--shift-log shift__card shift__card--log"
          aria-label="Log shift times"
        >
          <div className="journal-mood-bar__head">
            <span className="journal-mood-bar__title">Clock in</span>
            <span className="journal-mood-bar__picked journal-mood-bar__picked--empty muted">
              ±5 min windows
            </span>
          </div>
          <div className="journal-mood-bar__track journal-panel__body shift__form">
        {!clock.isShiftToday ? (
          <p className="shift__today-callout muted" role="note">
            Select <strong>today</strong> in the strip above to unlock logging; each button only works on the
            selected day within ±5 minutes of that wall time.
          </p>
        ) : null}

        <fieldset className="shift__pick-field time-pick">
          <legend className="time-pick__legend">Arrival</legend>
          <div className="shift__circle-row" role="group" aria-label="Arrival time">
            {ARRIVAL_TIMES.map((t) => {
              const { clock: clockPart, ap } = splitTimeLabel(t)
              const on = arrival === t
              const slotLive = on && clock.isShiftToday && clock.arrivalSt?.status === 'inside'
              return (
                <button
                  key={t}
                  type="button"
                  className={`shift__time-circle ${on ? 'shift__time-circle--on' : ''} ${slotLive ? 'shift__time-circle--live' : ''}`}
                  onClick={() => setArrival(t)}
                  aria-pressed={on}
                  aria-label={`Arrival ${t}`}
                >
                  <span className="shift__time-circle__clock">{clockPart}</span>
                  {ap ? <span className="shift__time-circle__ap">{ap}</span> : null}
                </button>
              )
            })}
          </div>
          <p className="shift__window-hint muted" aria-live="polite">
            {!arrival ? (
              'Tap the time you plan to arrive—circles gently pulse when you are in the live window.'
            ) : !clock.isShiftToday ? (
              'Switch to today in the week strip to align submit with the real clock.'
            ) : clock.arrivalSt?.status === 'inside' ? (
              <span className="shift__window-hint--ok">You are in the arrival window—log it while it feels true.</span>
            ) : clock.arrivalSt?.status === 'before' ? (
              <>
                Unlocks in <strong className="shift__countdown">{formatCountdownMs(clock.arrivalSt.opensAt.getTime() - clock.now.getTime())}</strong> (±5 minutes around{' '}
                {arrival}).
              </>
            ) : (
              <>That ±5 minute window has passed for {arrival} today—tomorrow is a fresh chance, or pick another slot.</>
            )}
          </p>
        </fieldset>

        <fieldset className="shift__pick-field time-pick">
          <legend className="time-pick__legend">End of shift</legend>
          <div className="shift__circle-row" role="group" aria-label="End of shift time">
            {END_TIMES.map((t) => {
              const { clock: clockPart, ap } = splitTimeLabel(t)
              const on = end === t
              const slotLive = on && clock.isShiftToday && clock.endSt?.status === 'inside'
              return (
                <button
                  key={t}
                  type="button"
                  className={`shift__time-circle ${on ? 'shift__time-circle--on' : ''} ${slotLive ? 'shift__time-circle--live' : ''}`}
                  onClick={() => setEnd(t)}
                  aria-pressed={on}
                  aria-label={`End ${t}`}
                >
                  <span className="shift__time-circle__clock">{clockPart}</span>
                  {ap ? <span className="shift__time-circle__ap">{ap}</span> : null}
                </button>
              )
            })}
          </div>
          <p className="shift__window-hint muted" aria-live="polite">
            {!end ? (
              'Tap when you expect to finish—same ±5 minute rule when you clock out for real.'
            ) : !clock.isShiftToday ? (
              'Switch to today in the week strip before the end-time window to submit.'
            ) : clock.endSt?.status === 'inside' ? (
              <span className="shift__window-hint--ok">You are in the end window—wrap the day when you are ready.</span>
            ) : clock.endSt?.status === 'before' ? (
              <>
                Unlocks in <strong className="shift__countdown">{formatCountdownMs(clock.endSt.opensAt.getTime() - clock.now.getTime())}</strong> (±5 minutes around{' '}
                {end}).
              </>
            ) : (
              <>That ±5 minute window has passed for {end} today.</>
            )}
          </p>
        </fieldset>

        {flash ? (
          <p
            className={`shift__flash ${
              flash.startsWith('Arrival') || flash.startsWith('End saved') || flash.startsWith('Today')
                ? 'shift__flash--ok'
                : ''
            }`}
            role="status"
          >
            {flash}
          </p>
        ) : null}

        <div className="shift__submit-row">
          <button
            type="button"
            className={`btn btn--primary shift__submit-btn shift__submit-btn--arrival ${clock.canLogArrival ? 'shift__submit-btn--live' : ''}`}
            disabled={!clock.canLogArrival}
            onClick={logArrival}
          >
            Log arrival
          </button>
          <button
            type="button"
            className={`btn btn--primary shift__submit-btn shift__submit-btn--end ${clock.canLogEnd ? 'shift__submit-btn--live' : ''}`}
            disabled={!clock.canLogEnd}
            onClick={logEnd}
          >
            Log end
          </button>
        </div>
          </div>
        </section>

        <ShiftContractSection selectedDateISO={shiftDate} />
      </div>

      <div className="shift__links">
        <Link to="/hub" className="page-back">
          ← Tools
        </Link>
      </div>
    </div>
  )
}
