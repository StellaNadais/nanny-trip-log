import { useEffect, useMemo, useState } from 'react'
import { getJournalDayProgress } from '../utils/journalDayProgress'
import { toISODateLocal } from '../utils/dates'

/**
 * Bar that fills as the selected calendar day goes by (live when viewing today).
 */
export default function JournalDayProgress({ dateISO, dateLabel, variant = 'inline' }) {
  const variantClass =
    variant === 'thin' ? ' journal-day-progress--thin' : variant === 'rail' ? ' journal-day-progress--rail' : ''
  const [now, setNow] = useState(() => new Date())
  const isToday = dateISO === toISODateLocal(now)

  useEffect(() => {
    if (!isToday) return undefined
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [isToday])

  const { percent, status, label } = useMemo(
    () => getJournalDayProgress(dateISO, now),
    [dateISO, now]
  )

  if (!dateISO) return null

  return (
    <section
      className={`journal-day-progress${variantClass}`}
      aria-label={`Day progress for ${dateLabel}`}
    >
      <div className="journal-day-progress__head">
        <span className="journal-day-progress__title">Day in progress</span>
        <span className="journal-day-progress__label muted">{label}</span>
      </div>
      <div
        className="journal-day-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={label}
        data-status={status}
      >
        <div
          className="journal-day-progress__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  )
}
