import { useId } from 'react'

const EMPTY_ROW = { dateISO: '', childName: '', text: '' }

/**
 * Parent adds day-specific reminders while booking a gig.
 * @param {{ rows: { dateISO: string, childName: string, text: string }[], onChange: Function, defaultDateISO: string, minDateISO: string, maxDateISO: string }} props
 */
export default function BookRemindersField({
  rows,
  onChange,
  defaultDateISO,
  minDateISO,
  maxDateISO,
  lede = 'Optional — add notes for specific days or children while you schedule.',
}) {
  const baseId = useId()

  function updateRow(index, patch) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    onChange([...rows, { ...EMPTY_ROW, dateISO: defaultDateISO }])
  }

  function removeRow(index) {
    onChange(rows.filter((_, i) => i !== index))
  }

  return (
    <div className="book-reminders-field">
      <div className="book-reminders-field__head">
        <span className="book-modal__block-title">Reminders for caregiver</span>
        <p className="book-reminders-field__lede muted">
          {lede}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="book-reminders-field__empty muted">No reminders yet.</p>
      ) : (
        <ul className="book-reminders-field__list">
          {rows.map((row, index) => {
            const rowId = `${baseId}-${index}`
            return (
              <li key={rowId} className="book-reminders-field__row">
                <label className="field-block book-reminders-field__date">
                  <span className="field-block__label">Day</span>
                  <input
                    type="date"
                    className="input input--line"
                    value={row.dateISO || defaultDateISO}
                    min={minDateISO}
                    max={maxDateISO}
                    onChange={(e) => updateRow(index, { dateISO: e.target.value })}
                    required
                  />
                </label>
                <label className="field-block book-reminders-field__child">
                  <span className="field-block__label">Child (optional)</span>
                  <input
                    type="text"
                    className="input input--line"
                    value={row.childName}
                    onChange={(e) => updateRow(index, { childName: e.target.value })}
                    placeholder="All kids"
                    autoComplete="off"
                  />
                </label>
                <label className="field-block book-reminders-field__text">
                  <span className="field-block__label">Reminder</span>
                  <input
                    type="text"
                    className="input input--line"
                    value={row.text}
                    onChange={(e) => updateRow(index, { text: e.target.value })}
                    placeholder="e.g. Early pickup at 4pm"
                    maxLength={500}
                    autoComplete="off"
                  />
                </label>
                <button
                  type="button"
                  className="btn btn--ghost book-reminders-field__remove"
                  onClick={() => removeRow(index)}
                  aria-label={`Remove reminder ${index + 1}`}
                >
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button type="button" className="btn btn--ghost book-reminders-field__add" onClick={addRow}>
        + Add reminder
      </button>
    </div>
  )
}
