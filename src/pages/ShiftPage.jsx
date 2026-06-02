import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayStrip } from '../components/DayStrip'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import {
  countByKindYear,
  MAX_SICK_DAYS_PER_YEAR,
  MAX_VACATION_DAYS_PER_YEAR,
  yearFromIso,
} from '../utils/timeOffStorage'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'
import { formatCountdownMs, shiftTimeWindowStatus } from '../utils/shiftTimeWindow'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'

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
  const { upsertShiftDay, timeOffEntries, addTimeOffEntry, removeTimeOffEntry } = useShiftPunctuality()
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

  const [timeOffDate, setTimeOffDate] = useState(() => toISODateLocal(new Date()))
  const [timeOffKind, setTimeOffKind] = useState('vacation')
  const [timeOffFlash, setTimeOffFlash] = useState('')

  const yearForTimeOff = useMemo(() => yearFromIso(timeOffDate), [timeOffDate])

  const vacationUsed = useMemo(
    () => countByKindYear(timeOffEntries, yearForTimeOff, 'vacation'),
    [timeOffEntries, yearForTimeOff]
  )

  const sickUsed = useMemo(
    () => countByKindYear(timeOffEntries, yearForTimeOff, 'sick'),
    [timeOffEntries, yearForTimeOff]
  )

  const yearTimeOffList = useMemo(() => {
    return [...timeOffEntries]
      .filter((e) => yearFromIso(e.dateISO) === yearForTimeOff)
      .sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || ''))
  }, [timeOffEntries, yearForTimeOff])

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

  function submitTimeOff(e) {
    e.preventDefault()
    setTimeOffFlash('')
    const err = addTimeOffEntry({ dateISO: timeOffDate, kind: timeOffKind })
    if (err) {
      setTimeOffFlash(err)
      return
    }
    setTimeOffFlash('Day off logged.')
  }

  return (
    <div className="page page--shift work-ui">
      <div className="page__badge" aria-hidden>
        A
      </div>
      <ToolWorkspaceHead
        code="A"
        eyebrow="Shift workspace"
        title="Shift"
        lede="Pick the week and day, then log arrival and end inside each ±5 minute window."
      />

      <div className="journal__week-picker work-ui__panel shift__week-picker">
        <div className="trip-log__week-tools">
          <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftShiftWeek(-1)}>
            ← Previous week
          </button>
          <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftShiftWeek(1)}>
            Next week →
          </button>
        </div>
        <p className="journal__week-range muted" aria-live="polite">
          {formatWeekRange(shiftWeekStart)}
        </p>
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
      </div>

      <div className="shift__form">
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

        <details className="shift__time-off-details shift__time-off-details--footer">
          <summary className="shift__time-off-summary">
            <span className="shift__time-off-summary-title">Paid vacation & paid sick days</span>
            <span className="shift__time-off-summary-stats muted">
              {yearForTimeOff}: {vacationUsed}/{MAX_VACATION_DAYS_PER_YEAR} paid vacation · {sickUsed}/
              {MAX_SICK_DAYS_PER_YEAR} paid sick
            </span>
          </summary>

          <div className="shift__time-off-panel">
            <p className="muted shift__time-off-lede">
              Per calendar year: up to <strong>{MAX_VACATION_DAYS_PER_YEAR}</strong> paid vacation days and{' '}
              <strong>{MAX_SICK_DAYS_PER_YEAR}</strong> paid sick days. Pick a date below to see counts for that year.
            </p>

            <div className="shift__time-off-meters" aria-live="polite">
              <div className="shift__meter">
                <span className="shift__meter-label">Paid vacation ({yearForTimeOff})</span>
                <span className="shift__meter-count">
                  {vacationUsed} / {MAX_VACATION_DAYS_PER_YEAR}
                </span>
                <div className="shift__meter-bar" role="presentation">
                  <div
                    className="shift__meter-fill shift__meter-fill--vacation"
                    style={{
                      width: `${Math.min(100, (vacationUsed / MAX_VACATION_DAYS_PER_YEAR) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="shift__meter">
                <span className="shift__meter-label">Paid sick days ({yearForTimeOff})</span>
                <span className="shift__meter-count">
                  {sickUsed} / {MAX_SICK_DAYS_PER_YEAR}
                </span>
                <div className="shift__meter-bar" role="presentation">
                  <div
                    className="shift__meter-fill shift__meter-fill--sick"
                    style={{
                      width: `${Math.min(100, (sickUsed / MAX_SICK_DAYS_PER_YEAR) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <form className="shift__time-off-form" onSubmit={submitTimeOff}>
              <label className="field-block">
                <span className="field-block__label">Day off date</span>
                <input
                  type="date"
                  className="input input--line"
                  value={timeOffDate}
                  onChange={(e) => setTimeOffDate(e.target.value)}
                  required
                />
              </label>

              <fieldset className="time-pick shift__time-off-kind">
                <legend className="time-pick__legend">Type</legend>
                <div className="time-pick__chips" role="group" aria-label="Day off type">
                  <button
                    type="button"
                    className={`time-chip ${timeOffKind === 'vacation' ? 'time-chip--on' : ''}`}
                    onClick={() => setTimeOffKind('vacation')}
                  >
                    Paid vacation
                  </button>
                  <button
                    type="button"
                    className={`time-chip ${timeOffKind === 'sick' ? 'time-chip--on' : ''}`}
                    onClick={() => setTimeOffKind('sick')}
                  >
                    Paid sick days
                  </button>
                </div>
              </fieldset>

              {timeOffFlash ? (
                <p
                  className={`shift__flash ${timeOffFlash.startsWith('Day off') ? 'shift__flash--ok' : ''}`}
                  role="status"
                >
                  {timeOffFlash}
                </p>
              ) : null}

              <button type="submit" className="btn btn--primary shift__time-off-submit">
                Log day off
              </button>
            </form>

            {yearTimeOffList.length > 0 ? (
              <ul className="shift__time-off-list">
                {yearTimeOffList.map((row) => (
                  <li key={row.id} className="shift__time-off-row">
                    <span className="shift__time-off-date">{formatDayLabel(row.dateISO)}</span>
                    <span className={`shift__time-off-tag ${row.kind === 'sick' ? 'shift__time-off-tag--sick' : ''}`}>
                      {row.kind === 'vacation' ? 'Paid vacation' : 'Paid sick days'}
                    </span>
                    <button
                      type="button"
                      className="btn btn--ghost shift__time-off-remove"
                      onClick={() => removeTimeOffEntry(row.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted shift__time-off-empty">
                No paid vacation or paid sick days logged for {yearForTimeOff} yet.
              </p>
            )}
          </div>
        </details>
      </div>

      <div className="shift__links">
        <Link to="/notes" className="page-back">
          Punctuality in internal notes →
        </Link>
      </div>
    </div>
  )
}
