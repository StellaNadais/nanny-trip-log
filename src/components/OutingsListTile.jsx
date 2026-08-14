/** Schedule-style click box for Today Outings. */
export default function OutingsListTile({ onClick }) {
  return (
    <button type="button" className="schedule-click-box schedule-click-box--fun" onClick={onClick}>
      <span>Outings</span>
      <small>Expenses &amp; mileage</small>
    </button>
  )
}
