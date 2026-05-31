import ReceiptThermalModal from './ReceiptThermalModal'
import { useNannyReceipt } from '../hooks/useNannyReceipt'

function IconForwardSms({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 14 20 9 15 4" />
      <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
    </svg>
  )
}

function IconDownload({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

/** Register-tape nanny care receipt popup (Hours & details inside). */
export default function NannyReceiptPopup({ open = true, onClose, backdropClassName = '' }) {
  const r = useNannyReceipt()

  return (
    <ReceiptThermalModal
      open={open}
      onClose={onClose}
      backdropClassName={backdropClassName}
      weekLabel={r.thermalMetaLine}
      tapeSubtitle={r.tapeSubtitle}
      printedAt={r.printedAt ? `Printed: ${r.printedAt}` : ''}
      rows={r.thermalRows}
      photos={r.extras.photos}
      totalCentsDisplay={`$${r.combinedTotal.toFixed(2)}`}
    >
      <details className="receipt-modal__adjust">
        <summary className="receipt-modal__adjust-summary">Hours &amp; details</summary>
        <div className="receipt-modal__adjust-body">
          {r.gigReceiptMode ? (
            <label className="field-block field-block--compact">
              <span className="field-block__label">Gig date</span>
              <input
                type="date"
                className="input input--line"
                value={r.gigDateISO}
                onChange={(e) => r.setGigDateISO(e.target.value)}
              />
              <p className="muted receipt-modal__adjust-hint">
                Mileage week: {r.weekLabel}
                {r.matchedGig ? ' · booking matched' : ''}
              </p>
            </label>
          ) : (
            <label className="field-block field-block--compact">
              <span className="field-block__label">Week (Monday)</span>
              <input
                type="date"
                className="input input--line"
                value={r.weekOf}
                onChange={(e) => r.setWeekOf(e.target.value)}
              />
            </label>
          )}
          <label className="field-block field-block--compact">
            <span className="field-block__label">
              {r.gigReceiptMode ? 'Hours this gig' : 'Hours this week'}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              className="input input--line"
              value={r.hours}
              onChange={(e) => r.setHours(e.target.value)}
            />
          </label>
          {r.gigReceiptMode ? (
            <label className="field-block field-block--compact">
              <span className="field-block__label">Overnights</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                className="input input--line"
                value={r.overnightNights}
                onChange={(e) => r.setOvernightNights(e.target.value)}
              />
            </label>
          ) : null}
          <label className="field-block field-block--compact">
            <span className="field-block__label">Children</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              className="input input--line"
              value={r.numChildren}
              onChange={(e) => r.setNumChildren(e.target.value)}
            />
          </label>
          <label className="field-block field-block--compact">
            <span className="field-block__label">Venmo</span>
            <input
              type="text"
              className="input input--line"
              value={r.venmoHandle}
              onChange={(e) => r.persistVenmo(e.target.value)}
              placeholder="@YourVenmo"
              autoComplete="off"
            />
          </label>
        </div>
      </details>

      {r.showVenmoActions ? (
        <>
          {r.venmoUrl ? (
            <a
              href={r.venmoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary receipt-modal__venmo receipt-modal__wide-btn"
            >
              Venmo (${r.combinedTotal.toFixed(2)})
            </a>
          ) : null}
          <a
            href={r.forwardReceiptSmsHref}
            className={`btn receipt-modal__wide-btn ${r.venmoUrl ? 'receipt-modal__wide-btn--secondary' : 'btn--primary'}`}
            aria-label="Open Messages with the receipt and optional Venmo pay link"
          >
            <IconForwardSms />
            <span>Send in Messages</span>
          </a>
          <button
            type="button"
            className="btn receipt-modal__wide-btn receipt-modal__wide-btn--secondary"
            onClick={r.downloadWeekSummaryFile}
            aria-label="Download week summary as a text file"
          >
            <IconDownload />
            <span>Download summary (.txt)</span>
          </button>
        </>
      ) : (
        <>
          <p className="muted receipt-modal__zero">Total is $0.00 — expand Hours &amp; details above.</p>
          <a
            href={r.forwardReceiptSmsHref}
            className="btn btn--primary receipt-modal__wide-btn"
            aria-label="Open Messages with the receipt text"
          >
            <IconForwardSms />
            <span>Send in Messages</span>
          </a>
          <button
            type="button"
            className="btn receipt-modal__wide-btn receipt-modal__wide-btn--secondary"
            onClick={r.downloadWeekSummaryFile}
            aria-label="Download week summary as a text file"
          >
            <IconDownload />
            <span>Download summary (.txt)</span>
          </button>
        </>
      )}
    </ReceiptThermalModal>
  )
}
