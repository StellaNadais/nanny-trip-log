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
  'aria-labelledby': ariaLabelledby,
  suggestions = [],
  className = '',
}) {
  const chunks = useMemo(() => splitMealsTextForRendering(value), [value])

  return (
    <div className={`meals-today-field ${className}`.trim()}>
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
            aria-label={ariaLabelledby ? undefined : ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={suggestions.length ? 'meals-today-ideas-hint' : undefined}
            spellCheck="true"
            autoComplete="off"
          />
        </div>
      </div>

      <details className="meals-today-ideas-details" id="meals-today-ideas-hint" aria-live="polite">
        <summary className="meals-today-ideas__summary">Ideas through the day</summary>
        <div className="meals-today-ideas__panel">
          <p className="meals-today-ideas__disclaimer muted">
            General nutrition reminders for planning—not medical advice. Follow family and pediatric
            guidance.
          </p>
          {suggestions.length > 0 ? (
            <ul className="meals-today-ideas__list">
              {suggestions.map((line, i) => (
                <li key={i} className="meals-today-ideas__item">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="meals-today-ideas__empty muted">No extra ideas for this mix yet.</p>
          )}
        </div>
      </details>
    </div>
  )
}
