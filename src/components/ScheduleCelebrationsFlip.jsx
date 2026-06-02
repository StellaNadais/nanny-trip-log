import { useMemo, useState } from 'react'
import {
  celebrationsByWeekInMonth,
  celebrationsInMonth,
  monthCelebrationsTitle,
} from '../utils/scheduleCelebrations'
import { toISODateLocal } from '../utils/dates'

/**
 * Above the schedule calendar: month celebrations (front) ↔ weekly plan with activities (back).
 */
export default function ScheduleCelebrationsFlip({ year, monthIndex }) {
  const [showWeeks, setShowWeeks] = useState(false)
  const todayIso = toISODateLocal(new Date())

  const monthTitle = useMemo(() => monthCelebrationsTitle(monthIndex), [monthIndex])
  const inMonth = useMemo(
    () => celebrationsInMonth(year, monthIndex),
    [year, monthIndex]
  )
  const byWeek = useMemo(
    () => celebrationsByWeekInMonth(year, monthIndex, todayIso),
    [year, monthIndex, todayIso]
  )

  return (
    <section
      className="schedule-celebrations-flip schedule-flip"
      aria-label={`${monthTitle} celebrations`}
    >
      <div className="schedule-flip__scene schedule-celebrations-flip__scene">
        <div
          className={`schedule-flip__inner${showWeeks ? ' schedule-flip__inner--list' : ''}`}
          aria-live="polite"
        >
          <div
            className="schedule-flip__face schedule-flip__face--front schedule-celebrations-flip__card work-ui__calendar-card"
            aria-hidden={showWeeks}
          >
            <div className="schedule-celebrations-flip__head">
              <h2 className="schedule-celebrations-flip__title">{monthTitle} celebrations</h2>
              <p className="schedule-celebrations-flip__lede muted">
                One special focus per week — flip for activities by week.
              </p>
            </div>
            <div className="schedule-celebrations-flip__scroll">
              {inMonth.length === 0 ? (
                <p className="muted schedule-celebrations-flip__empty">
                  No celebrations listed for this month yet. Edit{' '}
                  <code className="schedule-celebrations-flip__code">monthlyCelebrations.js</code>.
                </p>
              ) : (
                <ul className="schedule-celebrations-flip__month-list">
                  {inMonth.map((c) => (
                    <li key={c.id} className="schedule-celebrations-flip__month-item">
                      <div className="schedule-celebrations-flip__month-row">
                        <time className="schedule-celebrations-flip__date" dateTime={c.dateISO}>
                          {c.dateLabel}
                        </time>
                        <span className="schedule-celebrations-flip__name">{c.title}</span>
                      </div>
                      <p className="schedule-celebrations-flip__theme muted">{c.theme}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              className="schedule-flip__upcoming-strip schedule-celebrations-flip__flip-btn"
              onClick={() => setShowWeeks(true)}
              disabled={inMonth.length === 0}
              aria-label="Flip to upcoming celebration weeks with activities"
            >
              Upcoming weeks →
            </button>
          </div>

          <div
            className="schedule-flip__face schedule-flip__face--back schedule-celebrations-flip__card schedule-celebrations-flip__card--back work-ui__calendar-card"
            aria-hidden={!showWeeks}
          >
            <div className="schedule-flip__back-top schedule-celebrations-flip__back-top">
              <button
                type="button"
                className="btn btn--ghost schedule-flip__back-btn"
                onClick={() => setShowWeeks(false)}
              >
                ← Month view
              </button>
              <h2 className="schedule-flip__back-heading">Upcoming celebration weeks</h2>
            </div>
            <div className="schedule-flip__list-scroll schedule-celebrations-flip__week-scroll">
              {byWeek.length === 0 ? (
                <p className="muted schedule-flip__list-empty">
                  No upcoming celebration weeks left this month — try next month on the calendar below.
                </p>
              ) : (
                <ul className="schedule-celebrations-flip__week-list">
                  {byWeek.map((week) => (
                    <li key={week.weekStartISO} className="schedule-celebrations-flip__week-block">
                      <h3 className="schedule-celebrations-flip__week-label">Week of {week.weekLabel}</h3>
                      {week.celebrations.map((c) => (
                        <article key={c.id} className="schedule-celebrations-flip__celeb-card">
                          <header className="schedule-celebrations-flip__celeb-head">
                            <time dateTime={c.dateISO}>{c.dateLabel}</time>
                            <strong>{c.title}</strong>
                            <span className="muted">{c.theme}</span>
                          </header>
                          <ul className="schedule-celebrations-flip__activities">
                            {c.activities.map((act) => (
                              <li key={act}>{act}</li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
