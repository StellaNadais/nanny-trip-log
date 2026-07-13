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

/** Register-tape nanny care receipt popup. */
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
          <p className="muted receipt-modal__zero">Total is $0.00.</p>
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
