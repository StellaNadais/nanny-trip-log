import { useEffect, useId } from 'react'
import MealsInlineField from './MealsInlineField'
import JournalLittleBooks from './JournalLittleBooks'
import JournalMoodBar from './JournalMoodBar'
import { splitTripLogForMirror } from '../utils/parseTripPlaces'

function routePreviewPlaces(routeText) {
  const places = []

  for (const chunk of splitTripLogForMirror(routeText)) {
    if ((chunk.type === 'place' || chunk.type === 'token') && chunk.place) {
      places.push({
        id: chunk.place.id,
        label: String(chunk.value).toLocaleLowerCase(),
        region: chunk.place.region || 'unknown',
      })
      continue
    }

    // Keep unmatched words visible too, including the word currently being typed.
    // Known multi-word places remain one colored pill because the scanner returns
    // them as a `place` chunk before this fallback runs.
    if (chunk.type === 'text') {
      for (const match of chunk.value.matchAll(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)) {
        places.push({
          id: `draft-${chunk.start + match.index}`,
          label: match[0].toLocaleLowerCase(),
          region: 'unknown',
        })
      }
    }
  }

  return places
}

/**
 * Popup for reporting the day with the child.
 */
export default function AboutTodayModal({
  open,
  onClose,
  dateLabel,
  routeText,
  onRouteTextChange,
  title,
  onTitleChange,
  paragraph,
  onParagraphChange,
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
}) {
  const titleId = useId()
  const routePreview = routePreviewPlaces(routeText)

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

          <section
            className="journal-mood-bar journal-panel journal-panel--about about-today-modal__section"
            aria-label="Today's journal"
          >
            <div className="journal-mood-bar__head">
              <span className="journal-mood-bar__title">
                Today&apos;s journal
              </span>
            </div>
            <div className="journal-mood-bar__track journal-panel__body">
              <div className="about-today-modal__journal-fields">
                <label
                  className="about-today-modal__field about-today-modal__field--route"
                  htmlFor="about-today-route"
                >
                  <span>Route</span>
                  <textarea
                    id="about-today-route"
                    className="input input--area about-today-modal__route-input"
                    value={routeText}
                    onChange={(event) => onRouteTextChange(event.target.value)}
                    placeholder="e.g. Home → Park → Library"
                    rows={2}
                  />
                  {routePreview.length ? (
                    <ol className="about-today-modal__route-preview" aria-label="Route places">
                      {routePreview.map((place, index) => (
                        <li key={`${place.id}-${index}`}>
                          <span className={`about-today-modal__route-pill trip-place--${place.region}`}>
                            {place.label}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </label>
                <label className="about-today-modal__field" htmlFor="about-today-title">
                  <span>Title</span>
                  <input
                    id="about-today-title"
                    className="input input--line"
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="A sunny park morning"
                  />
                </label>
                <label className="about-today-modal__field" htmlFor="about-today-paragraph">
                  <span>Paragraph</span>
                  <textarea
                    id="about-today-paragraph"
                    className="input input--area"
                    value={paragraph}
                    onChange={(event) => onParagraphChange(event.target.value)}
                    placeholder="Write the details of today's little story..."
                    rows={5}
                  />
                </label>
              </div>
            </div>
          </section>

          <JournalLittleBooks
            nap={nap}
            onNapChange={onNapChange}
            pottyTime={pottyTime}
            onPottyTimeChange={onPottyTimeChange}
            pottyNotes={pottyNotes}
            onPottyNotesChange={onPottyNotesChange}
          />

          <section
            className="journal-mood-bar journal-panel journal-panel--wishes about-today-modal__section"
            aria-label="Wishes and song requests"
          >
            <div className="journal-mood-bar__head">
              <span className="journal-mood-bar__title" id="about-today-wishes-label">
                Wishes + song requests
              </span>
            </div>
            <div className="journal-mood-bar__track journal-panel__body">
              <label className="journal-panel-field" htmlFor="about-today-wishes">
                <span className="journal-panel-field__label">What they wished for</span>
                <textarea
                  id="about-today-wishes"
                  className="input journal-panel-field__textarea"
                  rows={4}
                  value={wishes}
                  onChange={(event) => onWishesChange(event.target.value)}
                  placeholder="Wishes, asks, or songs they wanted to hear…"
                  aria-labelledby="about-today-wishes-label"
                />
              </label>
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

        </div>

        <footer className="about-today-modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
