import ParentRemindersPanel from './ParentRemindersPanel'
import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel } from './TodaySoftPanel'

export default function RemindersModal({ open, onClose, dateLabel, groups }) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="Reminders"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="reminders-popup-title"
        eyebrow="From parents"
        title="Reminders"
        meta={dateLabel}
        lede="Notes families left for this day — grouped by booking."
      >
        <ParentRemindersPanel
          groups={groups}
          emptyHint="No family scheduled this day, or no reminders yet."
          flush
        />
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
