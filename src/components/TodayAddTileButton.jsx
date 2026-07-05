/** Dashed “+” tile to add a new custom Today board box. */
export default function TodayAddTileButton({ onClick }) {
  return (
    <button type="button" className="today-add-tile" onClick={onClick}>
      <span className="today-add-tile__ico" aria-hidden>
        +
      </span>
      <span className="today-add-tile__label">Add box</span>
      <span className="today-add-tile__hint muted">Notes, GIFs, links, ideas…</span>
    </button>
  )
}
