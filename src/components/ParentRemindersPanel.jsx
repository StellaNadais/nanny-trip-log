/**
 * Caregiver view: parent reminders for the selected journal day, grouped by family.
 */
export default function ParentRemindersPanel({ dateLabel, groups, emptyHint, flush = false }) {
  if (!groups.length) {
    return (
      <div className={`parent-reminders-panel${flush ? ' parent-reminders-panel--flush' : ''}`}>
        <p className="soft-panel__empty muted">{emptyHint}</p>
      </div>
    )
  }

  const listClass = flush
    ? 'thanks__list thanks__list--flush parent-reminders-panel__list--flush'
    : 'parent-reminders-panel__groups'

  return (
    <div className={`parent-reminders-panel${flush ? ' parent-reminders-panel--flush' : ''}`}>
      {!flush && dateLabel ? <p className="parent-reminders-panel__day muted">{dateLabel}</p> : null}
      <ul className={listClass}>
        {groups.map((group) => (
          <li
            key={group.booking.id}
            className={flush ? 'thanks__item parent-reminders-panel__item--flush' : 'parent-reminders-panel__group'}
          >
            <header
              className={
                flush ? 'thanks__item-head parent-reminders-panel__head--flush' : 'parent-reminders-panel__group-head'
              }
            >
              <strong
                className={flush ? 'thanks__item-title parent-reminders-panel__family' : 'parent-reminders-panel__family'}
              >
                {group.booking.familyName || 'Family'}
              </strong>
              {group.kidsLabel ? (
                <span className="parent-reminders-panel__kids muted">{group.kidsLabel}</span>
              ) : null}
              {group.statusLabel ? (
                <span
                  className={`parent-reminders-panel__status parent-reminders-panel__status--${group.booking.responseStatus || 'pending'}`}
                >
                  {group.statusLabel}
                </span>
              ) : null}
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
