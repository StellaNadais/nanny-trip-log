import { useEffect, useMemo, useState } from 'react'
import { toISODateLocal } from '../utils/dates'
import {
  celebrationsByActivityWeekForMonth,
  celebrationsByActivityWeekInMonth,
  monthCelebrationsTitle,
  upcomingCelebrationsInMonth,
} from '../utils/scheduleCelebrations'

function CelebrationsFlipFaces({
  showWeeks,
  setShowWeeks,
  monthTitle,
  celebrations,
  byActivityWeek,
}) {
  return (
    <div className="schedule-flip__scene schedule-celebrations-flip__scene">
      <div
        className={`schedule-flip__inner${showWeeks ? ' schedule-flip__inner--list' : ''}`}
        aria-live="polite"
      >
        <div
          className="schedule-flip__face schedule-flip__face--front calendar__panel calendar__panel--book work-ui__calendar-card"
          aria-hidden={showWeeks}
        >
          <div className="schedule-celebrations-flip__main schedule-flip__calendar-main">
            <div className="schedule-flip__calendar-top">
              <h2 className="schedule-celebrations-flip__title">Do fun list</h2>
              <p className="calendar__month schedule-celebrations-flip__month-label">{monthTitle}</p>
            </div>
            <div className="schedule-celebrations-flip__scroll">
              {celebrations.length === 0 ? (
                <p className="muted schedule-celebrations-flip__empty">Nothing this month.</p>
              ) : (
                <ul className="schedule-celebrations-flip__list">
                  {celebrations.map((c) => (
                    <li key={c.id} className="schedule-celebrations-flip__item">
                      <time dateTime={c.dateISO}>{c.dateLabel}</time>
                      <span className="schedule-celebrations-flip__item-title">{c.title}</span>
                      {c.theme ? (
                        <span className="schedule-celebrations-flip__item-theme muted">{c.theme}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="schedule-flip__calendar-footer">
              <button
                type="button"
                className="schedule-flip__gigs-flip-btn"
                onClick={() => setShowWeeks(true)}
                disabled={celebrations.length === 0 && byActivityWeek.length === 0}
                aria-expanded={showWeeks}
                aria-label="Flip to ideas and prep weeks"
              >
                <span className="schedule-flip__gigs-flip-btn-label">Ideas & prep</span>
                <span className="schedule-flip__gigs-flip-btn-hint" aria-hidden>
                  Flip →
                </span>
              </button>
            </div>
          </div>
        </div>

        <div
          className="schedule-flip__face schedule-flip__face--back schedule-flip__retro32 calendar__panel calendar__panel--book work-ui__calendar-card"
          aria-hidden={!showWeeks}
        >
          <div className="schedule-flip__back-top">
            <button
              type="button"
              className="btn btn--ghost schedule-flip__back-btn"
              onClick={() => setShowWeeks(false)}
            >
              ← List
            </button>
            <h2 className="schedule-flip__back-heading">Ideas & prep</h2>
          </div>
          <div className="schedule-flip__list-scroll schedule-celebrations-flip__week-scroll">
            {byActivityWeek.length === 0 ? (
              <p className="muted schedule-flip__list-empty">No prep weeks this month.</p>
            ) : (
              <ul className="schedule-celebrations-flip__week-list">
                {byActivityWeek.map((week) => (
                  <li key={week.weekStartISO} className="schedule-celebrations-flip__week-block">
                    <h3 className="schedule-celebrations-flip__week-label muted">
                      Week of {week.weekLabel}
                    </h3>
                    {week.celebrations.map((c) => (
                      <article key={c.id} className="schedule-celebrations-flip__prep-item">
                        <strong>{c.title}</strong>
                        {c.activities.length > 0 ? (
                          <ul className="schedule-celebrations-flip__prep-todos">
                            {c.activities.map((act) => (
                              <li key={act}>{act}</li>
                            ))}
                          </ul>
                        ) : null}
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
  )
}

/**
 * Do fun list (front) ↔ prep weeks & ideas (back). Month follows the schedule calendar.
 */
export default function ScheduleCelebrationsFlip({
  year,
  monthIndex,
  embedded = false,
}) {
  const [showWeeks, setShowWeeks] = useState(false)

  const monthTitle = useMemo(() => monthCelebrationsTitle(monthIndex, year), [monthIndex, year])
  const todayIso = useMemo(() => toISODateLocal(new Date()), [])
  const celebrations = useMemo(
    () => upcomingCelebrationsInMonth(year, monthIndex, todayIso),
    [year, monthIndex, todayIso]
  )
  const byActivityWeek = useMemo(
    () =>
      celebrations.length > 0
        ? celebrationsByActivityWeekInMonth(year, monthIndex, todayIso)
        : celebrationsByActivityWeekForMonth(year, monthIndex),
    [year, monthIndex, todayIso, celebrations.length]
  )

  useEffect(() => {
    setShowWeeks(false)
  }, [year, monthIndex])

  return (
    <section
      className={`schedule-celebrations-flip schedule-celebrations-flip--embedded schedule-fun-flip schedule-flip schedule-calendar-flip${embedded ? ' schedule-calendar-flip--embedded' : ''}`}
      aria-label={`Do fun list for ${monthTitle}`}
    >
      <CelebrationsFlipFaces
        showWeeks={showWeeks}
        setShowWeeks={setShowWeeks}
        monthTitle={monthTitle}
        celebrations={celebrations}
        byActivityWeek={byActivityWeek}
      />
    </section>
  )
}
