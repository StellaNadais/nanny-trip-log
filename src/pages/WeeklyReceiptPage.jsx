import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadReceiptSettings, saveReceiptSettings } from '../utils/receiptStorage'
import { formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'

const BASE_RATE = 31
const EXTRA_CHILD_PER_HOUR = 5

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

export default function WeeklyReceiptPage() {
  const initialSettings = useMemo(() => loadReceiptSettings(), [])
  const [venmoHandle, setVenmoHandle] = useState(initialSettings.venmoHandle)
  const [hours, setHours] = useState('')
  const [numChildren, setNumChildren] = useState('1')
  const [weekOf, setWeekOf] = useState(() => toISODateLocal(startOfWeekMonday(new Date())))
  const [copied, setCopied] = useState('')

  const h = parseFloat(hours)
  const hoursValid = Number.isFinite(h) && h > 0
  const n = Math.max(1, Math.floor(parseInt(numChildren, 10) || 1))
  const rate = ratePerHour(n)
  const extraKids = Math.max(0, n - 1)

  const lineBase = hoursValid ? BASE_RATE * h : 0
  const lineExtra = hoursValid ? EXTRA_CHILD_PER_HOUR * extraKids * h : 0
  const total = hoursValid ? rate * h : 0

  const weekLabel = useMemo(() => {
    try {
      return formatWeekRange(startOfWeekMonday(new Date(weekOf + 'T12:00:00')))
    } catch {
      return weekOf
    }
  }, [weekOf])

  const noteText = `Nanny care — week of ${weekLabel}`

  const venmoUrl = useMemo(
    () => buildVenmoUrl(venmoHandle, total, noteText),
    [venmoHandle, total, noteText]
  )

  const receiptText = useMemo(() => {
    if (!hoursValid) return ''
    const lines = [
      `Weekly nanny receipt`,
      `Week: ${weekLabel}`,
      `Children: ${n}`,
      ``,
      `$${BASE_RATE}/hr × ${h} hr (base) = $${lineBase.toFixed(2)}`,
    ]
    if (extraKids > 0) {
      lines.push(
        `+$${EXTRA_CHILD_PER_HOUR}/hr × ${extraKids} extra × ${h} hr = $${lineExtra.toFixed(2)}`
      )
    }
    lines.push(``, `Effective rate: $${rate.toFixed(2)}/hr`, `Total: $${total.toFixed(2)}`)
    if (normalizeVenmo(venmoHandle)) {
      lines.push(``, `Pay: Venmo @${normalizeVenmo(venmoHandle)}`)
    }
    return lines.join('\n')
  }, [hoursValid, weekLabel, n, h, lineBase, lineExtra, rate, total, extraKids, venmoHandle])

  function persistVenmo(v) {
    setVenmoHandle(v)
    saveReceiptSettings({ venmoHandle: v })
  }

  async function copyReceipt() {
    if (!receiptText) return
    try {
      await navigator.clipboard.writeText(receiptText)
      setCopied('Copied!')
      setTimeout(() => setCopied(''), 2000)
    } catch {
      setCopied('Copy failed')
    }
  }

  return (
    <div className="page page--receipt">
      <header className="receipt__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <h1 className="receipt__title">Weekly receipt</h1>
        <p className="receipt__lede muted">
          $31/hour for one child, +$5/hour for each additional child. Totals update as you type.
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

      <section className="receipt__math" aria-live="polite">
        <h2 className="receipt__math-title">Totals</h2>
        {!hoursValid ? (
          <p className="muted">Enter hours to see the receipt.</p>
        ) : (
          <>
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
            <p className="receipt__rate muted">
              Effective rate: <strong>${rate.toFixed(2)}/hr</strong>
            </p>
            <p className="receipt__total">
              Total due: <strong>${total.toFixed(2)}</strong>
            </p>
          </>
        )}
      </section>

      {hoursValid && total > 0 ? (
        <section className="receipt__actions">
          {venmoUrl ? (
            <a
              href={venmoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary receipt__venmo"
            >
              Pay with Venmo (${total.toFixed(2)})
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
    </div>
  )
}
