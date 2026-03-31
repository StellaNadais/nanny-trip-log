import { useMemo } from 'react'
import { splitMealsTextForRendering } from '../utils/parseMeals'

/**
 * Meals today: colored typing layer + ideas list in one field.
 */
export default function MealsInlineField({
  id,
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
  suggestions = [],
}) {
  const chunks = useMemo(() => splitMealsTextForRendering(value), [value])

  return (
    <div className="meals-today-field">
      <div className="meals-inline-host">
        <div className="meals-inline-inner">
          <div className="meals-inline-mirror" aria-hidden>
            {chunks.length === 0 ? (
              value === '' ? (
                '\u00a0'
              ) : null
            ) : (
              chunks.map((c, i) => {
                if (c.type === 'delim') {
                  return (
                    <span key={i} className="meals-inline-delim">
                      {c.value}
                    </span>
                  )
                }
                return (
                  <span key={i} style={{ color: c.color }}>
                    {c.value}
                  </span>
                )
              })
            )}
          </div>
          <textarea
            id={id}
            className="meals-inline-ta"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-describedby={suggestions.length ? 'meals-today-ideas-hint' : undefined}
            spellCheck="true"
            autoComplete="off"
          />
        </div>
      </div>

      <div
        className="meals-today-ideas"
        id="meals-today-ideas-hint"
        aria-live="polite"
      >
        <span className="meals-today-ideas__title">Ideas through the day</span>
        <p className="meals-today-ideas__disclaimer muted">
          General nutrition reminders for planning—not medical advice. Follow family and pediatric
          guidance.
        </p>
        <ul className="meals-today-ideas__list">
          {suggestions.map((line, i) => (
            <li key={i} className="meals-today-ideas__item">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
