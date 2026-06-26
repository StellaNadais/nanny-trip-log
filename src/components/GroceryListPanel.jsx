import { useEffect, useMemo, useRef, useState } from 'react'

export default function GroceryListPanel({
  items,
  onAddItems,
  onToggle,
  onRemove,
  autoFocus = false,
  placeholder = 'Milk, bananas, diapers…',
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const sorted = useMemo(() => {
    const open = items.filter((t) => !t.done)
    const done = items.filter((t) => t.done)
    return [...open, ...done]
  }, [items])

  const openCount = useMemo(() => items.filter((t) => !t.done).length, [items])

  useEffect(() => {
    if (!autoFocus) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(t)
  }, [autoFocus])

  function commitDraft() {
    const raw = draft
    if (!String(raw || '').trim()) return
    onAddItems(raw)
    setDraft('')
    inputRef.current?.focus()
  }

  function onSubmit(e) {
    e.preventDefault()
    commitDraft()
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commitDraft()
    }
  }

  function onPaste(e) {
    const text = e.clipboardData?.getData('text') ?? ''
    if (!/[\n,;]/.test(text)) return
    e.preventDefault()
    onAddItems(text)
    setDraft('')
  }

  return (
    <>
      <section
        className="journal-mood-bar journal-panel journal-panel--meals about-today-modal__section"
        aria-labelledby="grocery-add-label"
      >
        <div className="journal-mood-bar__head">
          <span className="journal-mood-bar__title" id="grocery-add-label">
            Add items
          </span>
        </div>
        <div className="journal-mood-bar__track journal-panel__body">
          <form className="grocery-list-panel__composer" onSubmit={onSubmit}>
            <label className="journal-panel-field" htmlFor="grocery-add-input">
              <span className="journal-panel-field__label">Item</span>
              <input
                ref={inputRef}
                id="grocery-add-input"
                type="text"
                className="input input--line journal-panel-field__input grocery-list-panel__input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                placeholder={placeholder}
                aria-labelledby="grocery-add-label"
                enterKeyHint="done"
                autoComplete="off"
              />
            </label>
            <button
              type="submit"
              className="btn btn--ghost grocery-list-panel__add"
              disabled={!draft.trim()}
            >
              Add to list
            </button>
          </form>
        </div>
      </section>

      <section
        className="journal-mood-bar journal-panel journal-panel--about about-today-modal__section"
        aria-labelledby="grocery-list-label"
      >
        <div className="journal-mood-bar__head">
          <span className="journal-mood-bar__title" id="grocery-list-label">
            To get
            {openCount > 0 ? (
              <span className="grocery-list-panel__open-count muted"> · {openCount}</span>
            ) : null}
          </span>
        </div>
        <div className="journal-mood-bar__track journal-panel__body">
          <ul className="grocery-list-panel__list">
            {sorted.length === 0 ? (
              <li className="grocery-list-panel__empty muted">Nothing on the list yet.</li>
            ) : (
              sorted.map((t) => (
                <li
                  key={t.id}
                  className={`grocery-list-panel__row${t.done ? ' grocery-list-panel__row--done' : ''}`}
                >
                  <label className="grocery-list-panel__check">
                    <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
                    <span className="grocery-list-panel__text">{t.text}</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small grocery-list-panel__remove"
                    onClick={() => onRemove(t.id)}
                    aria-label={`Remove ${t.text}`}
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </>
  )
}
