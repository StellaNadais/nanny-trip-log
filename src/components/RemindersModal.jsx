import ParentRemindersPanel from './ParentRemindersPanel'
import GroceryListPanel from './GroceryListPanel'
import TodayPanelModal from './TodayPanelModal'

export default function RemindersModal({
  open,
  onClose,
  dateLabel,
  groups,
  shoppingItems,
  onAddShoppingItems,
  onToggleShopping,
  onRemoveShopping,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="Parents & weekly shopping"
      title="Reminders"
      dateLabel={dateLabel}
    >
      <div className="reminders-modal__sections">
        <section className="reminders-modal__section" aria-labelledby="parent-reminders-heading">
          <h3 id="parent-reminders-heading" className="reminders-modal__section-title">
            From parents
          </h3>
          <ParentRemindersPanel
            dateLabel={dateLabel}
            groups={groups}
            emptyHint="No family scheduled this day, or no reminders yet."
          />
        </section>

        <section className="reminders-modal__section" aria-labelledby="grocery-reminders-heading">
          <div>
            <h3 id="grocery-reminders-heading" className="reminders-modal__section-title">
              Grocery list
            </h3>
            <p className="reminders-modal__section-hint muted">Shared shopping reminders for this week.</p>
          </div>
          <GroceryListPanel
            items={shoppingItems}
            onAddItems={onAddShoppingItems}
            onToggle={onToggleShopping}
            onRemove={onRemoveShopping}
            autoFocus={open}
            placeholder="Milk, bananas, diapers…"
          />
        </section>
      </div>
    </TodayPanelModal>
  )
}
