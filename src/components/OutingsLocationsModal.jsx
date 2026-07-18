import LocationHeading from './LocationHeading'
import OutingsLocationsPanel from './OutingsLocationsPanel'
import TodayPanelModal from './TodayPanelModal'

export default function OutingsLocationsModal({
  open,
  onClose,
  customPlaces,
  placeNickname,
  onPlaceNicknameChange,
  placeMiles,
  onPlaceMilesChange,
  placeTripKind,
  onPlaceTripKindChange,
  placeFormErr,
  onAddCustomPlace,
  onRemoveCustomPlace,
}) {
  return (
    <TodayPanelModal
      open={open}
      onClose={onClose}
      eyebrow="Saved nicknames"
      title={<LocationHeading as="span" className="about-today-modal__title-inline" />}
    >
      <OutingsLocationsPanel
        customPlaces={customPlaces}
        placeNickname={placeNickname}
        onPlaceNicknameChange={onPlaceNicknameChange}
        placeMiles={placeMiles}
        onPlaceMilesChange={onPlaceMilesChange}
        placeTripKind={placeTripKind}
        onPlaceTripKindChange={onPlaceTripKindChange}
        placeFormErr={placeFormErr}
        onAddCustomPlace={onAddCustomPlace}
        onRemoveCustomPlace={onRemoveCustomPlace}
      />
    </TodayPanelModal>
  )
}
