import { useId } from 'react'

function BookSection({ flush, panelClass, label, labelId, children }) {
  if (flush) {
    return (
      <section className={`about-today__section journal-panel ${panelClass}`} aria-label={label}>
        <div className="about-today__section-head">
          <span className="about-today__section-title" id={labelId}>
            {label}
          </span>
        </div>
        <div className="about-today__section-body">{children}</div>
      </section>
    )
  }

  return (
    <section className={`journal-mood-bar journal-panel ${panelClass}`} aria-label={label}>
      <div className="journal-mood-bar__head">
        <span className="journal-mood-bar__title" id={labelId}>
          {label}
        </span>
      </div>
      <div className="journal-mood-bar__track journal-panel__body">{children}</div>
    </section>
  )
}

/**
 * Nap, potty, and wishes — separate journal panels (workspace placeholders).
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
  flush = false,
}) {
  const baseId = useId()

  return (
    <>
      <BookSection flush={flush} panelClass="journal-panel--nap" label="Nap" labelId={`${baseId}-nap-label`}>
        <label className="journal-panel-field" htmlFor={`${baseId}-nap-input`}>
          <span className="journal-panel-field__label">When & how long</span>
          <input
            id={`${baseId}-nap-input`}
            type="text"
            className="input input--line journal-panel-field__input"
            value={nap}
            onChange={(e) => onNapChange(e.target.value)}
            placeholder="e.g. 9:30–10:15, 1–3pm, or none"
            aria-labelledby={`${baseId}-nap-label`}
          />
        </label>
      </BookSection>

      <BookSection flush={flush} panelClass="journal-panel--potty" label="Potty" labelId={`${baseId}-potty-label`}>
        <label className="journal-panel-field" htmlFor={`${baseId}-potty-time`}>
          <span className="journal-panel-field__label">Time</span>
          <input
            id={`${baseId}-potty-time`}
            type="text"
            className="input input--line journal-panel-field__input"
            value={pottyTime}
            onChange={(e) => onPottyTimeChange(e.target.value)}
            placeholder="e.g. 10:30, after lunch"
            aria-labelledby={`${baseId}-potty-label`}
          />
        </label>
        <label className="journal-panel-field" htmlFor={`${baseId}-potty-notes`}>
          <span className="journal-panel-field__label">All about it</span>
          <textarea
            id={`${baseId}-potty-notes`}
            className="input journal-panel-field__textarea"
            rows={3}
            value={pottyNotes}
            onChange={(e) => onPottyNotesChange(e.target.value)}
            placeholder="Dry, tried, accident, celebrated…"
          />
        </label>
      </BookSection>

      <BookSection flush={flush} panelClass="journal-panel--wishes" label="Wishes" labelId={`${baseId}-wishes-label`}>
        <label className="journal-panel-field" htmlFor={`${baseId}-wishes-input`}>
          <span className="journal-panel-field__label">Wishes today</span>
          <textarea
            id={`${baseId}-wishes-input`}
            className="input journal-panel-field__textarea"
            rows={4}
            value={wishes}
            onChange={(e) => onWishesChange(e.target.value)}
            placeholder="Something they hoped for, asked for, or wished today…"
            aria-labelledby={`${baseId}-wishes-label`}
          />
        </label>
      </BookSection>
    </>
  )
}
