import OutingsLocationsPanel from './OutingsLocationsPanel'
import TodayPanelModal from './TodayPanelModal'

export default function OutingsLocationsModal({
  open,
  onClose,
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
    <TodayPanelModal open={open} onClose={onClose} eyebrow="Saved nicknames" title="Locations">
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
    </TodayPanelModal>
  )
}
