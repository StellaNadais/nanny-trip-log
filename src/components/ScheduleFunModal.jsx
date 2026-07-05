import ScheduleCelebrationsFlip from './ScheduleCelebrationsFlip'
import TodayPanelModal from './TodayPanelModal'
import { monthCelebrationsTitle } from '../utils/scheduleCelebrations'

export default function ScheduleFunModal({ open, onClose, year, monthIndex }) {
  const monthLabel = monthCelebrationsTitle(monthIndex, year)

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="Holidays & ideas"
      title="Do fun"
      dateLabel={monthLabel}
    >
      <ScheduleCelebrationsFlip year={year} monthIndex={monthIndex} embedded />
    </TodayPanelModal>
  )
}
