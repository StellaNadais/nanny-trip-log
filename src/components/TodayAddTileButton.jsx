/** List row to add a new custom Today board box. */
export default function TodayAddTileButton({ onClick }) {
  return (
    <button type="button" className="today-add-tile-row" onClick={onClick}>
      <div className="today-add-tile-row__head">
        <span className="today-add-tile-row__icon" aria-hidden>
          +
        </span>
        <strong className="today-add-tile-row__title">Add box</strong>
      </div>
      <p className="today-add-tile-row__hint muted">Notes, GIFs, links, ideas…</p>
      <span className="today-add-tile-row__cta">Choose type →</span>
    </button>
  )
}
