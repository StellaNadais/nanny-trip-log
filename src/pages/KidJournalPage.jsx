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
import OutingsListTile from '../components/OutingsListTile'
import RemindersListTile from '../components/RemindersListTile'
import ScheduleTileStrip from '../components/ScheduleTileStrip'
import TodayAddTileButton from '../components/TodayAddTileButton'
import TodayAddTileModal from '../components/TodayAddTileModal'
import TodayCustomTilePreview from '../components/TodayCustomTilePreview'
import TodayCustomTileModal from '../components/TodayCustomTileModal'
import TodayJournalPreview from '../components/TodayJournalPreview'
import { buildJournalDaySmsHref } from '../utils/journalDayExport'
import { combineJournalPost, journalPostFromEntry } from '../utils/journalPost'
import {
  addShoppingItems,
  loadShoppingForWeek,
  removeShoppingItem,
  toggleShoppingItem,
} from '../utils/journalShoppingStorage'
import {
  addErrandItems,
  loadErrandsForWeek,
  removeErrandItem,
  toggleErrandItem,
} from '../utils/errandsStorage'
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
import {
  loadCustomTodayTiles,
  TODAY_CUSTOM_TILES_UPDATED_EVENT,
} from '../utils/todayCustomTilesStorage'
import { CLOUD_DATA_APPLIED_EVENT } from '../utils/cloudSync'

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
  const [errandItems, setErrandItems] = useState([])
  const [outingsOpen, setOutingsOpen] = useState(false)
  const [quickTasksOpen, setQuickTasksOpen] = useState(false)
  const [aboutTodayOpen, setAboutTodayOpen] = useState(false)
  const [addTileOpen, setAddTileOpen] = useState(false)
  const [openCustomTileId, setOpenCustomTileId] = useState(null)
  const [customTilesRev, setCustomTilesRev] = useState(0)

  useEffect(() => {
    setShoppingItems(loadShoppingForWeek(weekKey))
    setErrandItems(loadErrandsForWeek(weekKey))
  }, [weekKey])

  useEffect(() => {
    const refreshLists = () => {
      setShoppingItems(loadShoppingForWeek(weekKey))
      setErrandItems(loadErrandsForWeek(weekKey))
    }
    window.addEventListener(CLOUD_DATA_APPLIED_EVENT, refreshLists)
    return () => window.removeEventListener(CLOUD_DATA_APPLIED_EVENT, refreshLists)
  }, [weekKey])

  useEffect(() => {
    setOutingsOpen(false)
    setQuickTasksOpen(false)
    setAboutTodayOpen(false)
    setAddTileOpen(false)
    setOpenCustomTileId(null)
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
    const bumpOutings = () => setOutingsRev((r) => r + 1)
    window.addEventListener(OUTINGS_UPDATED_EVENT, bumpOutings)
    return () => window.removeEventListener(OUTINGS_UPDATED_EVENT, bumpOutings)
  }, [])

  useEffect(() => {
    const bumpTiles = () => setCustomTilesRev((r) => r + 1)
    window.addEventListener(TODAY_CUSTOM_TILES_UPDATED_EVENT, bumpTiles)
    return () => window.removeEventListener(TODAY_CUSTOM_TILES_UPDATED_EVENT, bumpTiles)
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
    setQuickTasksOpen(false)
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

  function handleAddErrand(raw) {
    setErrandItems(addErrandItems(weekKey, raw))
  }

  function handleToggleErrand(id) {
    setErrandItems(toggleErrandItem(weekKey, id))
  }

  function handleRemoveErrand(id) {
    setErrandItems(removeErrandItem(weekKey, id))
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
  const errandOpenCount = useMemo(
    () => errandItems.filter((item) => !item.done).length,
    [errandItems]
  )

  const reminderGroups = useMemo(
    () => careDayReminderGroups(reminders, bookings, dateISO),
    [reminders, bookings, dateISO]
  )

  const reminderCount = useMemo(
    () => countRemindersForCareDate(reminders, bookings, dateISO),
    [reminders, bookings, dateISO]
  )

  const combinedDayNotes = useMemo(
    () => combineJournalPost({ routeText, title, paragraph }),
    [routeText, title, paragraph]
  )

  const forwardJournalSmsHref = useMemo(
    () =>
      buildJournalDaySmsHref({
        dateISO,
        dateLabel: journalDateLabel,
        dayNotes: combinedDayNotes,
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
      combinedDayNotes,
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

  const customTiles = useMemo(() => {
    void customTilesRev
    return loadCustomTodayTiles()
  }, [customTilesRev])

  const openCustomTile = useMemo(
    () => customTiles.find((t) => t.id === openCustomTileId) ?? null,
    [customTiles, openCustomTileId]
  )

  const todayBoardTiles = useMemo(
    () =>
      customTiles.map((tile) => ({
        id: tile.id,
        label: tile.title,
        square: true,
        children: (
          <TodayCustomTilePreview tile={tile} onClick={() => setOpenCustomTileId(tile.id)} />
        ),
      })),
    [customTiles]
  )

  const todayStripTiles = useMemo(
    () => [
      {
        id: 'quick-tasks',
        children: (
          <RemindersListTile
            reminderCount={reminderCount}
            groceryCount={shoppingOpenCount}
            errandCount={errandOpenCount}
            onClick={() => setQuickTasksOpen(true)}
          />
        ),
      },
      {
        id: 'outings',
        children: <OutingsListTile onClick={() => setOutingsOpen(true)} />,
      },
      {
        id: 'add-box',
        children: <TodayAddTileButton onClick={() => setAddTileOpen(true)} />,
      },
    ],
    [reminderCount, shoppingOpenCount, errandOpenCount]
  )

  return (
    <div className="page page--kid-journal page--workspace page--today-blog work-ui">
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
          dayNotes={combinedDayNotes}
          routeText={routeText}
          title={title}
          paragraph={paragraph}
          mealsText={mealsText}
          nap={nap}
          pottyTime={pottyTime}
          pottyNotes={pottyNotes}
          wishes={wishes}
          onOpen={() => setAboutTodayOpen(true)}
        />

        <ScheduleTileStrip label="Today boxes" tiles={todayStripTiles} />

        {todayBoardTiles.length ? (
          <WorkspaceTileBoard workspaceId="today" tiles={todayBoardTiles} />
        ) : null}
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
        forwardSmsHref={forwardJournalSmsHref}
        canForward={canJournalSaveForward}
        onBeforeShareAction={beforeShareOrDownload}
      />

      <RemindersModal
        open={quickTasksOpen}
        onClose={() => setQuickTasksOpen(false)}
        dateLabel={journalDateLabel}
        groups={reminderGroups}
        groceryItems={shoppingItems}
        onAddGrocery={handleAddGrocery}
        onToggleGrocery={handleToggleShopping}
        onRemoveGrocery={handleRemoveShopping}
        errandItems={errandItems}
        onAddErrand={handleAddErrand}
        onToggleErrand={handleToggleErrand}
        onRemoveErrand={handleRemoveErrand}
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
        locationsOpen={outings.locationsOpen}
        onToggleLocationsOpen={() => outings.setLocationsOpen((o) => !o)}
        placeNickname={outings.placeNickname}
        onPlaceNicknameChange={outings.setPlaceNickname}
        placeRoundTrip={outings.placeRoundTrip}
        onPlaceRoundTripChange={outings.setPlaceRoundTrip}
        placeFormErr={outings.placeFormErr}
        onAddCustomPlace={outings.addCustomPlace}
        onRemoveCustomPlace={outings.removeCustomPlace}
      />

      <TodayAddTileModal
        open={addTileOpen}
        onClose={() => setAddTileOpen(false)}
        onCreated={(id) => {
          setCustomTilesRev((r) => r + 1)
          setOpenCustomTileId(id)
        }}
      />

      <TodayCustomTileModal
        open={Boolean(openCustomTile)}
        tile={openCustomTile}
        onClose={() => setOpenCustomTileId(null)}
        onChange={() => setCustomTilesRev((r) => r + 1)}
        onDelete={() => {
          setOpenCustomTileId(null)
          setCustomTilesRev((r) => r + 1)
        }}
      />
    </div>
  )
}
