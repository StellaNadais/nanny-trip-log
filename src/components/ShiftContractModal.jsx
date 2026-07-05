import { useEffect } from 'react'
import ShiftContractSetup from './ShiftContractSetup'

export default function ShiftContractModal({ open, onClose, selectedDateISO }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="shift-contract-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-contract-modal-title"
    >
      <button
        type="button"
        className="shift-contract-modal__backdrop"
        aria-label="Close contract stats"
        onClick={onClose}
      />
      <div className="shift-contract-modal__sheet">
        <ShiftContractSetup selectedDateISO={selectedDateISO} titleId="shift-contract-modal-title" />
        <button type="button" className="btn btn--ghost shift-contract-modal__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
