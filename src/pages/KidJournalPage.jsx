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
import OutingsModal from '../components/OutingsModal'
import RemindersModal from '../components/RemindersModal'
import TodayJournalPreview from '../components/TodayJournalPreview'
import { buildJournalDaySmsHref } from '../utils/journalDayExport'
import {
  addShoppingItems,
  loadShoppingForWeek,
  removeShoppingItem,
  toggleShoppingItem,
} from '../utils/journalShoppingStorage'
import { napFromJournalEntry } from '../utils/journalNap'
import { pottyFromJournalEntry } from '../utils/journalLittleBooks'
import { combineJournalPost, journalPostFromEntry } from '../utils/journalPost'
import { useOutingsWeekData } from '../hooks/useOutingsWeekData'
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
      routeText: '',
      title: '',
      paragraph: '',
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
  const post = journalPostFromEntry(latest)
  return {
    dayNotes: latest.dayNotes ?? '',
    routeText: post.routeText,
    title: post.title,
    paragraph: post.paragraph,
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
  const [routeText, setRouteText] = useState('')
  const [title, setTitle] = useState('')
  const [paragraph, setParagraph] = useState('')
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
  const [outingsOpen, setOutingsOpen] = useState(false)
  const [remindersOpen, setRemindersOpen] = useState(false)
  const [aboutTodayOpen, setAboutTodayOpen] = useState(false)

  useEffect(() => {
    setShoppingItems(loadShoppingForWeek(weekKey))
  }, [weekKey])

  useEffect(() => {
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
    setRouteText(d.routeText)
    setTitle(d.title)
    setParagraph(d.paragraph)
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
      const draft = { [dateISO]: routeText || dayNotes }
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
  }, [journalWeekStart, weekKey, dateISO, dayNotes, routeText, entries, outingsRev])

  const mealParts = useMemo(() => parseMealsToParts(mealsText), [mealsText])
  const mealSuggestions = useMemo(() => {
    return getMealHealthSuggestions(countByCategory(mealParts), new Date(suggestionClock))
  }, [mealParts, suggestionClock])

  const canJournalSaveForward = useMemo(
    () => canJournalSaveForwardAt(journalShareGateNow, dateISO),
    [journalShareGateNow, dateISO]
  )

  useEffect(() => {
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
    const combinedDayNotes = combineJournalPost({ routeText, title, paragraph })
    if (
      routeText !== (latest.routeText ?? '') ||
      title !== (latest.title ?? '') ||
      paragraph !== (latest.paragraph ?? '') ||
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
        dayNotes: combinedDayNotes,
        routeText,
        title,
        paragraph,
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
        dayNotes: combineJournalPost({ routeText, title, paragraph }),
        routeText,
        title,
        paragraph,
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
      routeText,
      title,
      paragraph,
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

        <TodayJournalPreview
          dateLabel={journalDateLabel}
          dayNotes={dayNotes}
          routeText={routeText}
          title={title}
          paragraph={paragraph}
          mealsText={mealsText}
          mood={mood}
          nap={nap}
          pottyTime={pottyTime}
          pottyNotes={pottyNotes}
          wishes={wishes}
          reminderCount={reminderCount}
          groceryCount={shoppingOpenCount}
          onOpen={() => setAboutTodayOpen(true)}
          onOpenReminders={() => setRemindersOpen(true)}
          onOpenOutings={() => setOutingsOpen(true)}
        />
      </div>

      <AboutTodayModal
        open={aboutTodayOpen}
        onClose={() => {
          persistJournalIfChanged()
          setAboutTodayOpen(false)
        }}
        dateLabel={journalDateLabel}
        routeText={routeText}
        onRouteTextChange={setRouteText}
        title={title}
        onTitleChange={setTitle}
        paragraph={paragraph}
        onParagraphChange={setParagraph}
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
        shoppingItems={shoppingItems}
        onAddShoppingItems={handleAddGrocery}
        onToggleShopping={handleToggleShopping}
        onRemoveShopping={handleRemoveShopping}
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
        placeMiles={outings.placeMiles}
        onPlaceMilesChange={outings.setPlaceMiles}
        placeTripKind={outings.placeTripKind}
        onPlaceTripKindChange={outings.setPlaceTripKind}
        placeFormOpen={outings.placeFormOpen}
        onTogglePlaceFormOpen={() => outings.setPlaceFormOpen((o) => !o)}
        placeFormErr={outings.placeFormErr}
        onAddCustomPlace={outings.addCustomPlace}
        onRemoveCustomPlace={outings.removeCustomPlace}
      />
    </div>
  )
}
