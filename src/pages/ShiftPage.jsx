import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toISODateLocal } from '../utils/dates'
import { useShiftPunctuality } from '../hooks/useShiftPunctuality'

const ARRIVAL_TIMES = ['8:00 AM', '8:05 AM', '8:10 AM']
const END_TIMES = ['5:00 PM', '5:05 PM', '5:10 PM']

export default function ShiftPage() {
  const { addEntry } = useShiftPunctuality()
  const [shiftDate, setShiftDate] = useState(() => toISODateLocal(new Date()))
  const [arrival, setArrival] = useState('')
  const [end, setEnd] = useState('')
  const [flash, setFlash] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!arrival || !end) {
      setFlash('Pick arrival and end times.')
      return
    }
    addEntry({
      dateISO: shiftDate,
      arrival,
      end,
    })
    setFlash('Saved. View it under Internal notes.')
    setArrival('')
    setEnd('')
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
          Log when you arrived and left. Internal notes shows your punctuality over time.
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

        <fieldset className="time-pick">
          <legend className="time-pick__legend">Arrival</legend>
          <div className="time-pick__chips" role="group" aria-label="Arrival time">
            {ARRIVAL_TIMES.map((t) => (
              <button
                key={t}
                type="button"
                className={`time-chip ${arrival === t ? 'time-chip--on' : ''}`}
                onClick={() => setArrival(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="time-pick">
          <legend className="time-pick__legend">End of shift</legend>
          <div className="time-pick__chips" role="group" aria-label="End of shift time">
            {END_TIMES.map((t) => (
              <button
                key={t}
                type="button"
                className={`time-chip ${end === t ? 'time-chip--on' : ''}`}
                onClick={() => setEnd(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        {flash ? (
          <p className={`shift__flash ${flash.startsWith('Saved') ? 'shift__flash--ok' : ''}`} role="status">
            {flash}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary shift__submit">
          Submit shift times
        </button>
      </form>

      <div className="shift__links">
        <Link to="/notes" className="page-back">
          Open internal notes →
        </Link>
      </div>
    </div>
  )
}
