import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReceiptThermalModal from '../components/ReceiptThermalModal'
import {
  loadReceiptSettings,
  saveReceiptSettings,
  RECEIPT_MILEAGE_EVENT,
} from '../utils/receiptStorage'
import { fileToCompressedDataUrl } from '../utils/receiptImage'
import { formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { MILE_RATE } from '../data/tripPlaces'

const BASE_RATE = 31
const EXTRA_CHILD_PER_HOUR = 5

const MANUAL_CATEGORIES = [
  { id: 'parking_ticket', label: 'Parking ticket' },
  { id: 'parking_spot', label: 'Parking spot' },
  { id: 'ticket_entry', label: 'Ticket / entry' },
  { id: 'tolls', label: 'Tolls' },
  { id: 'fastrak', label: 'Fastrak' },
  { id: 'other', label: 'Other' },
]

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeVenmo(s) {
  return String(s || '')
    .trim()
    .replace(/^@/, '')
}

function ratePerHour(numChildren) {
  const n = Math.max(1, Math.floor(Number(numChildren)) || 1)
  return BASE_RATE + EXTRA_CHILD_PER_HOUR * Math.max(0, n - 1)
}

function buildVenmoUrl(handle, amount, note) {
  const user = normalizeVenmo(handle)
  if (!user) return ''
  const amt = Number(amount)
  if (!Number.isFinite(amt) || amt <= 0) return ''
  const params = new URLSearchParams({
    txn: 'pay',
    amount: amt.toFixed(2),
    note: note.slice(0, 200),
  })
  return `https://venmo.com/${encodeURIComponent(user)}?${params.toString()}`
}

function categoryLabel(id) {
  return MANUAL_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

function emptyExtras() {
  return { photos: [], manualLines: [] }
}

export default function WeeklyReceiptPage() {
  const initialSettings = useMemo(() => loadReceiptSettings(), [])
  const [venmoHandle, setVenmoHandle] = useState(initialSettings.venmoHandle)
  const [hours, setHours] = useState('')
  const [numChildren, setNumChildren] = useState('1')
  const [weekOf, setWeekOf] = useState(() => toISODateLocal(startOfWeekMonday(new Date())))
  const [copied, setCopied] = useState('')
  const [mileageRev, setMileageRev] = useState(0)
  const [extras, setExtras] = useState(emptyExtras)
  const [photoErr, setPhotoErr] = useState('')
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualCat, setManualCat] = useState('parking_ticket')
  const [manualAmt, setManualAmt] = useState('')
  const [manualNote, setManualNote] = useState('')
  const fileRef = useRef(null)

  const receiptWeekKey = useMemo(
    () => toISODateLocal(startOfWeekMonday(new Date(weekOf + 'T12:00:00'))),
    [weekOf]
  )

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
    setPhotoErr('')
  }, [receiptWeekKey])

  const commitExtras = useCallback((updater) => {
    setExtras((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const cur = loadReceiptSettings()
      saveReceiptSettings({
        extrasByWeek: { ...cur.extrasByWeek, [receiptWeekKey]: next },
      })
      return next
    })
  }, [receiptWeekKey])

  const mileageEntry = useMemo(() => {
    return loadReceiptSettings().mileageByWeek?.[receiptWeekKey] ?? null
  }, [receiptWeekKey, mileageRev])

  const h = parseFloat(hours)
  const hoursValid = Number.isFinite(h) && h > 0
  const n = Math.max(1, Math.floor(parseInt(numChildren, 10) || 1))
  const rate = ratePerHour(n)
  const extraKids = Math.max(0, n - 1)

  const lineBase = hoursValid ? BASE_RATE * h : 0
  const lineExtra = hoursValid ? EXTRA_CHILD_PER_HOUR * extraKids * h : 0
  const laborTotal = hoursValid ? rate * h : 0
  const mileReimb = mileageEntry?.reimbursement ?? 0
  const manualTotal = useMemo(
    () =>
      extras.manualLines.reduce((s, row) => s + (Number.isFinite(row.amount) ? row.amount : 0), 0),
    [extras.manualLines]
  )
  const combinedTotal = laborTotal + mileReimb + manualTotal

  const weekLabel = useMemo(() => {
    try {
      return formatWeekRange(startOfWeekMonday(new Date(weekOf + 'T12:00:00')))
    } catch {
      return weekOf
    }
  }, [weekOf])

  const noteText = `Nanny care — week of ${weekLabel}`

  const venmoUrl = useMemo(
    () => buildVenmoUrl(venmoHandle, combinedTotal, noteText),
    [venmoHandle, combinedTotal, noteText]
  )

  const receiptText = useMemo(() => {
    const lines = [`Weekly nanny receipt`, `Week: ${weekLabel}`, `Children: ${n}`, ``]
    if (hoursValid) {
      lines.push(`$${BASE_RATE}/hr × ${h} hr (base) = $${lineBase.toFixed(2)}`)
      if (extraKids > 0) {
        lines.push(
          `+$${EXTRA_CHILD_PER_HOUR}/hr × ${extraKids} extra × ${h} hr = $${lineExtra.toFixed(2)}`
        )
      }
      lines.push(``, `Care subtotal: $${laborTotal.toFixed(2)}`)
    } else {
      lines.push(`(Enter hours above for wage line items.)`, ``)
    }
    if (mileageEntry && mileReimb > 0) {
      lines.push(
        `Mileage (trip log): ${mileageEntry.totalMiles.toFixed(1)} mi × $${MILE_RATE}/mi = $${mileReimb.toFixed(2)}`
      )
    }
    if (extras.manualLines.length > 0) {
      lines.push(``)
      for (const m of extras.manualLines) {
        const tail = m.note ? ` — ${m.note}` : ''
        lines.push(`${categoryLabel(m.category)}${tail}: $${Number(m.amount).toFixed(2)}`)
      }
      lines.push(`Reimbursements subtotal: $${manualTotal.toFixed(2)}`)
    }
    if (extras.photos.length > 0) {
      lines.push(``, `Receipt photos on file: ${extras.photos.length}`)
    }
    lines.push(``, `Total due: $${combinedTotal.toFixed(2)}`)
    if (hoursValid) {
      lines.push(`Effective rate (wage only): $${rate.toFixed(2)}/hr`)
    }
    if (normalizeVenmo(venmoHandle)) {
      lines.push(``, `Pay: Venmo @${normalizeVenmo(venmoHandle)}`)
    }
    return lines.join('\n')
  }, [
    weekLabel,
    n,
    hoursValid,
    h,
    lineBase,
    lineExtra,
    extraKids,
    laborTotal,
    rate,
    mileageEntry,
    mileReimb,
    combinedTotal,
    venmoHandle,
    extras.manualLines,
    extras.photos.length,
    manualTotal,
  ])

  const thermalRows = useMemo(() => {
    const rows = []
    if (hoursValid) {
      rows.push({ desc: `Care @ $${BASE_RATE}/hr × ${h}h`, amt: `$${lineBase.toFixed(2)}` })
      if (extraKids > 0) {
        rows.push({
          desc: `Extra kids +$${EXTRA_CHILD_PER_HOUR}/hr × ${extraKids} × ${h}h`,
          amt: `$${lineExtra.toFixed(2)}`,
        })
      }
    } else {
      rows.push({ desc: 'Care wages (add hours)', amt: '—' })
    }
    if (mileReimb > 0) {
      rows.push({
        desc: `Mileage ${mileageEntry?.totalMiles?.toFixed(1) ?? '?'} mi @ $${MILE_RATE}`,
        amt: `$${mileReimb.toFixed(2)}`,
      })
    }
    for (const m of extras.manualLines) {
      const note = m.note ? ` ${m.note}` : ''
      rows.push({
        desc: `${categoryLabel(m.category)}${note}`.trim(),
        amt: `$${Number(m.amount).toFixed(2)}`,
      })
    }
    return rows
  }, [
    hoursValid,
    h,
    lineBase,
    extraKids,
    lineExtra,
    mileReimb,
    mileageEntry,
    extras.manualLines,
  ])

  function persistVenmo(v) {
    setVenmoHandle(v)
    saveReceiptSettings({ venmoHandle: v })
  }

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(receiptText)
      setCopied('Copied!')
      setTimeout(() => setCopied(''), 2000)
    } catch {
      setCopied('Copy failed')
    }
  }

  async function onPickPhoto(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setPhotoErr('')
    try {
      const dataUrl = await fileToCompressedDataUrl(f)
      commitExtras((prev) => {
        if (prev.photos.length >= 8) {
          setPhotoErr('Max 8 receipt photos per week.')
          return prev
        }
        setPhotoErr('')
        return { ...prev, photos: [...prev.photos, { id: uid(), dataUrl }] }
      })
    } catch {
      setPhotoErr('Could not add photo. Try a smaller image.')
    }
  }

  function removePhoto(id) {
    commitExtras((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }))
  }

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

  const hasReceiptContent =
    hoursValid || mileReimb > 0 || manualTotal > 0 || extras.photos.length > 0
  const showSummary =
    hoursValid || mileReimb > 0 || manualTotal > 0 || extras.photos.length > 0
  const showVenmoActions = combinedTotal > 0

  return (
    <div className="page page--receipt">
      <header className="receipt__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <h1 className="receipt__title">Weekly receipt</h1>
        <p className="receipt__lede muted">
          $31/hour + $5/hr per extra child. Trip log mileage, receipt photos, and manual parking /
          tolls / Fastrak add to this total.
        </p>
      </header>

      <div className="receipt__form">
        <label className="field-block">
          <span className="field-block__label">Week (Monday of week)</span>
          <input
            type="date"
            className="input input--line"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
          />
        </label>
        <p className="receipt__week-hint muted">{weekLabel}</p>

        {mileageEntry ? (
          <p className="receipt__mileage-sync muted">
            Trip log mileage for this week:{' '}
            <strong>
              {mileageEntry.totalMiles.toFixed(1)} mi → ${mileageEntry.reimbursement.toFixed(2)}
            </strong>
            {mileageEntry.weekLabel ? ` (${mileageEntry.weekLabel})` : null}
          </p>
        ) : (
          <p className="receipt__mileage-sync muted">
            No trip log mileage for this week yet — type place names in{' '}
            <Link to="/trip-log">Trip log</Link> (they sync here automatically).
          </p>
        )}

        <div className="receipt__capture-block">
          <span className="field-block__label">Receipt photos</span>
          <p className="receipt__capture-hint muted">
            Take or choose photos of receipts; they appear on the print-style receipt.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={onPickPhoto}
          />
          <button
            type="button"
            className="btn btn--primary receipt__pic-btn"
            onClick={() => fileRef.current?.click()}
          >
            Take / add receipt photo
          </button>
          {photoErr ? <p className="receipt__photo-err muted">{photoErr}</p> : null}
          {extras.photos.length > 0 ? (
            <ul className="receipt__thumb-list">
              {extras.photos.map((p) => (
                <li key={p.id} className="receipt__thumb-item">
                  <img src={p.dataUrl} alt="" className="receipt__thumb" />
                  <button
                    type="button"
                    className="btn btn--ghost receipt__thumb-remove"
                    onClick={() => removePhoto(p.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="receipt__manual-block">
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
                <select
                  className="input input--line"
                  value={manualCat}
                  onChange={(e) => setManualCat(e.target.value)}
                >
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
                  <button
                    type="button"
                    className="btn btn--ghost receipt__manual-remove"
                    onClick={() => removeManualLine(m.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <label className="field-block">
          <span className="field-block__label">Hours this week</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            className="input input--line"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. 32.5"
          />
        </label>

        <label className="field-block">
          <span className="field-block__label">Children in care</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            className="input input--line"
            value={numChildren}
            onChange={(e) => setNumChildren(e.target.value)}
          />
        </label>

        <label className="field-block">
          <span className="field-block__label">Your Venmo username</span>
          <input
            type="text"
            className="input input--line"
            value={venmoHandle}
            onChange={(e) => persistVenmo(e.target.value)}
            placeholder="@YourVenmo or YourVenmo"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="receipt__popup-actions">
        <button
          type="button"
          className="btn btn--primary receipt__open-ticket"
          onClick={() => setReceiptOpen(true)}
          disabled={!hasReceiptContent}
        >
          View print-style receipt
        </button>
        {!hasReceiptContent ? (
          <p className="muted receipt__popup-hint">Add hours, mileage, photos, or manual lines first.</p>
        ) : null}
      </div>

      <section className="receipt__math" aria-live="polite">
        <h2 className="receipt__math-title">Totals</h2>
        {!showSummary ? (
          <p className="muted">Enter hours, trip log mileage, photos, or manual expenses to build your receipt.</p>
        ) : (
          <>
            {hoursValid ? (
              <ul className="receipt__lines">
                <li>
                  <span>${BASE_RATE}/hr × {h} hr (1st child)</span>
                  <span>${lineBase.toFixed(2)}</span>
                </li>
                {extraKids > 0 ? (
                  <li>
                    <span>
                      +${EXTRA_CHILD_PER_HOUR}/hr × {extraKids} extra × {h} hr
                    </span>
                    <span>${lineExtra.toFixed(2)}</span>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="muted">Care wages: enter hours above.</p>
            )}
            {hoursValid ? (
              <p className="receipt__rate muted">
                Care: <strong>${laborTotal.toFixed(2)}</strong> (effective ${rate.toFixed(2)}/hr)
              </p>
            ) : null}
            {mileReimb > 0 ? (
              <p className="receipt__mileage-line muted">
                Mileage @ ${MILE_RATE}/mi:{' '}
                <strong>${mileReimb.toFixed(2)}</strong> ({mileageEntry?.totalMiles?.toFixed(1)} mi)
              </p>
            ) : null}
            {manualTotal > 0 ? (
              <p className="receipt__manual-total muted">
                Parking / tolls / other: <strong>${manualTotal.toFixed(2)}</strong>
              </p>
            ) : null}
            {extras.photos.length > 0 ? (
              <p className="muted">{extras.photos.length} receipt photo(s) on file</p>
            ) : null}
            <p className="receipt__total">
              Total due: <strong>${combinedTotal.toFixed(2)}</strong>
            </p>
          </>
        )}
      </section>

      {showVenmoActions ? (
        <section className="receipt__actions">
          {venmoUrl ? (
            <a
              href={venmoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary receipt__venmo"
            >
              Pay with Venmo (${combinedTotal.toFixed(2)})
            </a>
          ) : (
            <p className="muted receipt__venmo-hint">Add your Venmo username to open a pay link.</p>
          )}
          <button type="button" className="btn receipt__copy" onClick={copyReceipt}>
            Copy receipt text
          </button>
          {copied ? <span className="receipt__copied muted">{copied}</span> : null}
          <pre className="receipt__preview" aria-label="Receipt preview">
            {receiptText}
          </pre>
        </section>
      ) : null}

      <ReceiptThermalModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        weekLabel={weekLabel}
        rows={thermalRows}
        photos={extras.photos}
        totalCentsDisplay={`$${combinedTotal.toFixed(2)}`}
      >
        {showVenmoActions ? (
          <>
            {venmoUrl ? (
              <a
                href={venmoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary receipt-modal__venmo"
              >
                Pay with Venmo (${combinedTotal.toFixed(2)})
              </a>
            ) : null}
            <button type="button" className="btn receipt-modal__copy" onClick={copyReceipt}>
              Copy receipt text
            </button>
            {copied ? <span className="receipt-modal__copied muted">{copied}</span> : null}
          </>
        ) : (
          <p className="muted receipt-modal__zero">Total is $0.00 — add hours or expenses for payment.</p>
        )}
      </ReceiptThermalModal>
    </div>
  )
}
