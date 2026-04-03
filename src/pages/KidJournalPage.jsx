import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayStrip } from '../components/DayStrip'
import MealsInlineField from '../components/MealsInlineField'
import TripPlacesField from '../components/TripPlacesField'
import { placeMirrorChildrenFromText } from '../components/placeMirrorNodes'
import { useKidJournal } from '../hooks/useKidJournal'
import { getMealHealthSuggestions } from '../utils/mealSuggestions'
import { countByCategory, parseMealsToParts } from '../utils/parseMeals'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { computeWeekTripMileage } from '../utils/parseTripPlaces'
import { notifyReceiptMileageUpdated, saveReceiptSettings } from '../utils/receiptStorage'
import { loadKidJournalEntries } from '../utils/kidJournalStorage'
import { loadState } from '../utils/storage'

function loadDraftFromLatest(iso) {
  const ent = loadKidJournalEntries()
  const forDay = ent.filter((e) => e.dateISO === iso)
  const latest = [...forDay].sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''))[0]
  if (!latest) {
    return { dayNotes: '', mealsText: '', morningNap: '', afternoonNap: '' }
  }
  return {
    dayNotes: latest.dayNotes ?? '',
    mealsText: latest.mealsText ?? '',
    morningNap: latest.morningNap ?? '',
    afternoonNap: latest.afternoonNap ?? '',
  }
}

function formatJournalDate(iso) {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function initialDayOffsetForWeek(mondayDate) {
  const monIso = toISODateLocal(mondayDate)
  const todayIso = toISODateLocal(new Date())
  const diff = Math.round(
    (new Date(todayIso + 'T12:00:00') - new Date(monIso + 'T12:00:00')) / 86400000
  )
  return Math.max(0, Math.min(6, diff))
}

export default function KidJournalPage() {
  const { entries, addEntry } = useKidJournal()
  const [journalWeekStart, setJournalWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )

  const weekKey = useMemo(() => toISODateLocal(journalWeekStart), [journalWeekStart])
  const dateISO = useMemo(
    () => toISODateLocal(addDays(journalWeekStart, dayOffset)),
    [journalWeekStart, dayOffset]
  )

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

  useEffect(() => {
    const d = loadDraftFromLatest(dateISO)
    setDayNotes(d.dayNotes)
    setMealsText(d.mealsText)
    setMorningNap(d.morningNap)
    setAfternoonNap(d.afternoonNap)
  }, [dateISO])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const saved = loadState()
      const daysByIso = saved?.daysByIso && typeof saved.daysByIso === 'object' ? saved.daysByIso : {}
      const draft = { [dateISO]: dayNotes }
      const { totalMiles, reimbursement, breakdown } = computeWeekTripMileage(
        journalWeekStart,
        daysByIso,
        entries,
        draft
      )
      saveReceiptSettings({
        mileageByWeek: {
          [weekKey]: {
            totalMiles,
            reimbursement,
            breakdown,
            weekLabel: formatWeekRange(journalWeekStart),
            updatedAt: Date.now(),
          },
        },
      })
      notifyReceiptMileageUpdated()
    }, 450)
    return () => window.clearTimeout(t)
  }, [journalWeekStart, weekKey, dateISO, dayNotes, entries])

  const mealParts = useMemo(() => parseMealsToParts(mealsText), [mealsText])
  const mealSuggestions = useMemo(() => {
    return getMealHealthSuggestions(countByCategory(mealParts), new Date(suggestionClock))
  }, [mealParts, suggestionClock])

  function shiftJournalWeek(delta) {
    setJournalWeekStart((w) => addDays(w, delta * 7))
  }

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
    window.setTimeout(() => {
      const d = loadDraftFromLatest(dateISO)
      setDayNotes(d.dayNotes)
      setMealsText(d.mealsText)
      setMorningNap(d.morningNap)
      setAfternoonNap(d.afternoonNap)
    }, 100)
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

      <div className="journal__week-picker">
        <div className="trip-log__week-tools">
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => shiftJournalWeek(-1)}
          >
            ← Previous week
          </button>
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => shiftJournalWeek(1)}
          >
            Next week →
          </button>
        </div>
        <p className="journal__week-range muted" aria-live="polite">
          {formatWeekRange(journalWeekStart)}
        </p>
        <DayStrip
          weekStart={journalWeekStart}
          selectedIso={dateISO}
          onSelect={(iso) => {
            const a = new Date(weekKey + 'T12:00:00')
            const b = new Date(iso + 'T12:00:00')
            const diff = Math.round((b - a) / 86400000)
            setDayOffset(Math.max(0, Math.min(6, diff)))
          }}
        />
      </div>

      <form className="journal__form" onSubmit={submit}>
        <div className="field-block journal__about-bundle">
          <span className="field-block__label" id="kid-journal-about-label">
            About today
          </span>
          <TripPlacesField
            id="kid-journal-day-notes"
            value={dayNotes}
            onChange={setDayNotes}
            placeholder="Mood, play, outings, anything parents should know…"
            aria-labelledby="kid-journal-about-label"
            variant="journal"
            nestedInAbout
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
                  {row.dayNotes ? (
                    <p className="journal__history-notes journal__history-notes--places">
                      {placeMirrorChildrenFromText(row.dayNotes)}
                    </p>
                  ) : null}
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
