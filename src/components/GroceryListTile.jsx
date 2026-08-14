/** Wide list preview for grocery workspace box (legacy). */
export default function GroceryListTile({ weekLabel, items, onClick }) {
  const open = items.filter((item) => !item.done).length
  const countLabel = open === 1 ? '1 to get' : `${open} to get`

  return (
    <button type="button" className="schedule-click-box" onClick={onClick}>
      <span>Grocery</span>
      <small>
        {weekLabel} · {countLabel}
      </small>
    </button>
  )
}
