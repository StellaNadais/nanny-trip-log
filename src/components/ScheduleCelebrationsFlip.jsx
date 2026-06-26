import { useEffect, useMemo, useState } from 'react'
import {
  celebrationsByActivityWeekInMonth,
  monthCelebrationsTitle,
  upcomingCelebrationsInMonth,
} from '../utils/scheduleCelebrations'
import { toISODateLocal } from '../utils/dates'

function CelebrationsFlipFaces({
  showWeeks,
  setShowWeeks,
  cardClass,
  monthTitle,
  upcoming,
  byActivityWeek,
}) {
  return (
    <div className="schedule-flip__scene schedule-celebrations-flip__scene">
      <div
        className={`schedule-flip__inner${showWeeks ? ' schedule-flip__inner--list' : ''}`}
        aria-live="polite"
      >
        <div
          className={`schedule-flip__face schedule-flip__face--front calendar__panel calendar__panel--book work-ui__calendar-card ${cardClass}`}
          aria-hidden={showWeeks}
        >
          <div className="schedule-celebrations-flip__head">
            <h2 className="schedule-celebrations-flip__title">Do fun list</h2>
            <p className="schedule-celebrations-flip__month muted">{monthTitle}</p>
          </div>
          <div className="schedule-celebrations-flip__scroll">
            {upcoming.length === 0 ? (
              <p className="muted schedule-celebrations-flip__empty">Nothing this month.</p>
            ) : (
              <ul className="schedule-celebrations-flip__list">
                {upcoming.map((c) => (
                  <li key={c.id} className="schedule-celebrations-flip__item">
                    <time dateTime={c.dateISO}>{c.dateLabel}</time>
                    <span className="schedule-celebrations-flip__item-title">{c.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            className="btn btn--ghost schedule-celebrations-flip__flip-btn"
            onClick={() => setShowWeeks(true)}
            disabled={upcoming.length === 0}
            aria-label="Open prep weeks"
          >
            Prep weeks →
          </button>
        </div>

        <div
          className={`schedule-flip__face schedule-flip__face--back calendar__panel calendar__panel--book work-ui__calendar-card ${cardClass} schedule-celebrations-flip__card--back`}
          aria-hidden={!showWeeks}
        >
          <div className="schedule-flip__back-top schedule-celebrations-flip__back-top">
            <button
              type="button"
              className="btn btn--ghost schedule-flip__back-btn"
              onClick={() => setShowWeeks(false)}
            >
              ← List
            </button>
            <h2 className="schedule-flip__back-heading">Prep weeks</h2>
          </div>
          <div className="schedule-flip__list-scroll schedule-celebrations-flip__week-scroll">
            {byActivityWeek.length === 0 ? (
              <p className="muted schedule-flip__list-empty">No prep weeks left.</p>
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
 * Do fun list (front) ↔ prep weeks (back). Embedded on schedule fills the top half.
 */
export default function ScheduleCelebrationsFlip({ year, monthIndex, embedded = false }) {
  const [showWeeks, setShowWeeks] = useState(false)
  const todayIso = toISODateLocal(new Date())

  const monthTitle = useMemo(() => monthCelebrationsTitle(monthIndex), [monthIndex])
  const upcoming = useMemo(
    () => upcomingCelebrationsInMonth(year, monthIndex, todayIso),
    [year, monthIndex, todayIso]
  )
  const byActivityWeek = useMemo(
    () => celebrationsByActivityWeekInMonth(year, monthIndex, todayIso),
    [year, monthIndex, todayIso]
  )

  useEffect(() => {
    setShowWeeks(false)
  }, [year, monthIndex])

  const cardClass = embedded
    ? 'schedule-celebrations-flip__card schedule-celebrations-flip__card--embedded'
    : 'schedule-celebrations-flip__card work-ui__calendar-card'

  return (
    <section
      className="schedule-celebrations-flip schedule-celebrations-flip--embedded schedule-fun-flip schedule-flip"
      aria-label={`Do fun list for ${monthTitle}`}
    >
      <CelebrationsFlipFaces
        showWeeks={showWeeks}
        setShowWeeks={setShowWeeks}
        cardClass={cardClass}
        monthTitle={monthTitle}
        upcoming={upcoming}
        byActivityWeek={byActivityWeek}
      />
    </section>
  )
}
