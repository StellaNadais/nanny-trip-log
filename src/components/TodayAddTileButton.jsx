/** Schedule-style click box to add a custom Today board tile. */
export default function TodayAddTileButton({ onClick }) {
  return (
    <button type="button" className="schedule-click-box schedule-click-box--backpack" onClick={onClick}>
      <span>Add box</span>
      <small>Notes, GIFs, links, ideas…</small>
    </button>
  )
}
