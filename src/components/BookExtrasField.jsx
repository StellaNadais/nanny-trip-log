import { useId, useState } from 'react'

const KINDS = [
  { id: 'reminder', label: 'Reminder' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'errand', label: 'Errand' },
]

const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label]))

function placeholderFor(kind) {
  if (kind === 'grocery') return 'Milk, fruit, diapers…'
  if (kind === 'errand') return 'Drop off library books, pick up prescription…'
  return 'Early pickup at 4, nap after lunch…'
}

/**
 * Compact + adder under booking notes: reminder, grocery, or errand.
 * Choosing a type opens a notes-sized field.
 */
export default function BookExtrasField({ items, onChange }) {
  const baseId = useId()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState('reminder')
  const [text, setText] = useState('')

  function addItem(e) {
    e?.preventDefault?.()
    const trimmed = text.trim()
    if (!trimmed) return
    const id =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    onChange([...items, { id, kind, text: trimmed }])
    setText('')
    setOpen(false)
  }

  function removeItem(id) {
    onChange(items.filter((item) => item.id !== id))
  }

  function chooseKind(nextKind) {
    setKind(nextKind)
    setOpen(true)
  }

  return (
    <div className="book-extras-field">
      {items.length > 0 ? (
        <ul className="book-extras-field__list" aria-label="Added for caregiver">
          {items.map((item) => (
            <li key={item.id} className="book-extras-field__chip">
              <span className="book-extras-field__chip-kind">{KIND_LABEL[item.kind] || item.kind}</span>
              <span className="book-extras-field__chip-text">{item.text}</span>
              <button
                type="button"
                className="book-extras-field__chip-remove"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${KIND_LABEL[item.kind] || item.kind}: ${item.text}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!open ? (
        <div className="book-extras-field__choices" role="group" aria-label="Add for caregiver">
          <span className="book-extras-field__plus-ico" aria-hidden>
            +
          </span>
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              className="book-extras-field__choice"
              onClick={() => chooseKind(k.id)}
            >
              {k.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="book-extras-field__composer">
          <div className="book-extras-field__composer-top">
            <label className="field-block book-extras-field__kind" htmlFor={`${baseId}-kind`}>
              <span className="field-block__label">Type</span>
              <select
                id={`${baseId}-kind`}
                className="input input--line book-extras-field__kind-select"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field-block book-extras-field__text" htmlFor={`${baseId}-text`}>
            <span className="field-block__label">{KIND_LABEL[kind]} for caregiver</span>
            <textarea
              id={`${baseId}-text`}
              className="input input--area book-modal__notes book-extras-field__area"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholderFor(kind)}
              rows={3}
              maxLength={2000}
              autoComplete="off"
              autoFocus
            />
          </label>

          <div className="book-extras-field__actions">
            <button
              type="button"
              className="btn btn--ghost book-extras-field__cancel"
              onClick={() => {
                setOpen(false)
                setText('')
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary book-extras-field__add-btn"
              onClick={addItem}
              disabled={!text.trim()}
            >
              Add {KIND_LABEL[kind]?.toLowerCase() || 'item'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
