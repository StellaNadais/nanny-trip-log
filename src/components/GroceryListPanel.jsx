import { useEffect, useMemo, useRef, useState } from 'react'

export default function GroceryListPanel({
  items,
  onAddItems,
  onToggle,
  onRemove,
  autoFocus = false,
  placeholder = 'Milk, bananas, diapers…',
  flush = false,
  addTitle = 'Add items',
  listTitle = 'To get',
  idPrefix = 'grocery',
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const addLabelId = `${idPrefix}-add-label`
  const listLabelId = `${idPrefix}-list-label`
  const inputId = `${idPrefix}-add-input`

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

  const sectionClass = flush ? 'today-soft-section' : 'journal-mood-bar journal-panel about-today-modal__section'
  const headClass = flush ? 'today-soft-section__head' : 'journal-mood-bar__head'
  const titleClass = flush ? 'today-soft-section__title' : 'journal-mood-bar__title'
  const bodyClass = flush ? 'today-soft-section__body' : 'journal-mood-bar__track journal-panel__body'
  const fieldClass = flush ? 'today-soft-field' : 'journal-panel-field'
  const fieldLabelClass = flush ? 'today-soft-field__label' : 'journal-panel-field__label'
  const inputClass = flush
    ? 'input input--line today-soft-field__input grocery-list-panel__input'
    : 'input input--line journal-panel-field__input grocery-list-panel__input'

  return (
    <>
      <section
        className={`${sectionClass}${flush ? ' journal-panel--meals' : ' journal-panel journal-panel--meals'}`}
        aria-labelledby={addLabelId}
      >
        <div className={headClass}>
          <span className={titleClass} id={addLabelId}>
            {addTitle}
          </span>
        </div>
        <div className={bodyClass}>
          <form className="grocery-list-panel__composer" onSubmit={onSubmit}>
            <label className={fieldClass} htmlFor={inputId}>
              <span className={fieldLabelClass}>Item</span>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                className={inputClass}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                placeholder={placeholder}
                aria-labelledby={addLabelId}
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
        className={`${sectionClass}${flush ? '' : ' journal-panel journal-panel--about'}`}
        aria-labelledby={listLabelId}
      >
        <div className={headClass}>
          <span className={titleClass} id={listLabelId}>
            {listTitle}
            {openCount > 0 ? (
              <span className="grocery-list-panel__open-count muted"> · {openCount}</span>
            ) : null}
          </span>
        </div>
        <div className={bodyClass}>
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
