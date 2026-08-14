import { removeCustomCelebration } from '../utils/customCelebrationsStorage'
import DoFunAddForm from './DoFunAddForm'

/** Flush celebration list — shared by Do fun modal and board tile. */
export default function ScheduleFunCelebrationList({
  celebrations,
  compact = false,
  addOpen = false,
  onAddOpen,
  onAddClose,
  onCustomChange,
  year,
  monthIndex,
  showAdd = false,
  board = false,
}) {
  if (!celebrations.length && compact) {
    return (
      <p className={board ? 'schedule-board-tile__empty muted' : 'soft-panel__empty muted schedule-do-fun-list__empty'}>
        Nothing this month — tap to open.
      </p>
    )
  }

  const listClass = board
    ? 'workspace-board-list workspace-board-list--flush schedule-do-fun-list'
    : 'thanks__list thanks__list--flush schedule-do-fun-list'
  const itemClass = board ? 'workspace-board-list__item schedule-do-fun-item' : 'thanks__item schedule-do-fun-item'
  const headClass = board ? 'workspace-board-list__head schedule-do-fun-item__head' : 'thanks__item-head schedule-do-fun-item__head'
  const titleClass = board ? 'workspace-board-list__title' : 'thanks__item-title'
  const noteClass = board ? 'workspace-board-list__note muted' : 'thanks__item-note muted'

  return (
    <>
      {celebrations.length === 0 && !compact ? (
        <p className="soft-panel__empty muted schedule-do-fun-list__empty">Nothing this month.</p>
      ) : (
        <ul className={listClass}>
          {celebrations.map((celebration) => (
            <li key={celebration.id} className={itemClass}>
              <div className={headClass}>
                <strong className={titleClass}>{celebration.title}</strong>
                <time className="schedule-do-fun-item__date muted" dateTime={celebration.dateISO}>
                  {celebration.dateLabel}
                </time>
                {!compact && celebration.custom ? (
                  <button
                    type="button"
                    className="schedule-do-fun-item__remove"
                    onClick={() => {
                      removeCustomCelebration(celebration.id)
                      onCustomChange?.()
                    }}
                    aria-label={`Remove ${celebration.title}`}
                  >
                    ×
                  </button>
                ) : null}
              </div>
              {celebration.theme ? <p className={noteClass}>{celebration.theme}</p> : null}
            </li>
          ))}
        </ul>
      )}

      {!compact && showAdd ? (
        <div className="schedule-do-fun-add">
          {addOpen ? (
            <DoFunAddForm
              year={year}
              monthIndex={monthIndex}
              onAdded={() => {
                onAddClose?.()
                onCustomChange?.()
              }}
              onCancel={() => onAddClose?.()}
            />
          ) : (
            <button
              type="button"
              className="schedule-do-fun-add__btn"
              onClick={() => onAddOpen?.()}
              aria-expanded={addOpen}
            >
              Add more fun
            </button>
          )}
        </div>
      ) : null}
    </>
  )
}
