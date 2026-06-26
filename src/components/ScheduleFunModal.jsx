import ScheduleCelebrationsFlip from './ScheduleCelebrationsFlip'
import TodayPanelModal from './TodayPanelModal'

export default function ScheduleFunModal({ open, onClose, year, monthIndex, monthLabel }) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="This month"
      title="Do fun"
      dateLabel={monthLabel}
    >
      <ScheduleCelebrationsFlip year={year} monthIndex={monthIndex} embedded />
    </TodayPanelModal>
  )
}
