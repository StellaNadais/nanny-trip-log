import { useEffect, useMemo, useState } from 'react'
import { DayStrip } from '../components/DayStrip'
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
import AboutTodayModal from '../components/AboutTodayModal'
import GroceryModal from '../components/GroceryModal'
import OutingsModal from '../components/OutingsModal'
import RemindersModal from '../components/RemindersModal'
import TodaySpaceTile from '../components/TodaySpaceTile'
import { buildJournalDaySmsHref } from '../utils/journalDayExport'
import {
  addShoppingItems,
  loadShoppingForWeek,
  removeShoppingItem,
  toggleShoppingItem,
} from '../utils/journalShoppingStorage'
import { napFromJournalEntry } from '../utils/journalNap'
import { pottyFromJournalEntry } from '../utils/journalLittleBooks'
import { useOutingsWeekData } from '../hooks/useOutingsWeekData'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'
import { useBookings } from '../hooks/useBookings'
import { useParentReminders } from '../hooks/useParentReminders'
import {
  careDayReminderGroups,
  countRemindersForCareDate,
} from '../utils/parentReminderQueries'

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
  const { bookings } = useBookings()
  const { reminders } = useParentReminders()
  const [journalWeekStart, setJournalWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )

  const weekKey = useMemo(() => toISODateLocal(journalWeekStart), [journalWeekStart])
  const dateISO = useMemo(
    () => toISODateLocal(addDays(journalWeekStart, dayOffset)),
    [journalWeekStart, dayOffset]
  )

  const outings = useOutingsWeekData(weekKey)

  const [dayNotes, setDayNotes] = useState('')
  const [mealsText, setMealsText] = useState('')
  const [nap, setNap] = useState('')
  const [pottyTime, setPottyTime] = useState('')
  const [pottyNotes, setPottyNotes] = useState('')
  const [wishes, setWishes] = useState('')
  const [mood, setMood] = useState('')
  const [handwrittenPhotoDataUrl, setHandwrittenPhotoDataUrl] = useState('')
  const [suggestionClock, setSuggestionClock] = useState(() => Date.now())
  const [journalShareGateNow, setJournalShareGateNow] = useState(() => Date.now())
  const [outingsRev, setOutingsRev] = useState(0)
  const [shoppingItems, setShoppingItems] = useState([])
  const [groceryOpen, setGroceryOpen] = useState(false)
  const [outingsOpen, setOutingsOpen] = useState(false)
  const [remindersOpen, setRemindersOpen] = useState(false)
  const [aboutTodayOpen, setAboutTodayOpen] = useState(false)

  useEffect(() => {
    setShoppingItems(loadShoppingForWeek(weekKey))
  }, [weekKey])

  useEffect(() => {
    setGroceryOpen(false)
    setOutingsOpen(false)
    setRemindersOpen(false)
    setAboutTodayOpen(false)
    outings.resetOutingsForm()
  }, [weekKey, outings.resetOutingsForm])

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
    setGroceryOpen(false)
    setOutingsOpen(false)
    setRemindersOpen(false)
    setAboutTodayOpen(false)
    outings.resetOutingsForm()
  }, [dateISO, outings.resetOutingsForm])

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

  function beforeShareOrDownload() {
    setJournalShareGateNow(Date.now())
    persistJournalIfChanged()
  }

  const aboutTodayPreview = useMemo(() => {
    const bits = [dayNotes, mealsText, mood, nap, wishes].map((s) => String(s || '').trim()).filter(Boolean)
    if (!bits.length) return ''
    if (dayNotes.trim()) {
      const t = dayNotes.trim()
      return t.length > 120 ? `${t.slice(0, 117)}…` : t
    }
    return "Tap to add today's report…"
  }, [dayNotes, mealsText, mood, nap, wishes])

  const journalDateLabel = formatJournalDate(dateISO)
  const weekLabel = formatWeekRange(journalWeekStart)
  const shoppingOpenCount = useMemo(
    () => shoppingItems.filter((item) => !item.done).length,
    [shoppingItems]
  )

  const reminderGroups = useMemo(
    () => careDayReminderGroups(reminders, bookings, dateISO),
    [reminders, bookings, dateISO]
  )

  const reminderCount = useMemo(
    () => countRemindersForCareDate(reminders, bookings, dateISO),
    [reminders, bookings, dateISO]
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

  const groceryPreview = useMemo(() => {
    const open = shoppingItems.filter((item) => !item.done)
    if (!open.length) return ''
    return open
      .slice(0, 3)
      .map((item) => item.text)
      .join(', ')
  }, [shoppingItems])

  const remindersPreview = useMemo(() => {
    if (!reminderGroups.length) return ''
    for (const group of reminderGroups) {
      const first = group.reminders[0]
      if (first?.text) {
        const prefix = first.childName ? `${first.childName}: ` : ''
        const line = `${prefix}${first.text}`
        return line.length > 72 ? `${line.slice(0, 69)}…` : line
      }
      if (group.notes) {
        const line = group.notes.trim()
        return line.length > 72 ? `${line.slice(0, 69)}…` : line
      }
    }
    const family = reminderGroups[0]?.booking?.familyName
    return family ? `${family} — no reminders yet` : ''
  }, [reminderGroups])

  const aboutTodayIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )

  const remindersIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )

  const groceryIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
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
  )

  const outingsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )

  return (
    <div className="page page--kid-journal page--workspace work-ui">
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

        <WorkspaceTileBoard
          workspaceId="today"
          tiles={[
            {
              id: 'about',
              label: 'About today',
              square: true,
              children: (
                <TodaySpaceTile
                  icon={aboutTodayIcon}
                  preview={aboutTodayPreview}
                  hint="Tap to report the day with your child — outings, meals, nap, and more."
                  cta="Open report →"
                  onClick={() => setAboutTodayOpen(true)}
                />
              ),
            },
            {
              id: 'reminders',
              label: 'Reminders',
              square: true,
              children: (
                <TodaySpaceTile
                  icon={remindersIcon}
                  count={reminderCount}
                  preview={remindersPreview}
                  hint="Parent notes for this day — tap to open."
                  onClick={() => setRemindersOpen(true)}
                />
              ),
            },
            {
              id: 'grocery',
              label: 'Grocery',
              square: true,
              children: (
                <TodaySpaceTile
                  icon={groceryIcon}
                  count={shoppingOpenCount}
                  preview={groceryPreview}
                  hint="Week grocery list — tap to add items."
                  onClick={() => setGroceryOpen(true)}
                />
              ),
            },
            {
              id: 'outings',
              label: 'Outings',
              square: true,
              children: (
                <TodaySpaceTile
                  icon={outingsIcon}
                  count={outings.outingsCount}
                  preview={outings.outingsPreview}
                  hint="Parking, tolls, and trip places — tap to add."
                  onClick={() => setOutingsOpen(true)}
                />
              ),
            },
          ]}
        />
      </div>

      <AboutTodayModal
        open={aboutTodayOpen}
        onClose={() => {
          persistJournalIfChanged()
          setAboutTodayOpen(false)
        }}
        dateLabel={journalDateLabel}
        dayNotes={dayNotes}
        onDayNotesChange={setDayNotes}
        mealsText={mealsText}
        onMealsChange={setMealsText}
        mealSuggestions={mealSuggestions}
        nap={nap}
        onNapChange={setNap}
        pottyTime={pottyTime}
        onPottyTimeChange={setPottyTime}
        pottyNotes={pottyNotes}
        onPottyNotesChange={setPottyNotes}
        wishes={wishes}
        onWishesChange={setWishes}
        mood={mood}
        onMoodChange={setMood}
        handwrittenPhotoDataUrl={handwrittenPhotoDataUrl}
        forwardSmsHref={forwardJournalSmsHref}
        canForward={canJournalSaveForward}
        onBeforeShareAction={beforeShareOrDownload}
      />

      <RemindersModal
        open={remindersOpen}
        onClose={() => setRemindersOpen(false)}
        dateLabel={journalDateLabel}
        groups={reminderGroups}
      />

      <GroceryModal
        open={groceryOpen}
        onClose={() => setGroceryOpen(false)}
        weekLabel={weekLabel}
        items={shoppingItems}
        onAddItems={handleAddGrocery}
        onToggle={handleToggleShopping}
        onRemove={handleRemoveShopping}
      />

      <OutingsModal
        open={outingsOpen}
        onClose={() => {
          setOutingsOpen(false)
          outings.resetOutingsForm()
        }}
        weekLabel={weekLabel}
        extras={outings.extras}
        manualOpen={outings.manualOpen}
        onToggleManualOpen={() => outings.setManualOpen((o) => !o)}
        manualCat={outings.manualCat}
        onManualCatChange={outings.setManualCat}
        manualAmt={outings.manualAmt}
        onManualAmtChange={outings.setManualAmt}
        manualNote={outings.manualNote}
        onManualNoteChange={outings.setManualNote}
        onAddManualLine={outings.addManualLine}
        onRemoveManualLine={outings.removeManualLine}
        manualTotal={outings.manualTotal}
        customPlaces={outings.customPlaces}
        placeNickname={outings.placeNickname}
        onPlaceNicknameChange={outings.setPlaceNickname}
        placeRoundTrip={outings.placeRoundTrip}
        onPlaceRoundTripChange={outings.setPlaceRoundTrip}
        placeFormErr={outings.placeFormErr}
        onAddCustomPlace={outings.addCustomPlace}
        onRemoveCustomPlace={outings.removeCustomPlace}
      />
    </div>
  )
}
