import { useEffect, useMemo, useState } from 'react'
import GroceryListPanel from './GroceryListPanel'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal, weekDaysFromMonday } from '../utils/dates'
import { CLOUD_DATA_APPLIED_EVENT } from '../utils/cloudSync'
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
import { bookingsForCareDate } from '../utils/parentReminderQueries'
import { useBookings } from '../hooks/useBookings'
import { useParentReminders } from '../hooks/useParentReminders'

function defaultNoteDateISO(weekStart) {
  const todayIso = toISODateLocal(new Date())
  const days = weekDaysFromMonday(weekStart)
  if (days.some((d) => d.iso === todayIso)) return todayIso
  return toISODateLocal(weekStart)
}

function formatNoteDay(iso) {
  if (!iso) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Parent portal: add errands, grocery, and day notes anytime — syncs to the caregiver workbook.
 */
export default function BookTasksPanel() {
  const { bookings } = useBookings()
  const { reminders, addReminder, removeReminder } = useParentReminders()
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [noteDateISO, setNoteDateISO] = useState(() => defaultNoteDateISO(startOfWeekMonday(new Date())))
  const [noteText, setNoteText] = useState('')
  const [noteChild, setNoteChild] = useState('')
  const [listTick, setListTick] = useState(0)

  const weekKey = useMemo(() => toISODateLocal(weekStart), [weekStart])
  const weekDays = useMemo(() => weekDaysFromMonday(weekStart), [weekStart])

  const groceryItems = useMemo(() => {
    void listTick
    return loadShoppingForWeek(weekKey)
  }, [weekKey, listTick])

  const errandItems = useMemo(() => {
    void listTick
    return loadErrandsForWeek(weekKey)
  }, [weekKey, listTick])

  useEffect(() => {
    const refresh = () => setListTick((n) => n + 1)
    window.addEventListener(CLOUD_DATA_APPLIED_EVENT, refresh)
    return () => window.removeEventListener(CLOUD_DATA_APPLIED_EVENT, refresh)
  }, [])

  const selectedNoteDate = weekDays.some((d) => d.iso === noteDateISO)
    ? noteDateISO
    : defaultNoteDateISO(weekStart)

  const weekReminders = useMemo(() => {
    const ids = new Set(weekDays.map((d) => d.iso))
    return reminders
      .filter((r) => ids.has(r.dateISO))
      .sort((a, b) => {
        const byDate = (a.dateISO || '').localeCompare(b.dateISO || '')
        if (byDate !== 0) return byDate
        return (b.createdAt || '').localeCompare(a.createdAt || '')
      })
  }, [reminders, weekDays])

  function bumpLists() {
    setListTick((n) => n + 1)
  }

  function shiftWeek(delta) {
    setWeekStart((w) => addDays(w, delta * 7))
  }

  function handleAddNote(e) {
    e.preventDefault()
    const text = noteText.trim()
    if (!text || !selectedNoteDate) return
    const covering = bookingsForCareDate(bookings, selectedNoteDate)[0]
    addReminder({
      bookingId: covering?.id || '',
      dateISO: selectedNoteDate,
      text,
      childName: noteChild,
    })
    setNoteText('')
    setNoteChild('')
  }

  return (
    <section className="soft-panel soft-panel--book-tasks" aria-labelledby="book-tasks-heading">
      <div className="soft-panel__hero">
        <p className="soft-panel__eyebrow">Live list</p>
        <h2 id="book-tasks-heading" className="soft-panel__title">
          Errands & notes
        </h2>
        <p className="soft-panel__lede">
          Add errands, grocery, or a note anytime. It shows up on your caregiver&apos;s Today page.
        </p>
      </div>

      <div className="soft-panel__body book-tasks-panel__body">
        <div className="book-tasks-panel__week" aria-label="Pick a week">
          <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftWeek(-1)}>
            ← Prev
          </button>
          <p className="book-tasks-panel__week-range" aria-live="polite">
            {formatWeekRange(weekStart)}
          </p>
          <button type="button" className="btn btn--ghost trip-log__week-btn" onClick={() => shiftWeek(1)}>
            Next →
          </button>
        </div>

        <GroceryListPanel
          items={errandItems}
          onAddItems={(raw) => {
            addErrandItems(weekKey, raw)
            bumpLists()
          }}
          onToggle={(id) => {
            toggleErrandItem(weekKey, id)
            bumpLists()
          }}
          onRemove={(id) => {
            removeErrandItem(weekKey, id)
            bumpLists()
          }}
          placeholder="Ice cream at Lords, dry cleaning, return package…"
          addTitle="Errands"
          listTitle="To do"
          idPrefix="book-errands"
        />

        <GroceryListPanel
          items={groceryItems}
          onAddItems={(raw) => {
            addShoppingItems(weekKey, raw)
            bumpLists()
          }}
          onToggle={(id) => {
            toggleShoppingItem(weekKey, id)
            bumpLists()
          }}
          onRemove={(id) => {
            removeShoppingItem(weekKey, id)
            bumpLists()
          }}
          placeholder="Milk, fruit, diapers…"
          addTitle="Grocery"
          listTitle="To get"
          idPrefix="book-grocery"
        />

        <div className="book-tasks-panel__notes">
          <span className="book-modal__block-title">Note for caregiver</span>
          <p className="book-reminders-field__lede muted">
            Pickup times, meds, Lords ice cream, or anything else for a specific day.
          </p>
          <form className="book-tasks-panel__note-form" onSubmit={handleAddNote}>
            <label className="field-block">
              <span className="field-block__label">Day</span>
              <select
                className="input input--line"
                value={selectedNoteDate}
                onChange={(e) => setNoteDateISO(e.target.value)}
              >
                {weekDays.map((d) => (
                  <option key={d.iso} value={d.iso}>
                    {d.label} · {formatNoteDay(d.iso)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-block">
              <span className="field-block__label">Child (optional)</span>
              <input
                type="text"
                className="input input--line"
                value={noteChild}
                onChange={(e) => setNoteChild(e.target.value)}
                placeholder="All kids"
                autoComplete="off"
              />
            </label>
            <label className="field-block book-tasks-panel__note-text">
              <span className="field-block__label">Note</span>
              <input
                type="text"
                className="input input--line"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Early pickup, ice cream at Lords"
                maxLength={500}
                autoComplete="off"
              />
            </label>
            <button type="submit" className="btn btn--primary btn--work-primary" disabled={!noteText.trim()}>
              Add note
            </button>
          </form>

          {weekReminders.length === 0 ? (
            <p className="muted book-tasks-panel__empty">No notes yet this week.</p>
          ) : (
            <ul className="book-tasks-panel__note-list">
              {weekReminders.map((row) => (
                <li key={row.id} className="book-tasks-panel__note-row">
                  <div className="book-tasks-panel__note-copy">
                    <span className="book-tasks-panel__note-day">{formatNoteDay(row.dateISO)}</span>
                    {row.childName ? (
                      <span className="book-tasks-panel__note-child muted">{row.childName}</span>
                    ) : null}
                    <span className="book-tasks-panel__note-body">{row.text}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    onClick={() => removeReminder(row.id)}
                    aria-label={`Remove note: ${row.text}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="soft-panel__footer">Lists and notes sync with your caregiver&apos;s workbook in real time.</p>
    </section>
  )
}
