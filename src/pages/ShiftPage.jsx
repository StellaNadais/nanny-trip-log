import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toISODateLocal } from '../utils/dates'
import {
  countByKindYear,
  MAX_SICK_DAYS_PER_YEAR,
  MAX_VACATION_DAYS_PER_YEAR,
  yearFromIso,
} from '../utils/timeOffStorage'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'

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

export default function ShiftPage() {
  const { addEntry, timeOffEntries, addTimeOffEntry, removeTimeOffEntry } = useShiftPunctuality()
  const [shiftDate, setShiftDate] = useState(() => toISODateLocal(new Date()))
  const [arrival, setArrival] = useState('')
  const [end, setEnd] = useState('')
  const [flash, setFlash] = useState('')

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

  function submit(e) {
    e.preventDefault()
    addEntry({
      dateISO: shiftDate,
      arrival,
      end,
    })
    setFlash('Saved. View it under Internal notes.')
    setArrival('')
    setEnd('')
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
    <div className="page page--shift">
      <header className="shift__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <h1 className="shift__title">
          Shift <span className="placeholder__code">(A)</span>
        </h1>
        <p className="muted shift__lede">
          Log when you arrived and left. Internal notes shows your punctuality over time. Track paid vacation and paid
          sick days below (annual limits apply).
        </p>
      </header>

      <form className="shift__form" onSubmit={submit}>
        <label className="field-block">
          <span className="field-block__label">Shift date</span>
          <input
            type="date"
            className="input input--line"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            required
          />
        </label>

        <label className="field-block">
          <span className="field-block__label">Arrival</span>
          <select
            className="input input--line"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            required
            aria-label="Arrival time"
          >
            <option value="">Select arrival…</option>
            {ARRIVAL_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="field-block">
          <span className="field-block__label">End of shift</span>
          <select
            className="input input--line"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            aria-label="End of shift time"
          >
            <option value="">Select end time…</option>
            {END_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {flash ? (
          <p className={`shift__flash ${flash.startsWith('Saved') ? 'shift__flash--ok' : ''}`} role="status">
            {flash}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary shift__submit">
          Submit shift times
        </button>
      </form>

      <details className="shift__time-off-details">
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
                <button type="button" className="btn btn--ghost shift__time-off-remove" onClick={() => removeTimeOffEntry(row.id)}>
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

      <div className="shift__links">
        <Link to="/notes" className="page-back">
          Open internal notes →
        </Link>
      </div>
    </div>
  )
}
