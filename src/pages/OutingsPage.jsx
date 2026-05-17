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
import { categoryLabel, MANUAL_CATEGORIES } from '../data/receiptManualCategories'
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
      `Mileage — type place names in Kid journal or Trip log; distances are built in (plus any saved extras on this device). Use “then” or + between stops for one trip. Totals sync to Weekly receipt ($${MILE_RATE}/mi). Parking & tolls entry is per week below.`,
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

  return (
    <div className="page page--outings">
      <header className="outings__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
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

      <section className="outings__section outings__section--receipt outings__section--solo" aria-labelledby="outings-receipt-heading">
        <h2 id="outings-receipt-heading" className="outings__section-title">
          Parking &amp; other expenses (weekly)
        </h2>
        <p className="muted outings__hint">
          Same calendar week as above; totals sync to <Link to={receiptTo}>Weekly receipt</Link>.
        </p>

        <div className="receipt__manual-block outings__manual">
          <button
            type="button"
            className="btn receipt__manual-toggle"
            onClick={() => setManualOpen((o) => !o)}
            aria-expanded={manualOpen}
          >
            {manualOpen ? 'Hide' : 'Enter manually'} — parking, tolls, Fastrak…
          </button>
          {manualOpen ? (
            <form className="receipt__manual-form" onSubmit={addManualLine}>
              <label className="field-block">
                <span className="field-block__label">Type</span>
                <select className="input input--line" value={manualCat} onChange={(e) => setManualCat(e.target.value)}>
                  {MANUAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
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
                  placeholder="e.g. garage on Oak"
                />
              </label>
              <button type="submit" className="btn btn--primary">
                Add to receipt
              </button>
            </form>
          ) : null}
          {extras.manualLines.length > 0 ? (
            <ul className="receipt__manual-list">
              {extras.manualLines.map((m) => (
                <li key={m.id} className="receipt__manual-row">
                  <span>
                    {categoryLabel(m.category)}
                    {m.note ? ` · ${m.note}` : ''}
                  </span>
                  <span className="receipt__manual-row-amt">${Number(m.amount).toFixed(2)}</span>
                  <button type="button" className="btn btn--ghost receipt__manual-remove" onClick={() => removeManualLine(m.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <p className="muted outings__manual-total">
          Manual reimbursements this week:{' '}
          <strong>${manualTotal.toFixed(2)}</strong>
        </p>

        <Link to={receiptTo} className="btn btn--ghost outings__to-receipt">
          {receiptLinkLabel}
        </Link>
      </section>
    </div>
  )
}
