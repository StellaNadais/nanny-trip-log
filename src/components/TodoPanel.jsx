import { useState } from 'react'

export function TodoPanel({
  todos,
  onAdd,
  onToggle,
  onRemove,
  placeholder = 'Add a to-do or reminder…',
  emptyMessage = 'No items yet — sick days, make-up classes, payment notes…',
}) {
  const [draft, setDraft] = useState('')

  function submit(e) {
    e.preventDefault()
    onAdd(draft)
    setDraft('')
  }

  return (
    <div className="side-panel">
      <form className="inline-form" onSubmit={submit}>
        <input
          type="text"
          className="input input--line"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label="New item"
        />
        <button type="submit" className="btn btn--primary">
          Add
        </button>
      </form>
      <ul className="todo-list">
        {todos.length === 0 && <li className="muted">{emptyMessage}</li>}
        {todos.map((t) => (
          <li key={t.id} className="todo-row">
            <label className="todo-check">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => onToggle(t.id)}
              />
              <span className={t.done ? 'todo-text todo-text--done' : 'todo-text'}>
                {t.text}
              </span>
            </label>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => onRemove(t.id)}
              aria-label={`Remove: ${t.text}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
