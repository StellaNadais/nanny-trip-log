import { useEffect, useMemo, useState } from 'react'
import { toISODateLocal } from '../utils/dates'
import {
  celebrationsByActivityWeekForMonth,
  celebrationsByActivityWeekInMonth,
  monthCelebrationsTitle,
  upcomingCelebrationsInMonth,
} from '../utils/scheduleCelebrations'
import { CUSTOM_CELEBRATIONS_UPDATED_EVENT } from '../utils/customCelebrationsStorage'
import ScheduleFunCelebrationList from './ScheduleFunCelebrationList'
import { softCardIcon } from './SoftCardPanel'

function CelebrationsFlipFaces({
  showWeeks,
  setShowWeeks,
  monthTitle,
  celebrations,
  byActivityWeek,
  embedded,
  year,
  monthIndex,
  addOpen,
  setAddOpen,
  onCustomChange,
}) {
  const canFlip = celebrations.length > 0 || byActivityWeek.length > 0

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
            {embedded ? null : (
              <div className="schedule-flip__calendar-top">
                <h2 className="schedule-celebrations-flip__title">Do fun list</h2>
                <p className="calendar__month schedule-celebrations-flip__month-label">{monthTitle}</p>
              </div>
            )}
            <div className="schedule-celebrations-flip__scroll">
              {embedded ? (
                <ScheduleFunCelebrationList
                  celebrations={celebrations}
                  addOpen={addOpen}
                  onAddOpen={() => setAddOpen(true)}
                  onAddClose={() => setAddOpen(false)}
                  onCustomChange={onCustomChange}
                  year={year}
                  monthIndex={monthIndex}
                  showAdd
                />
              ) : celebrations.length === 0 ? (
                <p className="muted schedule-celebrations-flip__empty soft-panel__empty">
                  Nothing this month.
                </p>
              ) : (
                <ScheduleFunCelebrationList celebrations={celebrations} />
              )}
            </div>
            <div className="schedule-flip__calendar-footer schedule-celebrations-flip__footer">
              <button
                type="button"
                className={`schedule-flip__gigs-flip-btn${embedded ? ' schedule-flip__gigs-flip-btn--soft' : ''}`}
                onClick={() => setShowWeeks(true)}
                disabled={!embedded && !canFlip}
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
          <div className="schedule-flip__back-top schedule-celebrations-flip__back-top">
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
              <p className="muted schedule-flip__list-empty soft-panel__empty">No prep weeks this month.</p>
            ) : (
              <ul className="schedule-celebrations-flip__week-list schedule-celebrations-flip__week-list--soft">
                {byActivityWeek.map((week) => (
                  <li key={week.weekStartISO} className="schedule-celebrations-flip__week-block">
                    <h3 className="schedule-celebrations-flip__week-label muted">
                      Week of {week.weekLabel}
                    </h3>
                    <ul className="thanks__list thanks__list--flush schedule-do-fun-prep-list">
                      {week.celebrations.map((celebration, index) => (
                        <li key={celebration.id} className="thanks__item schedule-do-fun-prep-item">
                          <div className="thanks__item-head">
                            <span className="thanks__item-icon" aria-hidden>
                              {softCardIcon(index)}
                            </span>
                            <strong className="thanks__item-title">{celebration.title}</strong>
                          </div>
                          {celebration.activities.length > 0 ? (
                            <ul className="schedule-do-fun-prep-item__todos">
                              {celebration.activities.map((act) => (
                                <li key={act}>{act}</li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="schedule-flip__calendar-footer schedule-celebrations-flip__footer">
            <button
              type="button"
              className={`schedule-flip__gigs-flip-btn${embedded ? ' schedule-flip__gigs-flip-btn--soft' : ''}`}
              onClick={() => setShowWeeks(false)}
              aria-expanded={showWeeks}
              aria-label="Back to celebration list"
            >
              <span className="schedule-flip__gigs-flip-btn-label">← Back to list</span>
            </button>
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
  const [addOpen, setAddOpen] = useState(false)
  const [customRev, setCustomRev] = useState(0)

  const monthTitle = useMemo(() => monthCelebrationsTitle(monthIndex, year), [monthIndex, year])
  const todayIso = useMemo(() => toISODateLocal(new Date()), [])
  const celebrations = useMemo(() => {
    void customRev
    return upcomingCelebrationsInMonth(year, monthIndex, todayIso)
  }, [year, monthIndex, todayIso, customRev])
  const byActivityWeek = useMemo(() => {
    void customRev
    return celebrations.length > 0
      ? celebrationsByActivityWeekInMonth(year, monthIndex, todayIso)
      : celebrationsByActivityWeekForMonth(year, monthIndex)
  }, [year, monthIndex, todayIso, celebrations.length, customRev])

  useEffect(() => {
    setShowWeeks(false)
    setAddOpen(false)
  }, [year, monthIndex])

  useEffect(() => {
    const refresh = () => setCustomRev((r) => r + 1)
    window.addEventListener(CUSTOM_CELEBRATIONS_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CUSTOM_CELEBRATIONS_UPDATED_EVENT, refresh)
  }, [])

  return (
    <section
      className={`schedule-celebrations-flip schedule-celebrations-flip--embedded schedule-fun-flip schedule-flip schedule-calendar-flip${embedded ? ' schedule-calendar-flip--embedded schedule-celebrations-flip--soft' : ''}`}
      aria-label={`Do fun list for ${monthTitle}`}
    >
      <CelebrationsFlipFaces
        showWeeks={showWeeks}
        setShowWeeks={setShowWeeks}
        monthTitle={monthTitle}
        celebrations={celebrations}
        byActivityWeek={byActivityWeek}
        embedded={embedded}
        year={year}
        monthIndex={monthIndex}
        addOpen={addOpen}
        setAddOpen={setAddOpen}
        onCustomChange={() => setCustomRev((r) => r + 1)}
      />
    </section>
  )
}
