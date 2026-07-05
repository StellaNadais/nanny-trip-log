import { useEffect, useMemo, useState } from 'react'
import BookRemindersField from './BookRemindersField'
import GroceryListPanel from './GroceryListPanel'
import { startOfWeekMonday, toISODateLocal } from '../utils/dates'
import {
  addShoppingItems,
  loadShoppingForWeek,
  removeShoppingItem,
  toggleShoppingItem,
} from '../utils/journalShoppingStorage'

/**
 * After a gig is scheduled, parents can add grocery items and day reminders.
 * @param {{
 *   open: boolean
 *   booking: { id: string, dateISO: string, careEndDateISO: string, familyName?: string } | null
 *   onClose: () => void
 *   onDone: (reminderRows: { dateISO: string, childName: string, text: string }[]) => void
 * }} props
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

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
    <div
      className="book-modal book-follow-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-follow-up-title"
    >
      <button
        type="button"
        className="book-modal__backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="book-modal__sheet book-follow-up__sheet">
        <div className="book-modal__head">
          <div className="book-modal__head-text">
            <p className="book-modal__eyebrow">Request sent</p>
            <h2 id="book-follow-up-title" className="book-modal__title">
              Grocery & reminders
            </h2>
            <p className="book-modal__date">{dateLabel}</p>
            <p className="book-modal__sub muted">
              Optional — add a grocery list and day notes for your caregiver. You can skip and
              come back anytime.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost book-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="book-follow-up__body">
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

        <div className="book-modal__actions book-follow-up__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Skip for now
          </button>
          <button type="button" className="btn btn--primary btn--work-primary" onClick={handleDone}>
            Save & done
          </button>
        </div>
      </div>
    </div>
  )
}
