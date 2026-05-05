import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { addDays, formatWeekRange, toISODateLocal } from '../utils/dates'
import { useKidJournal } from '../hooks/useKidJournal'
import { useTripLog } from '../hooks/useTripLog'
import { DayStrip } from '../components/DayStrip'
import { DayLogPanel } from '../components/DayLogPanel'
import { ExpensePanel } from '../components/ExpensePanel'
import { computeWeekTripMileage } from '../utils/parseTripPlaces'
import { MILE_RATE } from '../data/tripPlaces'
import { notifyReceiptMileageUpdated, saveReceiptSettings } from '../utils/receiptStorage'
import { OUTINGS_UPDATED_EVENT } from '../utils/outingsStorage'
import { useBookings } from '../hooks/useBookings'
import { isWeeklyReceiptBusinessHours } from '../utils/receiptWindowMode'
import { receiptOpenLinkText, receiptPagePath } from '../utils/receiptHref'
import '../App.css'

const TABS = [
  { id: 'log', label: 'Day log' },
  { id: 'expenses', label: 'Expenses' },
]

export default function TripLogPage() {
  const log = useTripLog()
  const { entries: journalEntries } = useKidJournal()
  const { bookings } = useBookings()
  const [tab, setTab] = useState('log')
  const [dayOffset, setDayOffset] = useState(0)
  const [outingsRev, setOutingsRev] = useState(0)

  useEffect(() => {
    const bump = () => setOutingsRev((r) => r + 1)
    window.addEventListener(OUTINGS_UPDATED_EVENT, bump)
    return () => window.removeEventListener(OUTINGS_UPDATED_EVENT, bump)
  }, [])
  const selectedIso = useMemo(
    () => toISODateLocal(addDays(log.weekStart, dayOffset)),
    [log.weekStart, dayOffset]
  )

  const receiptTo = useMemo(
    () => receiptPagePath(bookings, { gigDateISO: selectedIso }),
    [bookings, selectedIso]
  )
  const receiptLinkLabel = receiptOpenLinkText()
  const tripLogReceiptPhrase = isWeeklyReceiptBusinessHours()
    ? 'Weekly receipt'
    : 'Receipt'

  const day = log.daysByIso[selectedIso]

  const weekPreview = useMemo(
    () => computeWeekTripMileage(log.weekStart, log.daysByIso, journalEntries),
    [log.weekStart, log.daysByIso, journalEntries, outingsRev]
  )

  useEffect(() => {
    const t = window.setTimeout(() => {
      const { totalMiles, reimbursement, breakdown } = computeWeekTripMileage(
        log.weekStart,
        log.daysByIso,
        journalEntries
      )
      const weekLabel = formatWeekRange(log.weekStart)
      saveReceiptSettings({
        mileageByWeek: {
          [log.weekKey]: {
            totalMiles,
            reimbursement,
            breakdown,
            weekLabel,
            updatedAt: Date.now(),
          },
        },
      })
      notifyReceiptMileageUpdated()
    }, 450)
    return () => window.clearTimeout(t)
  }, [log.weekStart, log.weekKey, log.daysByIso, journalEntries, outingsRev])

  return (
    <div className="app">
      <header className="app__header">
        <div className="page-toolbar">
          <Link to="/hub" className="page-back">
            ← Hub
          </Link>
        </div>
        <div className="app__title-row">
          <h1 className="app__title">Trip log</h1>
          <span className="app__subtitle">Outings & parent notes</span>
        </div>
        <div className="trip-log__week-tools">
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => log.shiftWeek(-1)}
          >
            ← Previous week
          </button>
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => log.shiftWeek(1)}
          >
            Next week →
          </button>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tabs__btn ${tab === t.id ? 'tabs__btn--on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app__main">
        {tab === 'log' && (
          <>
            <DayStrip
              weekStart={log.weekStart}
              selectedIso={selectedIso}
              onSelect={(iso) => {
                const a = new Date(log.weekKey + 'T12:00:00')
                const b = new Date(iso + 'T12:00:00')
                const diff = Math.round((b - a) / 86400000)
                setDayOffset(Math.max(0, Math.min(6, diff)))
              }}
            />
            <div className="app__scroll">
              <DayLogPanel
                iso={selectedIso}
                day={day}
                ensureDay={log.ensureDay}
                onChange={log.updateDay}
              />
            </div>
            <div className="trip-log__submit-bar">
              <p className="trip-log__submit-preview muted">
                This week: {weekPreview.totalMiles.toFixed(1)} mi round-trip · @ ${MILE_RATE}/mi ={' '}
                <strong>${weekPreview.reimbursement.toFixed(2)}</strong> — syncs to {tripLogReceiptPhrase} as you type.
              </p>
              <Link to={receiptTo} className="trip-log__receipt-link trip-log__receipt-link--solo">
                {receiptLinkLabel}
              </Link>
            </div>
          </>
        )}
        {tab === 'expenses' && (
          <div className="app__scroll">
            <ExpensePanel
              expenses={log.expenses}
              onAdd={log.addExpense}
              onRemove={log.removeExpense}
            />
          </div>
        )}
      </main>
    </div>
  )
}
