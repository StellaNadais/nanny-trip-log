import OutingsExpensesPanel from './OutingsExpensesPanel'
import OutingsLocationsPanel from './OutingsLocationsPanel'
import TodayPanelModal from './TodayPanelModal'
import { TodaySoftPanel, TodaySoftSection } from './TodaySoftPanel'

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
  locationsOpen,
  onToggleLocationsOpen,
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
      title="Outings"
      hideHead
      hideFoot
      modalClassName="about-today-modal--soft-popup"
    >
      <TodaySoftPanel
        titleId="outings-popup-title"
        eyebrow="This week"
        title="Outings"
        meta={weekLabel}
        lede="Track parking, tolls, and trip places for the week."
      >
        <TodaySoftSection title="Expenses" titleId="outings-expenses-heading">
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
        </TodaySoftSection>

        <TodaySoftSection title="Locations" titleId="outings-locations-heading">
          <OutingsLocationsPanel
            customPlaces={customPlaces}
            locationsOpen={locationsOpen}
            onToggleLocationsOpen={onToggleLocationsOpen}
            placeNickname={placeNickname}
            onPlaceNicknameChange={onPlaceNicknameChange}
            placeRoundTrip={placeRoundTrip}
            onPlaceRoundTripChange={onPlaceRoundTripChange}
            placeFormErr={placeFormErr}
            onAddCustomPlace={onAddCustomPlace}
            onRemoveCustomPlace={onRemoveCustomPlace}
          />
        </TodaySoftSection>
      </TodaySoftPanel>
    </TodayPanelModal>
  )
}
