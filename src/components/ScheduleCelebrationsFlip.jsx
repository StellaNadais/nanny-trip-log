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
          className={`schedule-flip__face schedule-flip__face--front ${cardClass}`}
          aria-hidden={showWeeks}
        >
          <div className="schedule-celebrations-flip__head">
            <div className="schedule-celebrations-flip__mission-bar">
              <span className="schedule-celebrations-flip__mission-bar-tag">Mission log</span>
              <span className="schedule-celebrations-flip__mission-bar-count">
                {upcoming.length} active
              </span>
            </div>
            <h2 className="schedule-celebrations-flip__title">
              do fun list of {monthTitle}
            </h2>
            <p className="schedule-celebrations-flip__lede muted">
              Complete prep one week before each target date.
            </p>
          </div>
          <div className="schedule-celebrations-flip__scroll">
            {upcoming.length === 0 ? (
              <p className="muted schedule-celebrations-flip__empty">
                No missions left in {monthTitle}. Change month on the calendar or edit{' '}
                <code className="schedule-celebrations-flip__code">monthlyCelebrations.js</code>.
              </p>
            ) : (
              <ul className="schedule-celebrations-flip__mission-list">
                {upcoming.map((c, i) => (
                  <li key={c.id} className="schedule-celebrations-flip__mission">
                    <div className="schedule-celebrations-flip__mission-head">
                      <span className="schedule-celebrations-flip__mission-num" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="schedule-celebrations-flip__mission-status">Active</span>
                    </div>
                    <h3 className="schedule-celebrations-flip__mission-title">{c.title}</h3>
                    <dl className="schedule-celebrations-flip__mission-meta">
                      <div className="schedule-celebrations-flip__mission-meta-row">
                        <dt>Target</dt>
                        <dd>
                          <time dateTime={c.dateISO}>{c.dateLabel}</time>
                        </dd>
                      </div>
                      <div className="schedule-celebrations-flip__mission-meta-row">
                        <dt>Prep by</dt>
                        <dd>
                          <time dateTime={c.activityByISO}>{c.activityByLabel}</time>
                        </dd>
                      </div>
                    </dl>
                    {c.theme ? (
                      <p className="schedule-celebrations-flip__mission-brief">{c.theme}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            className="schedule-flip__upcoming-strip schedule-celebrations-flip__flip-btn"
            onClick={() => setShowWeeks(true)}
            disabled={byActivityWeek.length === 0}
            aria-label="Open prep week objectives"
          >
            <span className="schedule-celebrations-flip__flip-btn-label">Prep weeks</span>
            <span className="schedule-celebrations-flip__flip-btn-ico" aria-hidden>
              ▶
            </span>
          </button>
        </div>

        <div
          className={`schedule-flip__face schedule-flip__face--back ${cardClass} schedule-celebrations-flip__card--back`}
          aria-hidden={!showWeeks}
        >
          <div className="schedule-flip__back-top schedule-celebrations-flip__back-top">
            <button
              type="button"
              className="btn btn--ghost schedule-flip__back-btn"
              onClick={() => setShowWeeks(false)}
            >
              ← Dates
            </button>
            <h2 className="schedule-flip__back-heading">Prep objectives</h2>
          </div>
          <div className="schedule-flip__list-scroll schedule-celebrations-flip__week-scroll">
            {byActivityWeek.length === 0 ? (
              <p className="muted schedule-flip__list-empty">
                No prep weeks left for {monthTitle} — change month on the calendar.
              </p>
            ) : (
              <ul className="schedule-celebrations-flip__week-list">
                {byActivityWeek.map((week) => (
                  <li key={week.weekStartISO} className="schedule-celebrations-flip__week-block">
                    <h3 className="schedule-celebrations-flip__week-label">
                      <span className="schedule-celebrations-flip__week-label-tag">Chapter</span>
                      Week of {week.weekLabel}
                    </h3>
                    {week.celebrations.map((c) => (
                      <article key={c.id} className="schedule-celebrations-flip__celeb-card">
                        <header className="schedule-celebrations-flip__celeb-head">
                          <span className="schedule-celebrations-flip__celeb-rank">Side quest</span>
                          <strong>{c.title}</strong>
                          <span className="schedule-celebrations-flip__celeb-dates muted">
                            Prep by{' '}
                            <time dateTime={c.activityByISO}>{c.activityByLabel}</time>
                            {' · '}Target{' '}
                            <time dateTime={c.dateISO}>{c.dateLabel}</time>
                          </span>
                        </header>
                        <p className="schedule-celebrations-flip__objectives-label">Objectives</p>
                        <ul className="schedule-celebrations-flip__activities">
                          {c.activities.map((act) => (
                            <li key={act} className="schedule-celebrations-flip__objective">
                              <span className="schedule-celebrations-flip__objective-box" aria-hidden />
                              <span>{act}</span>
                            </li>
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
  )
}

/**
 * Do fun list (front) ↔ activity prep weeks (back). Embedded on schedule fills the top half.
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
      className={`schedule-celebrations-flip schedule-celebrations-flip--missions schedule-flip${embedded ? ' schedule-celebrations-flip--embedded' : ''}`}
      aria-label={`do fun list of ${monthTitle}`}
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
