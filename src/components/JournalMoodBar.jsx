import { JOURNAL_MOODS } from '../data/journalMoods'

/**
 * Five-step mood picker between date and journal fields.
 * @param {{ value: string, onChange: (id: string) => void }} props
 */
export default function JournalMoodBar({ value, onChange }) {
  const activeIndex = JOURNAL_MOODS.findIndex((m) => m.id === value)
  const picked = activeIndex >= 0 ? JOURNAL_MOODS[activeIndex] : null

  return (
    <section className="journal-mood-bar" aria-label="Mood today">
      <div className="journal-mood-bar__head">
        <span className="journal-mood-bar__title">Mood</span>
        {picked ? (
          <span className="journal-mood-bar__picked">
            <span aria-hidden>{picked.emoji}</span> {picked.label}
          </span>
        ) : (
          <span className="journal-mood-bar__picked journal-mood-bar__picked--empty muted">Tap a step</span>
        )}
      </div>
      <div
        className="journal-mood-bar__track"
        role="group"
        aria-label="How was the day?"
        style={{ '--journal-mood-fill': activeIndex >= 0 ? `${((activeIndex + 1) / JOURNAL_MOODS.length) * 100}%` : '0%' }}
      >
        <div className="journal-mood-bar__fill" aria-hidden />
        {JOURNAL_MOODS.map((m, i) => {
          const on = value === m.id
          return (
            <button
              key={m.id}
              type="button"
              className={`journal-mood-bar__seg${on ? ' journal-mood-bar__seg--on' : ''}`}
              aria-pressed={on}
              aria-label={`${m.label} mood`}
              title={m.label}
              onClick={() => onChange(on ? '' : m.id)}
            >
              <span className="journal-mood-bar__emoji" aria-hidden>
                {m.emoji}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
