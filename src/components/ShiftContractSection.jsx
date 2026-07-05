import { useState } from 'react'
import ShiftContractModal from './ShiftContractModal'
import ShiftContractSetup from './ShiftContractSetup'

/**
 * Tap-to-open contract stats teaser + modal.
 */
export default function ShiftContractSection({ selectedDateISO }) {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  function closeModal() {
    setOpen(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <button
        type="button"
        className="shift-contract-teaser"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open contract stats"
      >
        <ShiftContractSetup key={refreshKey} embedded titleId="shift-contract-teaser-title" />
        <span className="shift-contract-teaser__cta">Open stats →</span>
      </button>

      <ShiftContractModal
        open={open}
        onClose={closeModal}
        selectedDateISO={selectedDateISO}
      />
    </>
  )
}
