import { Link, useSearchParams } from 'react-router-dom'
import NannyReceiptPopup from '../components/NannyReceiptPopup'
import { receiptNavLabel } from '../utils/receiptHref'

const CARDS = [
  { to: '/shift', label: 'Shift', code: 'A' },
  { to: '/journal', label: 'Today', code: 'B' },
  { to: '/events', label: 'Events', code: 'C', stacked: true },
]

export default function HubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const receiptOpen = searchParams.get('receipt') === 'open'
  const receiptLabel = receiptNavLabel()

  function openReceipt() {
    const next = new URLSearchParams(searchParams)
    next.set('receipt', 'open')
    setSearchParams(next)
  }

  function closeReceipt() {
    const next = new URLSearchParams(searchParams)
    next.delete('receipt')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className={`page page--hub work-ui${receiptOpen ? ' page--hub-receipt-open' : ''}`}>
      <div className="hub__stage" aria-hidden={receiptOpen}>
        <header className="hub__head schedule-workspace-head">
          <Link to="/schedule" className="page-back page-back--ghost">
            ← Schedule
          </Link>
        </header>

        <div className="hub__grid">
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className={`hub-card ${c.stacked ? 'hub-card--stacked' : ''}`}
              tabIndex={receiptOpen ? -1 : undefined}
            >
              <span className="hub-card__label">{c.label}</span>
              <span className="hub-card__code">{c.code}</span>
            </Link>
          ))}
        </div>

        <button type="button" className="hub__report" onClick={openReceipt} disabled={receiptOpen}>
          {receiptLabel}
        </button>
      </div>

      {receiptOpen ? (
        <NannyReceiptPopup
          onClose={closeReceipt}
          backdropClassName="receipt-modal__backdrop--over-hub"
        />
      ) : null}
    </div>
  )
}
