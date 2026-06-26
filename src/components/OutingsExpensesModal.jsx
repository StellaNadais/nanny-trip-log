import OutingsExpensesPanel from './OutingsExpensesPanel'
import TodayPanelModal from './TodayPanelModal'

export default function OutingsExpensesModal({
  open,
  onClose,
  weekLabel,
  extras,
  manualOpen,
  onToggleManualOpen,
  manualCat,
  onManualCatChange,
  manualAmt,
  onManualAmtChange,
  manualNote,
  onManualNoteChange,
  onAddManualLine,
  onRemoveManualLine,
  manualTotal,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="This week"
      title="Expenses"
      dateLabel={weekLabel}
    >
      <OutingsExpensesPanel
        extras={extras}
        manualOpen={manualOpen}
        onToggleManualOpen={onToggleManualOpen}
        manualCat={manualCat}
        onManualCatChange={onManualCatChange}
        manualAmt={manualAmt}
        onManualAmtChange={onManualAmtChange}
        manualNote={manualNote}
        onManualNoteChange={onManualNoteChange}
        onAddManualLine={onAddManualLine}
        onRemoveManualLine={onRemoveManualLine}
        manualTotal={manualTotal}
      />
    </TodayPanelModal>
  )
}
