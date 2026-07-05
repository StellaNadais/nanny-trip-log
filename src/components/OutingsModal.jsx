import OutingsExpensesPanel from './OutingsExpensesPanel'
import OutingsLocationsPanel from './OutingsLocationsPanel'
import TodayPanelModal from './TodayPanelModal'

export default function OutingsModal({
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
  customPlaces,
  placeNickname,
  onPlaceNicknameChange,
  placeRoundTrip,
  onPlaceRoundTripChange,
  placeFormErr,
  onAddCustomPlace,
  onRemoveCustomPlace,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="This week"
      title="Outings"
      dateLabel={weekLabel}
    >
      <section className="about-today-modal__section" aria-labelledby="outings-expenses-heading">
        <h3 id="outings-expenses-heading" className="schedule-overview__requests-title">
          Expenses
        </h3>
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
      </section>

      <section className="about-today-modal__section" aria-labelledby="outings-locations-heading">
        <h3 id="outings-locations-heading" className="schedule-overview__requests-title">
          Locations
        </h3>
        <OutingsLocationsPanel
          customPlaces={customPlaces}
          placeNickname={placeNickname}
          onPlaceNicknameChange={onPlaceNicknameChange}
          placeRoundTrip={placeRoundTrip}
          onPlaceRoundTripChange={onPlaceRoundTripChange}
          placeFormErr={placeFormErr}
          onAddCustomPlace={onAddCustomPlace}
          onRemoveCustomPlace={onRemoveCustomPlace}
        />
      </section>
    </TodayPanelModal>
  )
}
