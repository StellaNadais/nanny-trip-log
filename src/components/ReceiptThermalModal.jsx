import { useEffect, useState } from 'react'
import ReceiptThermalTicket from './ReceiptThermalTicket'

/**
 * Traditional narrow “printed receipt” popup.
 */
export default function ReceiptThermalModal({
  open,
  onClose,
  weekLabel,
  tapeSubtitle,
  printedAt,
  rows,
  photos,
  totalCentsDisplay,
  backdropClassName = '',
  children,
}) {
  const [captureMode, setCaptureMode] = useState(false)

  useEffect(() => {
    if (!open) setCaptureMode(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key === 'Escape') {
        if (captureMode) setCaptureMode(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose, captureMode])

  if (!open) return null

  return (
    <div
      className={`receipt-modal ${captureMode ? 'receipt-modal--capture' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-thermal-title"
    >
      {captureMode ? (
        <div className="receipt-modal__backdrop receipt-modal__backdrop--capture" aria-hidden />
      ) : (
        <button
          type="button"
          className={`receipt-modal__backdrop ${backdropClassName}`.trim()}
          aria-label="Close receipt"
          onClick={onClose}
        />
      )}
      <div className="receipt-modal__sheet">
        <div className="receipt-modal__ticket-shell">
          <ReceiptThermalTicket
            titleId="receipt-thermal-title"
            weekLabel={weekLabel}
            tapeSubtitle={tapeSubtitle}
            printedAt={printedAt}
            rows={rows}
            photos={photos}
            totalCentsDisplay={totalCentsDisplay}
          />
        </div>

        {captureMode ? (
          <div className="receipt-modal__capture-footer">
            <p className="receipt-modal__capture-hint muted">
              Take a screenshot of the receipt above, then tap Done to bring controls back.
            </p>
            <button
              type="button"
              className="btn btn--primary receipt-modal__capture-done"
              onClick={() => setCaptureMode(false)}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="receipt-modal__footer">
            <button
              type="button"
              className="btn receipt-modal__screenshot-toggle"
              onClick={() => setCaptureMode(true)}
            >
              Clean view for screenshot
            </button>
            <div className="receipt-modal__actions">{children}</div>
            <button type="button" className="btn btn--ghost receipt-modal__close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
