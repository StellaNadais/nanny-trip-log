import { useState } from 'react'
import { addCustomCelebration } from '../utils/customCelebrationsStorage'

/** Inline form to add a custom Do fun celebration for the open calendar month. */
export default function DoFunAddForm({ year, monthIndex, onAdded, onCancel }) {
  const [title, setTitle] = useState('')
  const [day, setDay] = useState('')
  const [theme, setTheme] = useState('')

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    const dayNum = Number.parseInt(day, 10)
    if (!trimmed || !Number.isFinite(dayNum) || dayNum < 1 || dayNum > daysInMonth) return
    addCustomCelebration({
      year,
      month: monthIndex + 1,
      day: dayNum,
      title: trimmed,
      theme: theme.trim(),
      activities: theme.trim() ? [theme.trim()] : [],
    })
    onAdded?.()
    setTitle('')
    setDay('')
    setTheme('')
  }

  return (
    <form className="do-fun-add-form" onSubmit={handleSubmit}>
      <label className="today-soft-field">
        <span className="today-soft-field__label">Title</span>
        <input
          type="text"
          className="input input--line"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cousin visit"
          required
          autoFocus
        />
      </label>
      <label className="today-soft-field today-soft-field--compact">
        <span className="today-soft-field__label">Day</span>
        <input
          type="number"
          min={1}
          max={daysInMonth}
          className="input input--line"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          placeholder="1"
          required
        />
      </label>
      <label className="today-soft-field">
        <span className="today-soft-field__label">Idea (optional)</span>
        <input
          type="text"
          className="input input--line"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Prep note or theme"
        />
      </label>
      <div className="do-fun-add-form__actions">
        <button type="button" className="btn btn--ghost do-fun-add-form__cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary do-fun-add-form__submit">
          Add
        </button>
      </div>
    </form>
  )
}
