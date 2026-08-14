import GroceryListPanel from './GroceryListPanel'
import ParentRemindersPanel from './ParentRemindersPanel'
import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel, TodaySoftSection } from './TodaySoftPanel'

export default function RemindersModal({
  open,
  onClose,
  dateLabel,
  groups,
  groceryItems = [],
  onAddGrocery,
  onToggleGrocery,
  onRemoveGrocery,
  errandItems = [],
  onAddErrand,
  onToggleErrand,
  onRemoveErrand,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="Quick tasks"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="quick-tasks-popup-title"
        eyebrow="Today"
        title="Quick tasks"
        meta={dateLabel}
        lede="Family notes, errands, and this week’s grocery list."
      >
        <TodaySoftSection title="From parents" titleId="quick-tasks-reminders-label">
          <ParentRemindersPanel
            groups={groups}
            emptyHint="No family notes yet for this day."
            flush
          />
        </TodaySoftSection>
        <GroceryListPanel
          items={errandItems}
          onAddItems={onAddErrand}
          onToggle={onToggleErrand}
          onRemove={onRemoveErrand}
          placeholder="Dry cleaning, post office, return package…"
          addTitle="Errands"
          listTitle="To do"
          idPrefix="errands"
          flush
        />
        <GroceryListPanel
          items={groceryItems}
          onAddItems={onAddGrocery}
          onToggle={onToggleGrocery}
          onRemove={onRemoveGrocery}
          placeholder="Milk, bananas, diapers…"
          addTitle="Grocery"
          listTitle="To get"
          idPrefix="grocery"
          flush
        />
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
