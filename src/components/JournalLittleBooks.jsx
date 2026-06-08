import { useId, useState } from 'react'

function hasNapContent(nap) {
  return Boolean(String(nap ?? '').trim())
}

function hasPottyContent(pottyTime, pottyNotes) {
  return Boolean(String(pottyTime ?? '').trim() || String(pottyNotes ?? '').trim())
}

function hasWishesContent(wishes) {
  return Boolean(String(wishes ?? '').trim())
}

/**
 * Nap, potty, and wishes — square taps for now.
 */
export default function JournalLittleBooks({
  nap,
  onNapChange,
  pottyTime,
  onPottyTimeChange,
  pottyNotes,
  onPottyNotesChange,
  wishes,
  onWishesChange,
}) {
  const baseId = useId()
  const [openId, setOpenId] = useState(null)

  function toggle(id) {
    setOpenId((cur) => (cur === id ? null : id))
  }

  const books = [
    {
      id: 'nap',
      label: 'Nap',
      filled: hasNapContent(nap),
      panelId: `${baseId}-nap`,
      content: (
        <label className="journal-little-book__field" htmlFor={`${baseId}-nap-input`}>
          <span className="journal-little-book__field-label">When & how long</span>
          <input
            id={`${baseId}-nap-input`}
            type="text"
            className="input input--line journal-little-book__input"
            value={nap}
            onChange={(e) => onNapChange(e.target.value)}
            placeholder="e.g. 9:30–10:15, 1–3pm, or none"
          />
        </label>
      ),
    },
    {
      id: 'potty',
      label: 'Potty',
      filled: hasPottyContent(pottyTime, pottyNotes),
      panelId: `${baseId}-potty`,
      content: (
        <>
          <label className="journal-little-book__field" htmlFor={`${baseId}-potty-time`}>
            <span className="journal-little-book__field-label">Time</span>
            <input
              id={`${baseId}-potty-time`}
              type="text"
              className="input input--line journal-little-book__input"
              value={pottyTime}
              onChange={(e) => onPottyTimeChange(e.target.value)}
              placeholder="e.g. 10:30, after lunch"
            />
          </label>
          <label className="journal-little-book__field" htmlFor={`${baseId}-potty-notes`}>
            <span className="journal-little-book__field-label">All about it</span>
            <textarea
              id={`${baseId}-potty-notes`}
              className="input journal-little-book__textarea"
              rows={3}
              value={pottyNotes}
              onChange={(e) => onPottyNotesChange(e.target.value)}
              placeholder="Dry, tried, accident, celebrated…"
            />
          </label>
        </>
      ),
    },
    {
      id: 'wishes',
      label: 'Wishes',
      filled: hasWishesContent(wishes),
      panelId: `${baseId}-wishes`,
      content: (
        <label className="journal-little-book__field" htmlFor={`${baseId}-wishes-input`}>
          <span className="journal-little-book__field-label">Wishes today</span>
          <textarea
            id={`${baseId}-wishes-input`}
            className="input journal-little-book__textarea"
            rows={4}
            value={wishes}
            onChange={(e) => onWishesChange(e.target.value)}
            placeholder="Something they hoped for, asked for, or wished today…"
          />
        </label>
      ),
    },
  ]

  return (
    <section className="journal-little-books" aria-label="Nap, potty, and wishes">
      {books.map((book) => {
        const open = openId === book.id
        return (
          <div
            key={book.id}
            className={`journal-little-book journal-little-book--${book.id}${open ? ' journal-little-book--open' : ''}${book.filled ? ' journal-little-book--filled' : ''}`}
          >
            <button
              type="button"
              className="journal-little-book__tap"
              onClick={() => toggle(book.id)}
              aria-expanded={open}
              aria-controls={book.panelId}
              aria-label={`${open ? 'Close' : 'Open'} ${book.label}${book.filled ? ' (has notes)' : ''}`}
            >
              <span className="journal-little-book__square" aria-hidden />
              <span className="journal-little-book__label">{book.label}</span>
              {book.filled ? <span className="journal-little-book__filled-dot" aria-hidden /> : null}
            </button>
            {open ? (
              <div id={book.panelId} className="journal-little-book__panel">
                <div className="journal-little-book__panel-body">{book.content}</div>
              </div>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}
