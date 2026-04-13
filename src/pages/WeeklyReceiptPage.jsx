import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReceiptThermalModal from '../components/ReceiptThermalModal'
import {
  loadReceiptSettings,
  saveReceiptSettings,
  RECEIPT_MILEAGE_EVENT,
} from '../utils/receiptStorage'
import { formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { MILE_RATE } from '../data/tripPlaces'
import {
  buildWeekSummaryText,
  downloadTextFile,
  weekSummaryFilename,
} from '../utils/buildWeekSummaryText'

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

/**
 * `sms:` draft: full receipt text plus optional Venmo pay link (tappable in Messages).
 * Body is capped so the `sms:` URL stays within common mobile limits.
 */
const SMS_BODY_MAX = 2800

function buildForwardReceiptSmsHref(receiptText, venmoUrl, venmoHandle) {
  const receipt = String(receiptText || '').trim()
  const handle = venmoUrl ? normalizeVenmo(venmoHandle) : ''
  const footer = venmoUrl
    ? `\n\n────────\nTap to pay on Venmo:\n${venmoUrl}${handle ? `\n@${handle}` : ''}`
    : ''
  const reserve = footer.length + 40
  const maxReceipt = Math.max(200, SMS_BODY_MAX - reserve)
  let main = receipt
  if (main.length > maxReceipt) {
    main = `${main.slice(0, maxReceipt).trimEnd()}\n…(trimmed for text — open app for full receipt)`
  }
  const body = main + footer
  return `sms:?body=${encodeURIComponent(body)}`
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
  const [hours, setHours] = useState('45')
  const [numChildren, setNumChildren] = useState('1')
  const [weekOf, setWeekOf] = useState(() => toISODateLocal(startOfWeekMonday(new Date())))
  const [mileageRev, setMileageRev] = useState(0)
  const [extras, setExtras] = useState(emptyExtras)
  const [receiptOpen, setReceiptOpen] = useState(true)
  const [printedAt, setPrintedAt] = useState('')

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
    if (receiptOpen) setPrintedAt(new Date().toLocaleString())
  }, [receiptOpen])

  useEffect(() => {
    const s = loadReceiptSettings()
    const row = s.extrasByWeek?.[receiptWeekKey]
    setExtras(
      row && Array.isArray(row.photos) && Array.isArray(row.manualLines)
        ? { photos: row.photos, manualLines: row.manualLines }
        : emptyExtras()
    )
  }, [receiptWeekKey, mileageRev])

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

  const forwardReceiptSmsHref = useMemo(
    () => buildForwardReceiptSmsHref(receiptText, venmoUrl, venmoHandle),
    [receiptText, venmoUrl, venmoHandle]
  )

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

  function downloadWeekSummaryFile() {
    const body = buildWeekSummaryText({
      weekMondayIso: receiptWeekKey,
      weekLabel,
      receiptText,
    })
    downloadTextFile(weekSummaryFilename(receiptWeekKey), body)
  }

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
          The <strong>register-tape receipt</strong> opens as a popup (old-school thermal style).
          Receipt photos and parking / tolls are managed on <Link to="/outings">Outings</Link>. Use{' '}
          <strong>Download week summary (.txt)</strong> for trip log + journal + this receipt block.
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
            No mileage for this week yet — type place names in{' '}
            <Link to="/journal">Kid journal</Link> or Trip log, or add locations on{' '}
            <Link to="/outings">Outings</Link>; they sync here automatically.
          </p>
        )}

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
            placeholder="e.g. 45"
          />
          <p className="muted receipt__hours-hint">
            Base wage is <strong>${BASE_RATE}/hr</strong> for the first child (e.g.{' '}
            <strong>45 hr → ${(BASE_RATE * 45).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> before mileage & reimbursements).
          </p>
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
        >
          Show register-tape receipt
        </button>
        <a
          href={forwardReceiptSmsHref}
          className="btn receipt__forward-sms"
          aria-label="Open Messages with the receipt and Venmo link in the draft"
        >
          Forward receipt to text
        </a>
        <button type="button" className="btn receipt__download-summary" onClick={downloadWeekSummaryFile}>
          Download week summary (.txt)
        </button>
        <p className="muted receipt__popup-hint">
          Receipt popup opens when you land here. Edit receipt photos & parking on{' '}
          <Link to="/outings">Outings</Link>.
        </p>
      </div>

      <section className="receipt__math" aria-live="polite">
        <h2 className="receipt__math-title">Totals</h2>
        {!showSummary ? (
          <p className="muted">
            Enter hours, trip log mileage, or add receipt extras on <Link to="/outings">Outings</Link> to build your
            receipt.
          </p>
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
              Venmo payment (${combinedTotal.toFixed(2)})
            </a>
          ) : (
            <p className="muted receipt__venmo-hint">Add your Venmo username for a pay link in texts and below.</p>
          )}
          <a
            href={forwardReceiptSmsHref}
            className="btn receipt__forward-sms"
            aria-label="Open Messages with the receipt and optional Venmo pay link"
          >
            Forward receipt to text
          </a>
          <p className="muted receipt__sms-hint">
            Opens Messages (or your SMS app) with the full receipt typed out{venmoUrl ? ', plus a tappable Venmo link at the bottom' : ''}. Pick who to send it to.
          </p>
          <button type="button" className="btn receipt__download-summary" onClick={downloadWeekSummaryFile}>
            Download week summary (.txt)
          </button>
          <pre className="receipt__preview" aria-label="Receipt preview">
            {receiptText}
          </pre>
        </section>
      ) : null}

      <ReceiptThermalModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        weekLabel={weekLabel}
        printedAt={printedAt ? `Printed: ${printedAt}` : ''}
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
                Venmo payment (${combinedTotal.toFixed(2)})
              </a>
            ) : null}
            <a
              href={forwardReceiptSmsHref}
              className="btn receipt-modal__forward-sms"
              aria-label="Open Messages with the receipt and optional Venmo pay link"
            >
              Forward receipt to text
            </a>
            <button type="button" className="btn receipt-modal__download" onClick={downloadWeekSummaryFile}>
              Download week summary (.txt)
            </button>
          </>
        ) : (
          <>
            <p className="muted receipt-modal__zero">Total is $0.00 — add hours or expenses for payment.</p>
            <a
              href={forwardReceiptSmsHref}
              className="btn receipt-modal__forward-sms"
              aria-label="Open Messages with the receipt text"
            >
              Forward receipt to text
            </a>
            <button type="button" className="btn receipt-modal__download" onClick={downloadWeekSummaryFile}>
              Download week summary (.txt)
            </button>
          </>
        )}
      </ReceiptThermalModal>
    </div>
  )
}
