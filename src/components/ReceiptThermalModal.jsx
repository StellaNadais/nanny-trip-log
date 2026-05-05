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
        <button type="button" className="receipt-modal__backdrop" aria-label="Close receipt" onClick={onClose} />
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
              Use your phone screenshot. Crop to the receipt or capture full screen — plain background.
            </p>
            <button type="button" className="btn btn--primary receipt-modal__capture-done" onClick={() => setCaptureMode(false)}>
              Done
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="btn btn--ghost receipt-modal__screenshot-mode"
              onClick={() => setCaptureMode(true)}
            >
              Screenshot view
            </button>
            <div className="receipt-modal__actions">{children}</div>
            <button type="button" className="btn btn--ghost receipt-modal__close-btn" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  )
}
