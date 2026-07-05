import { useEffect, useMemo, useState } from 'react'
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

/**
 * After a gig is scheduled, parents can add grocery items and day reminders.
 */
export default function BookFollowUpModal({ open, booking, onClose, onDone }) {
  const weekKey = useMemo(() => {
    if (!booking?.dateISO) return ''
    return toISODateLocal(startOfWeekMonday(new Date(`${booking.dateISO}T12:00:00`)))
  }, [booking?.dateISO])

  const [groceryItems, setGroceryItems] = useState([])
  const [reminders, setReminders] = useState([])

  useEffect(() => {
    if (!open || !weekKey) return
    setGroceryItems(loadShoppingForWeek(weekKey))
    setReminders([])
  }, [open, weekKey, booking?.id])

  if (!open || !booking) return null

  function handleAddGrocery(raw) {
    setGroceryItems(addShoppingItems(weekKey, raw))
  }

  function handleToggleGrocery(id) {
    setGroceryItems(toggleShoppingItem(weekKey, id))
  }

  function handleRemoveGrocery(id) {
    setGroceryItems(removeShoppingItem(weekKey, id))
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
      open={open}
      onClose={onClose}
      title="Grocery & reminders"
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
            Grocery & reminders
          </h2>
          <p className="soft-panel__meta muted">{dateLabel}</p>
          <p className="soft-panel__lede">
            Optional — add a grocery list and day notes for your caregiver. You can skip and come
            back anytime.
          </p>
        </div>

        <div className="soft-panel__body soft-panel__body--booking">
          <div className="book-follow-up__section">
            <GroceryListPanel
              items={groceryItems}
              onAddItems={handleAddGrocery}
              onToggle={handleToggleGrocery}
              onRemove={handleRemoveGrocery}
              autoFocus
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
