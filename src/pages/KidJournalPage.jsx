import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MealsInlineField from '../components/MealsInlineField'
import { useKidJournal } from '../hooks/useKidJournal'
import { getMealHealthSuggestions } from '../utils/mealSuggestions'
import { countByCategory, parseMealsToParts } from '../utils/parseMeals'
import { toISODateLocal } from '../utils/dates'

function formatJournalDate(iso) {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function KidJournalPage() {
  const { entries, addEntry } = useKidJournal()
  const [dateISO, setDateISO] = useState(() => toISODateLocal(new Date()))
  const [dayNotes, setDayNotes] = useState('')
  const [mealsText, setMealsText] = useState('')
  const [morningNap, setMorningNap] = useState('')
  const [afternoonNap, setAfternoonNap] = useState('')
  const [flash, setFlash] = useState('')
  const [suggestionClock, setSuggestionClock] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setSuggestionClock(Date.now()), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const mealParts = useMemo(() => parseMealsToParts(mealsText), [mealsText])
  const mealSuggestions = useMemo(() => {
    return getMealHealthSuggestions(countByCategory(mealParts), new Date(suggestionClock))
  }, [mealParts, suggestionClock])

  function submit(e) {
    e.preventDefault()
    addEntry({
      dateISO,
      dayNotes,
      mealsText,
      morningNap,
      afternoonNap,
    })
    setFlash('Journal entry saved.')
    setDayNotes('')
    setMealsText('')
    setMorningNap('')
    setAfternoonNap('')
  }

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const d = (b.dateISO ?? '').localeCompare(a.dateISO ?? '')
      if (d !== 0) return d
      return (b.savedAt ?? '').localeCompare(a.savedAt ?? '')
    })
  }, [entries])

  return (
    <div className="page page--kid-journal">
      <header className="journal__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <h1 className="journal__title">
          Kid journal <span className="placeholder__code">(B)</span>
        </h1>
      </header>

      <form className="journal__form" onSubmit={submit}>
        <label className="field-block">
          <span className="field-block__label">Date</span>
          <input
            type="date"
            className="input input--line"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            required
          />
        </label>

        <div className="field-block journal__about-bundle">
          <span className="field-block__label" id="kid-journal-about-label">
            About today
          </span>
          <textarea
            id="kid-journal-day-notes"
            className="input input--area journal__about-notes"
            rows={4}
            value={dayNotes}
            onChange={(e) => setDayNotes(e.target.value)}
            placeholder="Mood, play, outings, anything parents should know…"
            aria-labelledby="kid-journal-about-label"
          />
          <div className="journal__about-meals">
            <span className="field-block__label field-block__label--sub" id="kid-journal-meals-label">
              Meals today
            </span>
            <p className="journal__hint muted">
              Use commas or new lines between foods; colors match food groups as you type.
            </p>
            <MealsInlineField
              id="kid-journal-meals"
              value={mealsText}
              onChange={setMealsText}
              placeholder="e.g. oatmeal, banana, milk, carrots, chicken, rice, yogurt"
              aria-labelledby="kid-journal-meals-label"
              suggestions={mealSuggestions}
              className="meals-today-field--nested"
            />
          </div>
        </div>

        <div className="journal__nap-row">
          <label className="field-block">
            <span className="field-block__label">Morning nap</span>
            <input
              type="text"
              className="input input--line"
              value={morningNap}
              onChange={(e) => setMorningNap(e.target.value)}
              placeholder="e.g. 9:30–10:15 or none"
            />
          </label>

          <label className="field-block">
            <span className="field-block__label">Afternoon nap</span>
            <input
              type="text"
              className="input input--line"
              value={afternoonNap}
              onChange={(e) => setAfternoonNap(e.target.value)}
              placeholder="e.g. 1–3pm or car nap"
            />
          </label>
        </div>

        {flash ? (
          <p className={`journal__flash ${flash.includes('saved') ? 'journal__flash--ok' : ''}`} role="status">
            {flash}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary journal__submit">
          Save journal entry
        </button>
      </form>

      {sorted.length > 0 ? (
        <section className="journal__history" aria-labelledby="journal-history-title">
          <h2 id="journal-history-title" className="journal__history-title">
            Recent entries
          </h2>
          <ul className="journal__history-list">
            {sorted.slice(0, 12).map((row) => {
              const parts = parseMealsToParts(row.mealsText ?? '')
              return (
                <li key={row.id} className="journal__history-row">
                  <div className="journal__history-date">{formatJournalDate(row.dateISO)}</div>
                  {row.dayNotes ? <p className="journal__history-notes">{row.dayNotes}</p> : null}
                  {parts.length > 0 ? (
                    <p className="journal__history-meals">
                      {parts.map((p, i) => (
                        <span key={`${row.id}-m-${i}`}>
                          {i > 0 ? ', ' : null}
                          <span style={{ color: p.color }}>{p.segment}</span>
                        </span>
                      ))}
                    </p>
                  ) : null}
                  <p className="journal__history-meta muted">
                    Nap AM: {row.morningNap || '—'} · PM: {row.afternoonNap || '—'}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
