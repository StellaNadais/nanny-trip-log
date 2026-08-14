import MealsInlineField from './MealsInlineField'
import TripPlacesField from './TripPlacesField'
import JournalLittleBooks from './JournalLittleBooks'
import JournalMoodBar from './JournalMoodBar'
import TodayPanelModal from './TodayPanelModal'

/**
 * Popup for writing today's story — lead, body, and care notes in a soft panel.
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
  forwardSmsHref,
  canForward = true,
  onBeforeShareAction,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="About today"
      hideHead
      hideFoot
      modalClassName="about-today-modal--about-today"
    >
      <section className="soft-panel soft-panel--about-today soft-panel--book-popup" aria-labelledby="about-today-title">
        <div className="soft-panel__hero">
          <p className="soft-panel__eyebrow">Today’s story</p>
          <h2 id="about-today-title" className="soft-panel__title">
            About today
          </h2>
          <p className="soft-panel__meta muted">{dateLabel}</p>
          <p className="soft-panel__lede">
            Begin with a first sentence. It will become today&apos;s lead.
          </p>
        </div>

        <div className="soft-panel__body soft-panel__body--about-today">
          <JournalMoodBar value={mood} onChange={onMoodChange} />

          <section className="about-today__section journal-panel journal-panel--about" aria-label="Today’s story">
            <div className="about-today__section-head">
              <span className="about-today__section-title" id="about-today-route-label">
                Route
              </span>
            </div>
            <div className="about-today__section-body">
              <TripPlacesField
                id="about-today-route"
                value={routeText}
                onChange={onRouteTextChange}
                placeholder="e.g. Home, park, library"
                aria-labelledby="about-today-route-label"
                nestedInAbout
              />
            </div>
          </section>

          <section className="about-today__section" aria-label="Lead and story">
            <label className="box-field about-today-modal__field" htmlFor="about-today-lead">
              <span>Lead</span>
              <input
                id="about-today-lead"
                className="input input--line"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="A sunny park morning"
              />
            </label>
            <label className="box-field about-today-modal__field" htmlFor="about-today-story">
              <span>Story</span>
              <textarea
                id="about-today-story"
                className="input input--area"
                value={paragraph}
                onChange={(event) => onParagraphChange(event.target.value)}
                placeholder="Write the rest of today’s little story…"
                rows={5}
              />
            </label>
          </section>

          <section className="about-today__section journal-panel journal-panel--meals" aria-label="Meals">
            <div className="about-today__section-head">
              <span className="about-today__section-title" id="about-today-meals-label">
                Meals today
              </span>
            </div>
            <div className="about-today__section-body">
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
            flush
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

        <div className="soft-panel__actions">
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
        </div>
      </section>
    </TodayPanelModal>
  )
}
