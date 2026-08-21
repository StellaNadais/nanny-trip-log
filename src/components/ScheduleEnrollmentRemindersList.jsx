import { enrollmentRemindersForMonth } from '../data/classEnrollmentReminders'

/** Soft-panel list of school-year class / camp enrollment look windows for a month. */
export default function ScheduleEnrollmentRemindersList({ monthIndex }) {
  const reminders = enrollmentRemindersForMonth(monthIndex)

  if (reminders.length === 0) {
    return (
      <p className="soft-panel__empty muted schedule-do-fun-list__empty">
        No enrollment windows this month — check back next season.
      </p>
    )
  }

  return (
    <ul className="thanks__list thanks__list--flush schedule-enrollment-list">
      {reminders.map((reminder) => (
        <li key={reminder.id} className="thanks__item schedule-enrollment-item">
          <div className="thanks__item-head schedule-do-fun-item__head">
            <strong className="thanks__item-title">{reminder.title}</strong>
            <span className="schedule-do-fun-item__date muted">{reminder.windowLabel}</span>
          </div>
          <p className="thanks__item-note muted schedule-do-fun-item__note">{reminder.detail}</p>
        </li>
      ))}
    </ul>
  )
}
