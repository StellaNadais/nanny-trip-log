import GroceryListPanel from './GroceryListPanel'
import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel } from './TodaySoftPanel'

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
      title="Grocery"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="grocery-popup-title"
        eyebrow="Weekly list"
        title="Grocery"
        meta={weekLabel}
        lede="Add items for the week — check them off as you shop."
      >
        <GroceryListPanel
          items={items}
          onAddItems={onAddItems}
          onToggle={onToggle}
          onRemove={onRemove}
          autoFocus={open}
          placeholder="Milk, bananas, diapers…"
          flush
        />
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
