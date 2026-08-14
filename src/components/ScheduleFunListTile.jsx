/** Simple clickable box for Schedule Do fun. */
export default function ScheduleFunListTile({ monthLabel, celebrations, onClick }) {
  const countLabel =
    celebrations.length === 1 ? '1 celebration' : `${celebrations.length} celebrations`

  return (
    <button type="button" className="schedule-click-box schedule-click-box--fun" onClick={onClick}>
      <span>Do fun</span>
      <small>
        {monthLabel} · {countLabel}
      </small>
    </button>
  )
}
