import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel, TodaySoftSection } from './TodaySoftPanel'
import SummerBackpackChecklist from './SummerBackpackChecklist'

export default function SummerBackpackModal({ open, onClose }) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      title="Backpack"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="schedule-backpack-title"
        eyebrow="Summer checklist"
        title="Backpack"
        meta="Six summer essentials"
        lede="Pack before heading out — check items off as they go in the bag."
        footer="A light day pack for water, sun, spare clothes, and snacks."
        className="soft-panel--backpack"
      >
        <TodaySoftSection title="Pack list" titleId="summer-backpack-list-title">
          <SummerBackpackChecklist showHeader={false} />
        </TodaySoftSection>
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
