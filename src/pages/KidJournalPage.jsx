import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MealsInlineField from '../components/MealsInlineField'
import { useKidJournal } from '../hooks/useKidJournal'
import { getMealHealthSuggestions } from '../utils/mealSuggestions'
import { countByCategory, parseMealsToParts } from '../utils/parseMeals'
import { toISODateLocal } from '../utils/dates'

const POOP_PALETTE = [
  { hex: '#f7f6f2', label: 'Pale / white' },
  { hex: '#ede6d8', label: 'Cream' },
  { hex: '#f2e8b8', label: 'Light yellow' },
  { hex: '#e6cf5c', label: 'Yellow' },
  { hex: '#c4b84a', label: 'Yellow-green' },
  { hex: '#7d8f3e', label: 'Olive / mud green' },
  { hex: '#4d5c2e', label: 'Dark green-brown' },
  { hex: '#8b6a45', label: 'Tan brown' },
  { hex: '#4a3326', label: 'Brown' },
]

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
  const [poop, setPoop] = useState('')
  const [poopColor, setPoopColor] = useState('')
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
    if (poop === 'yes' && !poopColor) {
      setFlash('Pick a color for poop, or choose No.')
      return
    }
    addEntry({
      dateISO,
      dayNotes,
      mealsText,
      morningNap,
      afternoonNap,
      poop: poop || 'no',
      poopColor: poop === 'yes' ? poopColor : null,
    })
    setFlash('Journal entry saved.')
    setDayNotes('')
    setMealsText('')
    setMorningNap('')
    setAfternoonNap('')
    setPoop('')
    setPoopColor('')
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

        <label className="field-block">
          <span className="field-block__label">About today</span>
          <textarea
            className="input input--area"
            rows={4}
            value={dayNotes}
            onChange={(e) => setDayNotes(e.target.value)}
            placeholder="Mood, play, outings, anything parents should know…"
          />
        </label>

        <div className="field-block">
          <span className="field-block__label">Meals today</span>
          <p className="journal__hint muted">
            Type foods here; use commas or new lines between items. Text colors match food groups as you go.
          </p>
          <MealsInlineField
            id="kid-journal-meals"
            value={mealsText}
            onChange={setMealsText}
            placeholder="e.g. oatmeal, banana, milk, carrots, chicken, rice, yogurt"
            aria-label="Meals today"
            suggestions={mealSuggestions}
          />
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

        <fieldset className="poop-field">
          <legend className="field-block__label">Poop</legend>
          <div className="poop-yesno" role="group" aria-label="Poop today">
            <button
              type="button"
              className={`poop-yesno__btn ${poop === 'yes' ? 'poop-yesno__btn--on' : ''}`}
              onClick={() => setPoop('yes')}
            >
              Yes
            </button>
            <button
              type="button"
              className={`poop-yesno__btn ${poop === 'no' ? 'poop-yesno__btn--on' : ''}`}
              onClick={() => {
                setPoop('no')
                setPoopColor('')
              }}
            >
              No
            </button>
          </div>
          {poop === 'yes' ? (
            <div className="poop-colors">
              <span className="poop-colors__label muted">
                Tap the shade that matches — 💩 sits on each color
              </span>
              <div className="poop-colors__grid" role="listbox" aria-label="Stool color">
                {POOP_PALETTE.map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    role="option"
                    aria-selected={poopColor === sw.hex}
                    title={sw.label}
                    className={`poop-swatch ${poopColor === sw.hex ? 'poop-swatch--on' : ''}`}
                    style={{ background: sw.hex }}
                    onClick={() => setPoopColor(sw.hex)}
                  >
                    <span className="poop-swatch__emoji" aria-hidden>
                      💩
                    </span>
                  </button>
                ))}
              </div>
              {poopColor ? (
                <p className="poop-colors__picked muted">
                  Selected: {POOP_PALETTE.find((s) => s.hex === poopColor)?.label ?? poopColor}
                </p>
              ) : null}
            </div>
          ) : null}
        </fieldset>

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
                    Nap AM: {row.morningNap || '—'} · PM: {row.afternoonNap || '—'} · Poop:{' '}
                    {row.poop === 'yes' ? (
                      <>
                        yes
                        {row.poopColor ? (
                          <span
                            className="journal__poop-dot"
                            style={{ background: row.poopColor }}
                            title="Color logged"
                          />
                        ) : null}
                      </>
                    ) : (
                      'no'
                    )}
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
