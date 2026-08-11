import TodayPanelModal from './TodayPanelModal'
import SummerBackpackChecklist from './SummerBackpackChecklist'

export default function SummerBackpackModal({ open, onClose }) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="Before heading out"
      title="Summer backpack"
    >
      <SummerBackpackChecklist showHeader={false} />
    </TodayPanelModal>
  )
}
