import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayStrip } from '../components/DayStrip'
import MealsInlineField from '../components/MealsInlineField'
import TripPlacesField from '../components/TripPlacesField'
import GroceryListPanel from '../components/GroceryListPanel'
import JournalMoodBar from '../components/JournalMoodBar'
import JournalLittleBooks from '../components/JournalLittleBooks'
import { useKidJournal } from '../hooks/useKidJournal'
import { getMealHealthSuggestions } from '../utils/mealSuggestions'
import { countByCategory, parseMealsToParts } from '../utils/parseMeals'
import {
  addDays,
  canJournalSaveForwardAt,
  formatWeekRange,
  startOfWeekMonday,
  toISODateLocal,
} from '../utils/dates'
import { computeWeekTripMileage } from '../utils/parseTripPlaces'
import { notifyReceiptMileageUpdated, saveReceiptSettings } from '../utils/receiptStorage'
import { OUTINGS_UPDATED_EVENT } from '../utils/outingsStorage'
import { loadKidJournalEntries } from '../utils/kidJournalStorage'
import { loadState } from '../utils/storage'
import JournalDayReceiptModal from '../components/JournalDayReceiptModal'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'
import {
  buildJournalDayExportText,
  buildJournalDaySmsHref,
  downloadJournalDayFile,
  journalDayFilename,
} from '../utils/journalDayExport'
import { fileToCompressedDataUrl } from '../utils/receiptImage'
import {
  addShoppingItems,
  loadShoppingForWeek,
  removeShoppingItem,
  toggleShoppingItem,
} from '../utils/journalShoppingStorage'
import { napFromJournalEntry } from '../utils/journalNap'
import { pottyFromJournalEntry } from '../utils/journalLittleBooks'
import { useJournalDaySky } from '../hooks/useJournalDaySky'

