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
  activeIndex,
  onNext,
  onPrev,
}) {
  const current = celebrations[activeIndex] || null
  const countLabel =
    celebrations.length > 0 ? `${activeIndex + 1} / ${celebrations.length}` : ''

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
              <h2 className="schedule-celebrations-flip__title">Do fun</h2>
              <p className="calendar__month schedule-celebrations-flip__month-label">{monthTitle}</p>
            </div>

            <div className="schedule-celebrations-flip__one">
              {celebrations.length === 0 ? (
                <p className="muted schedule-celebrations-flip__empty">Nothing this month.</p>
              ) : current ? (
                <div className="schedule-celebrations-flip__card">
                  {celebrations.length > 1 ? (
                    <button
                      type="button"
                      className="schedule-celebrations-flip__one-arrow schedule-celebrations-flip__one-arrow--prev"
                      onClick={onPrev}
                      aria-label="Previous celebration"
                    >
                      ‹
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="schedule-celebrations-flip__card-btn"
                    onClick={onNext}
                    aria-label={
                      celebrations.length > 1
                        ? `Next celebration. Showing ${countLabel}: ${current.title}`
                        : current.title
                    }
                  >
                    <time dateTime={current.dateISO}>{current.dateLabel}</time>
                    <span className="schedule-celebrations-flip__item-title">{current.title}</span>
                    {current.theme ? (
                      <span className="schedule-celebrations-flip__item-theme muted">
                        {current.theme}
                      </span>
                    ) : null}
                    {celebrations.length > 1 ? (
                      <span className="schedule-celebrations-flip__tap-hint muted">{countLabel}</span>
                    ) : null}
                  </button>

                  {celebrations.length > 1 ? (
                    <button
                      type="button"
                      className="schedule-celebrations-flip__one-arrow schedule-celebrations-flip__one-arrow--next"
                      onClick={onNext}
                      aria-label="Next celebration"
                    >
                      ›
                    </button>
                  ) : null}
                </div>
              ) : null}
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
              <span className="schedule-flip__back-btn-arrow" aria-hidden>
                ←
              </span>
              <span className="schedule-flip__back-btn-label">Do fun</span>
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
 * Do fun (one at a time) ↔ prep weeks & ideas (back). Month follows the schedule calendar.
 */
export default function ScheduleCelebrationsFlip({
  year,
  monthIndex,
  embedded = false,
}) {
  const [showWeeks, setShowWeeks] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

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
    setActiveIndex(0)
  }, [year, monthIndex])

  useEffect(() => {
    if (celebrations.length === 0) {
      setActiveIndex(0)
      return
    }
    setActiveIndex((i) => Math.min(i, celebrations.length - 1))
  }, [celebrations.length])

  function goNext() {
    if (celebrations.length <= 1) return
    setActiveIndex((i) => (i + 1) % celebrations.length)
  }

  function goPrev() {
    if (celebrations.length <= 1) return
    setActiveIndex((i) => (i - 1 + celebrations.length) % celebrations.length)
  }

  return (
    <section
      className={`schedule-celebrations-flip schedule-celebrations-flip--embedded schedule-fun-flip schedule-flip schedule-calendar-flip${embedded ? ' schedule-calendar-flip--embedded' : ''}`}
      aria-label={`Do fun for ${monthTitle}`}
    >
      <CelebrationsFlipFaces
        showWeeks={showWeeks}
        setShowWeeks={setShowWeeks}
        monthTitle={monthTitle}
        celebrations={celebrations}
        byActivityWeek={byActivityWeek}
        activeIndex={activeIndex}
        onNext={goNext}
        onPrev={goPrev}
      />
    </section>
  )
}
