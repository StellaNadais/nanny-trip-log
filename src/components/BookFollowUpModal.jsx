import { useState } from 'react'
import BookRemindersField from './BookRemindersField'
import GroceryListPanel from './GroceryListPanel'
import TodayPanelModal from './TodayPanelModal'
import { startOfWeekMonday, toISODateLocal } from '../utils/dates'
import {
  addShoppingItems,
  loadShoppingForWeek,
  removeShoppingItem,
  toggleShoppingItem,
} from '../utils/journalShoppingStorage'
import {
  addErrandItems,
  loadErrandsForWeek,
  removeErrandItem,
  toggleErrandItem,
} from '../utils/errandsStorage'

function weekKeyFromBooking(booking) {
  if (!booking?.dateISO) return ''
  return toISODateLocal(startOfWeekMonday(new Date(`${booking.dateISO}T12:00:00`)))
}

function BookFollowUpForm({ weekKey, booking, onClose, onDone }) {
  const [groceryItems, setGroceryItems] = useState(() => loadShoppingForWeek(weekKey))
  const [errandItems, setErrandItems] = useState(() => loadErrandsForWeek(weekKey))
  const [reminders, setReminders] = useState([])

  function handleAddGrocery(raw) {
    setGroceryItems(addShoppingItems(weekKey, raw))
  }

  function handleToggleGrocery(id) {
    setGroceryItems(toggleShoppingItem(weekKey, id))
  }

  function handleRemoveGrocery(id) {
    setGroceryItems(removeShoppingItem(weekKey, id))
  }

  function handleAddErrand(raw) {
    setErrandItems(addErrandItems(weekKey, raw))
  }

  function handleToggleErrand(id) {
    setErrandItems(toggleErrandItem(weekKey, id))
  }

  function handleRemoveErrand(id) {
    setErrandItems(removeErrandItem(weekKey, id))
  }

  function handleDone() {
    const reminderRows = reminders
      .map((row) => ({
        dateISO: row.dateISO || booking.dateISO,
        childName: row.childName.trim(),
        text: row.text.trim(),
      }))
      .filter((row) => row.text)
    onDone(reminderRows)
  }

  const dateLabel = new Date(`${booking.dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <TodayPanelModal
      open
      onClose={onClose}
      title="Lists & notes"
      hideHead
      hideFoot
      modalClassName="about-today-modal--book-popup"
    >
      <section
        className="soft-panel soft-panel--book-follow-up soft-panel--book-popup"
        aria-labelledby="book-follow-up-title"
      >
        <div className="soft-panel__hero">
          <p className="soft-panel__eyebrow">Request sent</p>
          <h2 id="book-follow-up-title" className="soft-panel__title">
            Lists & notes
          </h2>
          <p className="soft-panel__meta muted">{dateLabel}</p>
          <p className="soft-panel__lede">
            Optional — add errands, grocery, and day notes for your caregiver. You can skip and come
            back anytime from the Errands tab.
          </p>
        </div>

        <div className="soft-panel__body soft-panel__body--booking">
          <div className="book-follow-up__section">
            <GroceryListPanel
              items={errandItems}
              onAddItems={handleAddErrand}
              onToggle={handleToggleErrand}
              onRemove={handleRemoveErrand}
              autoFocus
              placeholder="Ice cream at Lords, dry cleaning…"
              addTitle="Errands"
              listTitle="To do"
              idPrefix="follow-up-errands"
            />
          </div>

          <div className="book-follow-up__section">
            <GroceryListPanel
              items={groceryItems}
              onAddItems={handleAddGrocery}
              onToggle={handleToggleGrocery}
              onRemove={handleRemoveGrocery}
              placeholder="Milk, fruit, diapers…"
            />
          </div>

          <BookRemindersField
            rows={reminders}
            onChange={setReminders}
            defaultDateISO={booking.dateISO}
            minDateISO={booking.dateISO}
            maxDateISO={booking.careEndDateISO}
            lede="Day-specific notes for this gig — pickup times, meds, routines…"
          />
        </div>

        <div className="soft-panel__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Skip for now
          </button>
          <button type="button" className="btn btn--primary btn--work-primary" onClick={handleDone}>
            Save & done
          </button>
        </div>

        <p className="soft-panel__footer">Lists and notes sync with your caregiver&apos;s workbook.</p>
      </section>
    </TodayPanelModal>
  )
}

/**
 * After a gig is scheduled, parents can add errands, grocery, and day notes.
 */
export default function BookFollowUpModal({ open, booking, onClose, onDone }) {
  if (!open || !booking) return null
  const weekKey = weekKeyFromBooking(booking)
  return (
    <BookFollowUpForm
      key={`${booking.id}-${weekKey}`}
      weekKey={weekKey}
      booking={booking}
      onClose={onClose}
      onDone={onDone}
    />
  )
}

