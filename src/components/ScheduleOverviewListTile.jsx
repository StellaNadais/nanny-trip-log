import ScheduleOverviewRequestList from './ScheduleOverviewRequestList'

/** Wide list preview for the Schedule overview workspace tile. */
export default function ScheduleOverviewListTile({
  monthLabel,
  queueCount,
  confirmedCount,
  upcoming,
  onClick,
}) {
  const preview = upcoming.slice(0, 4)
  const queueLabel = queueCount === 1 ? '1 request' : `${queueCount} requests`
  const confirmedLabel = confirmedCount === 1 ? '1 confirmed' : `${confirmedCount} confirmed`

  return (
    <button type="button" className="schedule-board-tile schedule-board-tile--overview" onClick={onClick}>
      <div className="schedule-board-tile__head">
        <span className="schedule-board-tile__eyebrow">This month</span>
        <p className="schedule-board-tile__title">{monthLabel}</p>
        <p className="schedule-board-tile__meta muted">
          {queueLabel} · {confirmedLabel}
        </p>
      </div>

      {preview.length === 0 ? (
        <p className="schedule-board-tile__empty muted">No requests yet — tap to open overview.</p>
      ) : (
        <ScheduleOverviewRequestList upcoming={preview} compact board />
      )}

      {upcoming.length > preview.length ? (
        <span className="schedule-board-tile__footer muted">
          + {upcoming.length - preview.length} more — tap to open
        </span>
      ) : (
        <span className="schedule-board-tile__cta">Open overview →</span>
      )}
    </button>
  )
}
