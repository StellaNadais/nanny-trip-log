import ScheduleFunCelebrationList from './ScheduleFunCelebrationList'

/** List preview for the Schedule Do fun workspace tile. */
export default function ScheduleFunListTile({ monthLabel, celebrations, onClick }) {
  const preview = celebrations.slice(0, 4)
  const countLabel =
    celebrations.length === 1 ? '1 celebration' : `${celebrations.length} celebrations`

  return (
    <button type="button" className="schedule-board-tile schedule-board-tile--fun" onClick={onClick}>
      <div className="schedule-board-tile__head">
        <span className="schedule-board-tile__eyebrow">Holidays & ideas</span>
        <p className="schedule-board-tile__title">{monthLabel}</p>
        <p className="schedule-board-tile__meta muted">{countLabel}</p>
      </div>

      <ScheduleFunCelebrationList celebrations={preview} compact board />

      {celebrations.length > preview.length ? (
        <span className="schedule-board-tile__footer muted">
          + {celebrations.length - preview.length} more — tap to open
        </span>
      ) : (
        <span className="schedule-board-tile__cta">Open Do fun →</span>
      )}
    </button>
  )
}
