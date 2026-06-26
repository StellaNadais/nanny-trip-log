import GroceryListPanel from './GroceryListPanel'
import TodayPanelModal from './TodayPanelModal'

export default function GroceryModal({
  open,
  onClose,
  weekLabel,
  items,
  onAddItems,
  onToggle,
  onRemove,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="Weekly list"
      title="Grocery"
      dateLabel={weekLabel}
    >
      <GroceryListPanel
        items={items}
        onAddItems={onAddItems}
        onToggle={onToggle}
        onRemove={onRemove}
        autoFocus={open}
        placeholder="Milk, bananas, diapers…"
      />
    </TodayPanelModal>
  )
}
