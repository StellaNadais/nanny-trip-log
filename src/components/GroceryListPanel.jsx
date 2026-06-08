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
    <div className="grocery-list-panel">
      <form className="grocery-list-panel__composer" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="input grocery-list-panel__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          aria-label="Add grocery item"
          enterKeyHint="done"
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary grocery-list-panel__add" disabled={!draft.trim()}>
          Add
        </button>
      </form>
      <p className="grocery-list-panel__hint muted">Press Enter to add · paste a comma or line list</p>
      <ul className="grocery-list-panel__list">
        {sorted.length === 0 ? (
          <li className="grocery-list-panel__empty muted">Nothing yet — type above and hit Enter.</li>
        ) : (
          sorted.map((t) => (
            <li key={t.id} className={`grocery-list-panel__row${t.done ? ' grocery-list-panel__row--done' : ''}`}>
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
  )
}
