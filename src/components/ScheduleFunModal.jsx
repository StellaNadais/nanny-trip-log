import ScheduleCelebrationsFlip from './ScheduleCelebrationsFlip'
import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel } from './TodaySoftPanel'
import { monthCelebrationsTitle } from '../utils/scheduleCelebrations'

export default function ScheduleFunModal({ open, onClose, year, monthIndex }) {
  const monthLabel = monthCelebrationsTitle(monthIndex, year)

  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="Do fun"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="schedule-do-fun-title"
        eyebrow="Holidays & ideas"
        title="Do fun"
        meta={monthLabel}
        lede="Upcoming celebrations this month — flip for prep ideas one week ahead."
        className="soft-panel--do-fun"
      >
        <ScheduleCelebrationsFlip year={year} monthIndex={monthIndex} embedded />
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
