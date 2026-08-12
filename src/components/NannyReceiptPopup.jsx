import ReceiptThermalModal from './ReceiptThermalModal'
import { useNannyReceipt } from '../hooks/useNannyReceipt'

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
              className="btn btn--primary outings-expenses__submit"
            >
              Venmo (${r.combinedTotal.toFixed(2)})
            </a>
          ) : null}
          <a
            href={r.forwardReceiptSmsHref}
            className={
              r.venmoUrl
                ? 'btn outings-expenses__add-btn'
                : 'btn btn--primary outings-expenses__submit'
            }
            aria-label="Open Messages with the receipt and optional Venmo pay link"
          >
            Send in Messages
          </a>
          <button
            type="button"
            className="btn outings-expenses__add-btn"
            onClick={r.downloadWeekSummaryFile}
            aria-label="Download week summary as a text file"
          >
            Download summary (.txt)
          </button>
        </>
      ) : (
        <>
          <p className="muted receipt-modal__zero">Total is $0.00.</p>
          <a
            href={r.forwardReceiptSmsHref}
            className="btn btn--primary outings-expenses__submit"
            aria-label="Open Messages with the receipt text"
          >
            Send in Messages
          </a>
          <button
            type="button"
            className="btn outings-expenses__add-btn"
            onClick={r.downloadWeekSummaryFile}
            aria-label="Download week summary as a text file"
          >
            Download summary (.txt)
          </button>
        </>
      )}
    </ReceiptThermalModal>
  )
}
