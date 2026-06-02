import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayStrip } from '../components/DayStrip'
import MealsInlineField from '../components/MealsInlineField'
import JournalParentMessageIdeas from '../components/JournalParentMessageIdeas'
import TripPlacesField from '../components/TripPlacesField'
import { TodoPanel } from '../components/TodoPanel'
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
import JournalDayProgress from '../components/JournalDayProgress'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'
import {
  buildJournalDayExportText,
  buildJournalDaySmsHref,
  downloadJournalDayFile,
  journalDayFilename,
} from '../utils/journalDayExport'
import { fileToCompressedDataUrl } from '../utils/receiptImage'
import {
  addShoppingItem,
  loadShoppingForWeek,
  removeShoppingItem,
  toggleShoppingItem,
} from '../utils/journalShoppingStorage'

function loadDraftFromLatest(iso) {
  const ent = loadKidJournalEntries()
  const forDay = ent.filter((e) => e.dateISO === iso)
  const latest = [...forDay].sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''))[0]
  if (!latest) {
    return {
      dayNotes: '',
      mealsText: '',
      morningNap: '',
      afternoonNap: '',
      handwrittenPhotoDataUrl: '',
    }
  }
  return {
    dayNotes: latest.dayNotes ?? '',
    mealsText: latest.mealsText ?? '',
    morningNap: latest.morningNap ?? '',
    afternoonNap: latest.afternoonNap ?? '',
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
  const [morningNap, setMorningNap] = useState('')
  const [afternoonNap, setAfternoonNap] = useState('')
  const [handwrittenPhotoDataUrl, setHandwrittenPhotoDataUrl] = useState('')
  const [handwrittenPhotoErr, setHandwrittenPhotoErr] = useState('')
  const handwrittenFileRef = useRef(null)
  const [journalReceiptOpen, setJournalReceiptOpen] = useState(false)
  const [suggestionClock, setSuggestionClock] = useState(() => Date.now())
  const [journalShareGateNow, setJournalShareGateNow] = useState(() => Date.now())
  const [outingsRev, setOutingsRev] = useState(0)
  const [shoppingItems, setShoppingItems] = useState([])

  useEffect(() => {
    setShoppingItems(loadShoppingForWeek(weekKey))
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
    setMorningNap(d.morningNap)
    setAfternoonNap(d.afternoonNap)
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

  function handleAddShopping(text) {
    setShoppingItems(addShoppingItem(weekKey, text))
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
      morningNap !== (latest.morningNap ?? '') ||
      afternoonNap !== (latest.afternoonNap ?? '') ||
      photo !== latestPhoto
    ) {
      addEntry({
        dateISO,
        dayNotes,
        mealsText,
        morningNap,
        afternoonNap,
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

  const forwardJournalSmsHref = useMemo(
    () =>
      buildJournalDaySmsHref({
        dateISO,
        dateLabel: journalDateLabel,
        dayNotes,
        mealsText,
        morningNap,
        afternoonNap,
        handwrittenPhotoDataUrl,
        shoppingItems,
      }),
    [
      dateISO,
      journalDateLabel,
      dayNotes,
      mealsText,
      morningNap,
      afternoonNap,
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
      morningNap,
      afternoonNap,
      handwrittenPhotoDataUrl,
      shoppingItems,
    }
  }

  function downloadJournalOfTheDay() {
    const text = buildJournalDayExportText(journalDayExportPayload())
    downloadJournalDayFile(journalDayFilename(dateISO), text)
  }

  return (
    <div className="page page--kid-journal work-ui">
      <div className="page__badge" aria-hidden>
        B
      </div>
      <ToolWorkspaceHead
        code="B"
        eyebrow="Kid journal workspace"
        title="Kid journal"
        lede="Log the day for parents. Outing nicknames in About today sync mileage to your weekly receipt."
      />

      <section className="journal__mileage-guide work-ui__panel" id="journal-mileage-guide" aria-labelledby="journal-mileage-guide-title">
        <h2 id="journal-mileage-guide-title" className="journal__mileage-guide-title">
          Sync mileage with your receipt
        </h2>
        <ol className="journal__mileage-guide-steps">
          <li>
            Pick the <strong>same week</strong> as on Schedule → Receipt (use the week strip below).
          </li>
          <li>
            In <strong>About today</strong>, type where you went using saved nicknames — e.g.{' '}
            <em>home, drop off, then music</em> (commas or new lines between stops).
          </li>
          <li>
            When nicknames match, they <strong>highlight</strong> — that means mileage is counting for this week.
          </li>
          <li>
            Open <strong>Receipt</strong> from Schedule to review total miles and reimbursement (updates as you type).
          </li>
        </ol>
      </section>

      <div className="journal__week-picker work-ui__panel">
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

      <JournalDayProgress dateISO={dateISO} dateLabel={journalDateLabel} />

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
          <TripPlacesField
            id="kid-journal-day-notes"
            value={dayNotes}
            onChange={setDayNotes}
            placeholder="e.g. home, drop off, music — use nicknames so miles sync"
            aria-labelledby="kid-journal-about-label"
            nestedInAbout
            describedByExtra="journal-mileage-guide"
          />
          <JournalParentMessageIdeas dateISO={dateISO} variant="journal" />
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
          <label className="field-block journal__nap-cell">
            <span className="field-block__label">Morning nap</span>
            <input
              type="text"
              className="input input--line"
              value={morningNap}
              onChange={(e) => setMorningNap(e.target.value)}
              placeholder="e.g. 9:30–10:15 or none"
            />
          </label>

          <label className="field-block journal__nap-cell">
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

        <div className="field-block journal__shopping">
          <span className="field-block__label" id="kid-journal-shopping-label">
            Shopping list
          </span>
          <p className="journal__hint muted">For this week — milk, snacks, supplies…</p>
          <TodoPanel
            todos={shoppingItems}
            onAdd={handleAddShopping}
            onToggle={handleToggleShopping}
            onRemove={handleRemoveShopping}
            placeholder="Add to shopping list…"
            emptyMessage="Nothing on the list yet."
          />
        </div>

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

      <JournalDayReceiptModal
        open={journalReceiptOpen}
        onClose={() => setJournalReceiptOpen(false)}
        dateLabel={journalDateLabel}
        dayNotes={dayNotes}
        mealsText={mealsText}
        morningNap={morningNap}
        afternoonNap={afternoonNap}
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
