/** Simple clickable box for Schedule Do fun. */
export default function ScheduleFunListTile({ monthLabel, celebrations, onClick }) {
  const countLabel =
    celebrations.length === 1 ? '1 celebration' : `${celebrations.length} celebrations`
  const next = celebrations[0]

  return (
    <button type="button" className="schedule-click-box schedule-click-box--fun" onClick={onClick}>
      <span>Do fun</span>
      <small>
        <span className="schedule-click-box__meta">
          {monthLabel} · {countLabel}
        </span>
        {next ? <span className="schedule-click-box__next">{next.title}</span> : null}
      </small>
    </button>
  )
}
