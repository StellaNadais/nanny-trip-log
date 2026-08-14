/** Simple clickable box for Schedule overview. */
export default function ScheduleOverviewListTile({
  monthLabel,
  queueCount,
  confirmedCount,
  onClick,
}) {
  const queueLabel = queueCount === 1 ? '1 request' : `${queueCount} requests`
  const confirmedLabel = confirmedCount === 1 ? '1 confirmed' : `${confirmedCount} confirmed`

  return (
    <button type="button" className="schedule-click-box schedule-click-box--overview" onClick={onClick}>
      <span>Overview</span>
      <small>
        {monthLabel} · {queueLabel} · {confirmedLabel}
      </small>
    </button>
  )
}
