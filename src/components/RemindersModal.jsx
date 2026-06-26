import ParentRemindersPanel from './ParentRemindersPanel'
import TodayPanelModal from './TodayPanelModal'

export default function RemindersModal({ open, onClose, dateLabel, groups }) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="From parents"
      title="Reminders"
      dateLabel={dateLabel}
    >
      <ParentRemindersPanel
        dateLabel={dateLabel}
        groups={groups}
        emptyHint="No family scheduled this day, or no reminders yet."
      />
    </TodayPanelModal>
  )
}
