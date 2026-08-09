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
      eyebrow="Parent notes & weekly shopping"
      title="Notes & reminders"
      dateLabel={dateLabel}
    >
      <div className="reminders-modal__sections">
        <section className="reminders-modal__section" aria-labelledby="parent-reminders-heading">
          <h3 id="parent-reminders-heading" className="reminders-modal__section-title">
            Parent notes &amp; reminders
          </h3>
          <ParentRemindersPanel
            dateLabel={dateLabel}
            groups={groups}
            emptyHint="No family is scheduled this day, or there are no parent notes or reminders yet."
          />
        </section>

        <section className="reminders-modal__section" aria-labelledby="grocery-reminders-heading">
          <div>
            <h3 id="grocery-reminders-heading" className="reminders-modal__section-title">
              Grocery list
            </h3>
            <p className="reminders-modal__section-hint muted">Shared shopping notes for this week.</p>
          </div>
          <GroceryListPanel
            items={shoppingItems}
            onAddItems={onAddShoppingItems}
            onToggle={onToggleShopping}
            onRemove={onRemoveShopping}
            autoFocus={open}
            placeholder="avocado, oatmilk, bread…"
          />
        </section>
      </div>
    </TodayPanelModal>
  )
}
