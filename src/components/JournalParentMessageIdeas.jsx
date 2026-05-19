import {
  FAMILY_MESSAGE_LONG_EXAMPLES,
  FAMILY_MESSAGE_PROMPTS,
  getTypicalDayRhythmLine,
  getWeekdayLabelForIso,
} from '../utils/journalParentMessageSuggestions'

/**
 * Collapsible “parent text” ideas: weekday rhythm + prompts + full examples.
 * @param {{ dateISO: string, variant?: 'journal' | 'trip' }} props
 */
export default function JournalParentMessageIdeas({ dateISO, variant = 'journal' }) {
  const weekday = getWeekdayLabelForIso(dateISO)
  const rhythm = getTypicalDayRhythmLine(dateISO)
  const rootClass =
    variant === 'trip'
      ? 'journal-parent-ideas-details journal-parent-ideas-details--trip'
      : 'journal-parent-ideas-details'

  return (
    <details
      className={rootClass}
      id="journal-parent-ideas"
      aria-label="Ideas for texts to parents"
    >
      <summary className="journal-parent-ideas__summary">Ideas for parent texts</summary>
      <div className="journal-parent-ideas__panel">
        <p className="journal-parent-ideas__rhythm muted">
          <strong>{weekday} — typical flow:</strong> {rhythm}
        </p>
        <p className="journal-parent-ideas__label">Quick prompts</p>
        <ul className="journal-parent-ideas__prompts">
          {FAMILY_MESSAGE_PROMPTS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <details className="journal-parent-ideas__examples-nested">
          <summary className="journal-parent-ideas__examples-summary">
            Full example messages (your tone)
          </summary>
          <div className="journal-parent-ideas__examples-body">
            {FAMILY_MESSAGE_LONG_EXAMPLES.map((text, i) => (
              <pre key={i} className="journal-parent-ideas__example-block">
                {text.trim()}
              </pre>
            ))}
          </div>
        </details>
      </div>
    </details>
  )
}