function loadDraftFromLatest(iso) {
  const ent = loadKidJournalEntries()
  const forDay = ent.filter((e) => e.dateISO === iso)
  const latest = [...forDay].sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''))[0]
  if (!latest) {
    return {
      dayNotes: '',
      mealsText: '',
      nap: '',
      pottyTime: '',
      pottyNotes: '',
      wishes: '',
      mood: '',
      handwrittenPhotoDataUrl: '',
    }
  }
  const potty = pottyFromJournalEntry(latest)
  return {
    dayNotes: latest.dayNotes ?? '',
    mealsText: latest.mealsText ?? '',
    nap: napFromJournalEntry(latest),
    pottyTime: potty.pottyTime,
    pottyNotes: potty.pottyNotes,
    wishes: latest.wishes ?? '',
    mood: latest.mood ?? '',
    handwrittenPhotoDataUrl: latest.handwrittenPhotoDataUrl ?? '',
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
  const [nap, setNap] = useState('')
  const [pottyTime, setPottyTime] = useState('')
  const [pottyNotes, setPottyNotes] = useState('')
  const [wishes, setWishes] = useState('')
  const [mood, setMood] = useState('')
  const [handwrittenPhotoDataUrl, setHandwrittenPhotoDataUrl] = useState('')
  const [handwrittenPhotoErr, setHandwrittenPhotoErr] = useState('')
  const handwrittenFileRef = useRef(null)
  const [journalReceiptOpen, setJournalReceiptOpen] = useState(false)
  const [suggestionClock, setSuggestionClock] = useState(() => Date.now())
  const [journalShareGateNow, setJournalShareGateNow] = useState(() => Date.now())
  const [outingsRev, setOutingsRev] = useState(0)
  const [shoppingItems, setShoppingItems] = useState([])
  const [shoppingDockOpen, setShoppingDockOpen] = useState(false)

  useEffect(() => {
    setShoppingItems(loadShoppingForWeek(weekKey))
  }, [weekKey])

  useEffect(() => {
    setShoppingDockOpen(false)
  }, [weekKey])

  useEffect(() => {
    const id = setInterval(() => setSuggestionClock(Date.now()), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setJournalShareGateNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const bump = () => setOutingsRev((r) => r + 1)
    window.addEventListener(OUTINGS_UPDATED_EVENT, bump)
    return () => window.removeEventListener(OUTINGS_UPDATED_EVENT, bump)
  }, [])

  useEffect(() => {
    const d = loadDraftFromLatest(dateISO)
    setDayNotes(d.dayNotes)
    setMealsText(d.mealsText)
    setNap(d.nap)
    setPottyTime(d.pottyTime)
    setPottyNotes(d.pottyNotes)
    setWishes(d.wishes)
    setMood(d.mood)
    setHandwrittenPhotoDataUrl(d.handwrittenPhotoDataUrl)
    setHandwrittenPhotoErr('')
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
  }, [journalWeekStart, weekKey, dateISO, dayNotes, entries, outingsRev])

  const mealParts = useMemo(() => parseMealsToParts(mealsText), [mealsText])
  const mealSuggestions = useMemo(() => {
    return getMealHealthSuggestions(countByCategory(mealParts), new Date(suggestionClock))
  }, [mealParts, suggestionClock])

  const canJournalSaveForward = useMemo(
    () => canJournalSaveForwardAt(journalShareGateNow, dateISO),
    [journalShareGateNow, dateISO]
  )

  useEffect(() => {
    setJournalReceiptOpen(false)
  }, [dateISO])

  const refreshJournalShareGate = useCallback(() => setJournalShareGateNow(Date.now()), [])

  function shiftJournalWeek(delta) {
    setJournalWeekStart((w) => addDays(w, delta * 7))
  }

  function handleAddGrocery(raw) {
    setShoppingItems(addShoppingItems(weekKey, raw))
  }

  function handleToggleShopping(id) {
    setShoppingItems(toggleShoppingItem(weekKey, id))
  }

  function handleRemoveShopping(id) {
    setShoppingItems(removeShoppingItem(weekKey, id))
  }

  function persistJournalIfChanged() {
    const latest = loadDraftFromLatest(dateISO)
    const photo = handwrittenPhotoDataUrl || ''
    const latestPhoto = latest.handwrittenPhotoDataUrl || ''
    if (
      dayNotes !== (latest.dayNotes ?? '') ||
      mealsText !== (latest.mealsText ?? '') ||
      nap !== (latest.nap ?? '') ||
      pottyTime !== (latest.pottyTime ?? '') ||
      pottyNotes !== (latest.pottyNotes ?? '') ||
      wishes !== (latest.wishes ?? '') ||
      mood !== (latest.mood ?? '') ||
      photo !== latestPhoto
    ) {
      addEntry({
        dateISO,
        dayNotes,
        mealsText,
        nap,
        pottyTime,
        pottyNotes,
        wishes,
        mood,
        handwrittenPhotoDataUrl: photo,
      })
    }
  }

  function openJournalSlip() {
    setJournalShareGateNow(Date.now())
    persistJournalIfChanged()
    setJournalReceiptOpen(true)
  }

  function beforeShareOrDownload() {
    setJournalShareGateNow(Date.now())
    persistJournalIfChanged()
  }

  async function onHandwrittenPhotoChange(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setHandwrittenPhotoErr('')
    try {
      const url = await fileToCompressedDataUrl(f, 1000, 0.72)
      setHandwrittenPhotoDataUrl(url)
    } catch {
      setHandwrittenPhotoErr('Could not use that image.')
    }
  }

  const journalDateLabel = formatJournalDate(dateISO)
  const daySky = useJournalDaySky(dateISO)

  const shoppingOpenCount = useMemo(
    () => shoppingItems.filter((item) => !item.done).length,
    [shoppingItems]
  )

  const forwardJournalSmsHref = useMemo(
    () =>
      buildJournalDaySmsHref({
        dateISO,
        dateLabel: journalDateLabel,
        dayNotes,
        mealsText,
        nap,
        pottyTime,
        pottyNotes,
        wishes,
        mood,
        handwrittenPhotoDataUrl,
        shoppingItems,
      }),
    [
      dateISO,
      journalDateLabel,
      dayNotes,
      mealsText,
      nap,
      pottyTime,
      pottyNotes,
      wishes,
      mood,
      handwrittenPhotoDataUrl,
      shoppingItems,
    ]
  )

  function journalDayExportPayload() {
    return {
      dateISO,
      dateLabel: journalDateLabel,
      dayNotes,
      mealsText,
      nap,
      pottyTime,
      pottyNotes,
      wishes,
      mood,
      handwrittenPhotoDataUrl,
      shoppingItems,
    }
  }

  function downloadJournalOfTheDay() {
    const text = buildJournalDayExportText(journalDayExportPayload())
    downloadJournalDayFile(journalDayFilename(dateISO), text)
  }

  const shoppingDock = (
    <div
      className={`schedule-requests-dock journal-shopping-dock${shoppingDockOpen ? ' schedule-requests-dock--open' : ''}`}
    >
      <button
        type="button"
        className="schedule-requests-dock__tab"
        onClick={() => setShoppingDockOpen((o) => !o)}
        aria-expanded={shoppingDockOpen}
        aria-controls="journal-shopping-panel"
        aria-label={
          shoppingOpenCount > 0
            ? `Open grocery list (${shoppingOpenCount} to get)`
            : 'Open grocery list'
        }
      >
        {shoppingDockOpen ? (
          <span className="schedule-requests-dock__tab-x" aria-hidden>
            ×
          </span>
        ) : (
          <>
            <span className="schedule-requests-dock__tab-ico" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span className="schedule-requests-dock__tab-lbl">Grocery</span>
            {shoppingOpenCount > 0 ? (
              <span className="schedule-requests-dock__badge" aria-hidden>
                {shoppingOpenCount > 99 ? '99+' : shoppingOpenCount}
              </span>
            ) : null}
          </>
        )}
      </button>
      <div
        className="schedule-requests-dock__panel"
        id="journal-shopping-panel"
        role="region"
        aria-hidden={!shoppingDockOpen}
        aria-labelledby="journal-shopping-title"
      >
        <h2 id="journal-shopping-title" className="schedule-requests-dock__title">
          Grocery list
        </h2>
        <p className="journal-shopping-dock__hint muted">This week — add as you think of it.</p>
        <GroceryListPanel
          items={shoppingItems}
          onAddItems={handleAddGrocery}
          onToggle={handleToggleShopping}
          onRemove={handleRemoveShopping}
          autoFocus={shoppingDockOpen}
          placeholder="Milk, bananas, diapers…"
        />
      </div>
    </div>
  )

  return (
    <div
      className="page page--kid-journal work-ui"
      style={daySky.style}
      data-sky-phase={daySky.label}
    >
      <ToolWorkspaceHead
        eyebrow="Kid journal workspace"
        title="Kid journal"
        lede="Outings, meals, nap & potty — one slip for the day."
        titleAside={shoppingDock}
      />
      {shoppingDockOpen ? (
        <button
          type="button"
          className="schedule-requests-dock__scrim"
          aria-label="Close grocery list"
          onClick={() => setShoppingDockOpen(false)}
        />
      ) : null}

      <div className="journal__layout">
        <section className="journal__week-picker work-ui__panel" aria-label="Pick a day">
          <div className="journal__week-picker-top">
            <div className="trip-log__week-tools journal__week-tools">
              <button
                type="button"
                className="btn btn--ghost trip-log__week-btn"
                onClick={() => shiftJournalWeek(-1)}
              >
                ← Prev
              </button>
              <p className="journal__week-range" aria-live="polite">
                {formatWeekRange(journalWeekStart)}
              </p>
              <button
                type="button"
                className="btn btn--ghost trip-log__week-btn"
                onClick={() => shiftJournalWeek(1)}
              >
                Next →
              </button>
            </div>
            <p className="journal__selected-day" aria-live="polite">
              {journalDateLabel}
            </p>
            <p className="journal__sky-phase" aria-live="polite">
              {daySky.label}
            </p>
          </div>
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
        </section>

        <JournalMoodBar value={mood} onChange={setMood} />

        <form
          className="journal__form"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
        <div className="field-block journal__about-bundle">
          <div className="journal__about-head">
            <span className="field-block__label" id="kid-journal-about-label">
              About today
            </span>
            <input
              ref={handwrittenFileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              onChange={onHandwrittenPhotoChange}
            />
            <button
              type="button"
              className="journal__handwritten-pic-btn"
              title="Photo of handwritten journal"
              aria-label="Add photo of handwritten journal"
              onClick={() => handwrittenFileRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                />
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </button>
          </div>
          {handwrittenPhotoErr ? (
            <p className="journal__handwritten-err muted" role="status">
              {handwrittenPhotoErr}
            </p>
          ) : null}
          {handwrittenPhotoDataUrl ? (
            <div className="journal__handwritten-preview">
              <img src={handwrittenPhotoDataUrl} alt="Handwritten journal" />
              <button
                type="button"
                className="btn btn--ghost journal__handwritten-remove"
                onClick={() => {
                  setHandwrittenPhotoDataUrl('')
                  setHandwrittenPhotoErr('')
                }}
              >
                Remove photo
              </button>
            </div>
          ) : null}
          <div className="journal__write-box journal__write-box--notes">
            <TripPlacesField
              id="kid-journal-day-notes"
              value={dayNotes}
              onChange={setDayNotes}
              placeholder="e.g. H's drop off, music, Commons"
              aria-labelledby="kid-journal-about-label"
              nestedInAbout
            />
          </div>
          <div className="journal__about-meals">
            <span className="field-block__label field-block__label--sub" id="kid-journal-meals-label">
              Meals today
            </span>
            <p className="journal__hint muted">
              Use commas or new lines between foods; colors match food groups as you type.
            </p>
            <div className="journal__write-box journal__write-box--meals">
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
        </div>

        <JournalLittleBooks
          nap={nap}
          onNapChange={setNap}
          pottyTime={pottyTime}
          onPottyTimeChange={setPottyTime}
          pottyNotes={pottyNotes}
          onPottyNotesChange={setPottyNotes}
          wishes={wishes}
          onWishesChange={setWishes}
        />

        <div
          className="journal__day-slip-actions"
          role="group"
          aria-label="Journal slip preview"
        >
          <button
            type="button"
            className="btn btn--primary journal__show-journal-btn"
            onClick={openJournalSlip}
          >
            Show journal
          </button>
        </div>
        </form>
      </div>

      <JournalDayReceiptModal
        open={journalReceiptOpen}
        onClose={() => setJournalReceiptOpen(false)}
        dateLabel={journalDateLabel}
        dayNotes={dayNotes}
        mealsText={mealsText}
        nap={nap}
        pottyTime={pottyTime}
        pottyNotes={pottyNotes}
        wishes={wishes}
        mood={mood}
        handwrittenPhotoDataUrl={handwrittenPhotoDataUrl}
        forwardSmsHref={forwardJournalSmsHref}
        canForward={canJournalSaveForward}
        onDownload={downloadJournalOfTheDay}
        onBeforeShareAction={beforeShareOrDownload}
        onHoldSheetOpen={refreshJournalShareGate}
      />
    </div>
  )
}
