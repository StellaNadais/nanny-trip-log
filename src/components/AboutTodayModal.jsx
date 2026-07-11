import { useEffect, useId } from 'react'
import MealsInlineField from './MealsInlineField'
import TripPlacesField from './TripPlacesField'
import TripRouteBar from './TripRouteBar'
import JournalLittleBooks from './JournalLittleBooks'
import JournalMoodBar from './JournalMoodBar'

/**
 * Popup for reporting the day with the child.
 */
export default function AboutTodayModal({
  open,
  onClose,
  dateLabel,
  dayNotes,
  onDayNotesChange,
  mealsText,
  onMealsChange,
  mealSuggestions,
  nap,
  onNapChange,
  pottyTime,
  onPottyTimeChange,
  pottyNotes,
  onPottyNotesChange,
  wishes,
  onWishesChange,
  mood,
  onMoodChange,
  forwardSmsHref,
  canForward = true,
  onBeforeShareAction,
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="about-today-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="about-today-modal__backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="about-today-modal__sheet">
        <header className="about-today-modal__head">
          <div>
            <p className="about-today-modal__eyebrow">Report with child</p>
            <h2 id={titleId} className="about-today-modal__title">
              About today
            </h2>
            <p className="about-today-modal__date muted">{dateLabel}</p>
          </div>
          <button type="button" className="btn btn--ghost about-today-modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="about-today-modal__scroll">
          <JournalMoodBar value={mood} onChange={onMoodChange} />

          <TripRouteBar dayNotes={dayNotes} onDayNotesChange={onDayNotesChange} />

          <section
            className="journal-mood-bar journal-panel journal-panel--about about-today-modal__section"
            aria-label="Day notes"
          >
            <div className="journal-mood-bar__head">
              <span className="journal-mood-bar__title" id="about-today-notes-label">
                What we did
              </span>
            </div>
            <div className="journal-mood-bar__track journal-panel__body">
              <TripPlacesField
                id="about-today-day-notes"
                value={dayNotes}
                onChange={onDayNotesChange}
                placeholder="e.g. H's drop off, music, Commons"
                aria-labelledby="about-today-notes-label"
                nestedInAbout
              />
            </div>
          </section>

          <section
            className="journal-mood-bar journal-panel journal-panel--meals about-today-modal__section"
            aria-label="Meals"
          >
            <div className="journal-mood-bar__head">
              <span className="journal-mood-bar__title" id="about-today-meals-label">
                Meals today
              </span>
            </div>
            <div className="journal-mood-bar__track journal-panel__body">
              <MealsInlineField
                id="about-today-meals"
                value={mealsText}
                onChange={onMealsChange}
                placeholder="e.g. oatmeal, banana, milk, carrots, chicken, rice, yogurt"
                aria-labelledby="about-today-meals-label"
                suggestions={mealSuggestions}
                className="meals-today-field--nested"
              />
            </div>
          </section>

          <JournalLittleBooks
            nap={nap}
            onNapChange={onNapChange}
            pottyTime={pottyTime}
            onPottyTimeChange={onPottyTimeChange}
            pottyNotes={pottyNotes}
            onPottyNotesChange={onPottyNotesChange}
            wishes={wishes}
            onWishesChange={onWishesChange}
          />

        </div>

        <footer className="about-today-modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Done
          </button>
          {canForward ? (
            <a
              href={forwardSmsHref}
              className="btn btn--primary"
              onClick={() => onBeforeShareAction?.()}
              aria-label="Open Messages with this day's journal in the draft"
            >
              Text parent
            </a>
          ) : null}
        </footer>
      </div>
    </div>
  )
}
