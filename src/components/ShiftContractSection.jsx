import { useMemo, useState } from 'react'
import {
  contractProgress,
  countTimeOff,
  loadShiftContract,
  resourceStatus,
} from '../utils/shiftContractStorage'
import ShiftContractModal from './ShiftContractModal'

/**
 * Tap-to-open contract stats teaser + modal.
 */
export default function ShiftContractSection({ selectedDateISO }) {
  const [open, setOpen] = useState(false)
  const [rev, setRev] = useState(0)

  const snapshot = useMemo(() => {
    void rev
    const contract = loadShiftContract()
    const season = contractProgress(contract.contractStartISO, contract.contractEndISO)
    const vacationUsed = countTimeOff(contract.timeOff, 'vacation')
    const sickUsed = countTimeOff(contract.timeOff, 'sick')
    const vacation = resourceStatus(vacationUsed, contract.vacationAllowance)
    const sick = resourceStatus(sickUsed, contract.sickAllowance)
    return { season, vacation, sick }
  }, [rev, open])

  function closeModal() {
    setOpen(false)
    setRev((r) => r + 1)
  }

  return (
    <>
      <section className="shift-setup-teaser-wrap" aria-label="Contract stats">
        <button
          type="button"
          className="shift-setup-teaser work-ui__panel"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <div className="shift-setup-teaser__bar">
            <span className="shift-setup-teaser__bar-tag">Loadout</span>
            <span className="shift-setup-teaser__bar-status">{snapshot.season.label}</span>
          </div>
          <span className="shift-setup-teaser__title">contract stats</span>
          <span className="shift-setup-teaser__stats">
            <span className="shift-setup-teaser__pill shift-setup-teaser__pill--vacation">
              Vacation · {snapshot.vacation.left} left
            </span>
            <span className="shift-setup-teaser__pill shift-setup-teaser__pill--sick">
              Sick · {snapshot.sick.left} left
            </span>
          </span>
          <span className="shift-setup-teaser__cta" aria-hidden>
            Open loadout →
          </span>
        </button>
      </section>

      <ShiftContractModal
        open={open}
        onClose={closeModal}
        selectedDateISO={selectedDateISO}
      />
    </>
  )
}
