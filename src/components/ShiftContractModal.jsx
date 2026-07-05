import TodayPanelModal from './TodayPanelModal'
import ShiftContractSetup from './ShiftContractSetup'

export default function ShiftContractModal({ open, onClose, selectedDateISO }) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="Contract stats"
      hideHead
      modalClassName="about-today-modal--contract-stats"
    >
      <ShiftContractSetup selectedDateISO={selectedDateISO} titleId="shift-contract-modal-title" />
    </TodayPanelModal>
  )
}
