/**
 * Caregiver view: parent reminders for the selected journal day, grouped by family.
 */
export default function ParentRemindersPanel({ dateLabel, groups, emptyHint }) {
  if (!groups.length) {
    return (
      <div className="parent-reminders-panel">
        <p className="parent-reminders-panel__empty muted">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="parent-reminders-panel">
      <p className="parent-reminders-panel__day muted">{dateLabel}</p>
      <ul className="parent-reminders-panel__groups">
        {groups.map((group) => (
          <li key={group.booking.id} className="parent-reminders-panel__group">
            <header className="parent-reminders-panel__group-head">
              <strong className="parent-reminders-panel__family">
                {group.booking.familyName || 'Family'}
              </strong>
              <span className="parent-reminders-panel__kids muted">{group.kidsLabel}</span>
              <span
                className={`parent-reminders-panel__status parent-reminders-panel__status--${group.booking.responseStatus || 'pending'}`}
              >
                {group.statusLabel}
              </span>
              {group.careWindow ? (
                <span className="parent-reminders-panel__window muted">{group.careWindow}</span>
              ) : null}
            </header>

            {group.notes ? (
              <p className="parent-reminders-panel__notes">
                <span className="parent-reminders-panel__notes-label">Notes</span>
                {group.notes}
              </p>
            ) : null}

            {group.reminders.length > 0 ? (
              <ul className="parent-reminders-panel__list">
                {group.reminders.map((reminder) => (
                  <li key={reminder.id} className="parent-reminders-panel__item">
                    {reminder.childName ? (
                      <span className="parent-reminders-panel__child">{reminder.childName}</span>
                    ) : (
                      <span className="parent-reminders-panel__child parent-reminders-panel__child--all">
                        All kids
                      </span>
                    )}
                    <span className="parent-reminders-panel__text">{reminder.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
