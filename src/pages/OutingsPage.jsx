import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DayStrip } from '../components/DayStrip'
import {
  loadReceiptSettings,
  saveReceiptSettings,
  notifyReceiptMileageUpdated,
  RECEIPT_MILEAGE_EVENT,
} from '../utils/receiptStorage'
import { addDays, formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { MILE_RATE } from '../data/tripPlaces'
import { useBookings } from '../hooks/useBookings'
import { categoryLabel, categoryMeta, MANUAL_CATEGORIES } from '../data/receiptManualCategories'
import { receiptOpenLinkText, receiptPagePath } from '../utils/receiptHref'

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function emptyExtras() {
  return { photos: [], manualLines: [] }
}

function initialDayOffsetForWeek(mondayDate) {
  const monIso = toISODateLocal(mondayDate)
  const todayIso = toISODateLocal(new Date())
  const diff = Math.round(
    (new Date(todayIso + 'T12:00:00') - new Date(monIso + 'T12:00:00')) / 86400000
  )
  return Math.max(0, Math.min(6, diff))
}

export default function OutingsPage() {
  const { bookings } = useBookings()
  const [outingWeekStart, setOutingWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [dayOffset, setDayOffset] = useState(() =>
    initialDayOffsetForWeek(startOfWeekMonday(new Date()))
  )
  const [extras, setExtras] = useState(emptyExtras)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualCat, setManualCat] = useState('parking_ticket')
  const [manualAmt, setManualAmt] = useState('')
  const [manualNote, setManualNote] = useState('')
  const [mileageRev, setMileageRev] = useState(0)

  const weekKey = useMemo(() => toISODateLocal(outingWeekStart), [outingWeekStart])
  const dateISO = useMemo(
    () => toISODateLocal(addDays(outingWeekStart, dayOffset)),
    [outingWeekStart, dayOffset]
  )

  const receiptTo = useMemo(
    () => receiptPagePath(bookings, { gigDateISO: dateISO }),
    [bookings, dateISO]
  )
  const receiptLinkLabel = receiptOpenLinkText()
  const receiptWeekKey = weekKey
  const weekLabel = useMemo(() => formatWeekRange(outingWeekStart), [outingWeekStart])

  const outingsHeadingTip = useMemo(
    () =>
      `Add parking, tolls & other reimbursements for this week. Mileage still counts from Kid journal / Trip log ($${MILE_RATE}/mi) — totals land on Weekly receipt.`,
    []
  )

  function shiftOutingWeek(delta) {
    setOutingWeekStart((w) => addDays(w, delta * 7))
  }

  useEffect(() => {
    const bump = () => setMileageRev((r) => r + 1)
    window.addEventListener(RECEIPT_MILEAGE_EVENT, bump)
    return () => window.removeEventListener(RECEIPT_MILEAGE_EVENT, bump)
  }, [])

  useEffect(() => {
    const s = loadReceiptSettings()
    const row = s.extrasByWeek?.[receiptWeekKey]
    setExtras(
      row && Array.isArray(row.photos) && Array.isArray(row.manualLines)
        ? { photos: row.photos, manualLines: row.manualLines }
        : emptyExtras()
    )
  }, [receiptWeekKey, mileageRev])

  const commitExtras = useCallback(
    (updater) => {
      setExtras((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        const cur = loadReceiptSettings()
        saveReceiptSettings({
          extrasByWeek: { ...cur.extrasByWeek, [receiptWeekKey]: next },
        })
        notifyReceiptMileageUpdated()
        return next
      })
    },
    [receiptWeekKey]
  )

  const manualTotal = useMemo(
    () =>
      extras.manualLines.reduce((s, row) => s + (Number.isFinite(row.amount) ? row.amount : 0), 0),
    [extras.manualLines]
  )

  function addManualLine(e) {
    e.preventDefault()
    const amt = parseFloat(manualAmt)
    if (!Number.isFinite(amt) || amt < 0) return
    commitExtras((prev) => ({
      ...prev,
      manualLines: [
        ...prev.manualLines,
        {
          id: uid(),
          category: manualCat,
          note: manualNote.trim(),
          amount: Math.round(amt * 100) / 100,
        },
      ],
    }))
    setManualAmt('')
    setManualNote('')
    setManualOpen(false)
  }

  function removeManualLine(id) {
    commitExtras((prev) => ({
      ...prev,
      manualLines: prev.manualLines.filter((m) => m.id !== id),
    }))
  }

  const activeCat = categoryMeta(manualCat)

  return (
    <div className="page page--outings">
      <header className="outings__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Tools
        </Link>
        <h1
          className="outings__title outings__title--hover-tip"
          id="outings-page-heading"
          aria-describedby="outings-page-intro"
          data-tooltip={outingsHeadingTip}
        >
          Outings
        </h1>
        <p id="outings-page-intro" className="sr-only">
          {outingsHeadingTip}
        </p>
      </header>

      <div className="journal__week-picker outings__week-picker">
        <div className="trip-log__week-tools">
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => shiftOutingWeek(-1)}
          >
            ← Previous week
          </button>
          <button
            type="button"
            className="btn btn--ghost trip-log__week-btn"
            onClick={() => shiftOutingWeek(1)}
          >
            Next week →
          </button>
        </div>
        <p className="journal__week-range muted" aria-live="polite">
          {weekLabel}
        </p>
        <DayStrip
          weekStart={outingWeekStart}
          selectedIso={dateISO}
          onSelect={(iso) => {
            const a = new Date(weekKey + 'T12:00:00')
            const b = new Date(iso + 'T12:00:00')
            const diff = Math.round((b - a) / 86400000)
            setDayOffset(Math.max(0, Math.min(6, diff)))
          }}
        />
      </div>

      <section
        className="outings__section outings-expenses"
        aria-labelledby="outings-expenses-heading"
      >
        <div className="outings-expenses__hero">
          <p className="outings-expenses__eyebrow">This week</p>
          <h2 id="outings-expenses-heading" className="outings-expenses__title">
            Add expenses
          </h2>
          <p className="outings-expenses__lede">
            Parking, tolls, Fastrak &amp; more — synced to{' '}
            <Link to={receiptTo}>Weekly receipt</Link>.
          </p>
        </div>

        <div className="outings-expenses__panel">
          <button
            type="button"
            className={`outings-expenses__add-btn${manualOpen ? ' outings-expenses__add-btn--open' : ''}`}
            onClick={() => setManualOpen((o) => !o)}
            aria-expanded={manualOpen}
          >
            <span className="outings-expenses__add-btn-ico" aria-hidden>
              {manualOpen ? '−' : '+'}
            </span>
            {manualOpen ? 'Close form' : 'Add parking, tolls…'}
          </button>

          {manualOpen ? (
            <form
              className={`outings-expenses__form outings-expenses__form--${activeCat.tone}`}
              onSubmit={addManualLine}
            >
              <label className="field-block">
                <span className="field-block__label">Type</span>
                <select
                  className="input input--line"
                  value={manualCat}
                  onChange={(e) => setManualCat(e.target.value)}
                >
                  {MANUAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-block">
                <span className="field-block__label">Amount ($)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="input input--line"
                  value={manualAmt}
                  onChange={(e) => setManualAmt(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </label>
              <label className="field-block">
                <span className="field-block__label">Note (optional)</span>
                <input
                  type="text"
                  className="input input--line"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="e.g. garage downtown"
                />
              </label>
              <button type="submit" className="btn btn--primary outings-expenses__submit">
                Add to week
              </button>
            </form>
          ) : null}

          {extras.manualLines.length > 0 ? (
            <ul className="outings-expenses__list" aria-label="Expenses this week">
              {extras.manualLines.map((m) => {
                const meta = categoryMeta(m.category)
                return (
                  <li
                    key={m.id}
                    className={`outings-expenses__chip outings-expenses__chip--${meta.tone}`}
                  >
                    <span className="outings-expenses__chip-emoji" aria-hidden>
                      {meta.emoji}
                    </span>
                    <div className="outings-expenses__chip-body">
                      <span className="outings-expenses__chip-type">{categoryLabel(m.category)}</span>
                      {m.note ? (
                        <span className="outings-expenses__chip-note">{m.note}</span>
                      ) : null}
                    </div>
                    <span className="outings-expenses__chip-amt">${Number(m.amount).toFixed(2)}</span>
                    <button
                      type="button"
                      className="outings-expenses__chip-remove"
                      onClick={() => removeManualLine(m.id)}
                      aria-label={`Remove ${categoryLabel(m.category)} $${Number(m.amount).toFixed(2)}`}
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="outings-expenses__empty">
              <span className="outings-expenses__empty-emoji" aria-hidden>
                🧾
              </span>
              Nothing yet — tap <strong>Add parking, tolls…</strong> when you have a receipt moment.
            </p>
          )}

          <div className="outings-expenses__total" aria-live="polite">
            <span className="outings-expenses__total-label">Week total</span>
            <span className="outings-expenses__total-amt">${manualTotal.toFixed(2)}</span>
          </div>
        </div>

        <Link to={receiptTo} className="btn btn--ghost outings__to-receipt">
          {receiptLinkLabel}
        </Link>
      </section>
    </div>
  )
}
