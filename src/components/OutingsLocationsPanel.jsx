function oneWayMiles(p) {
  if (typeof p.legMiles === 'number' && Number.isFinite(p.legMiles)) return p.legMiles
  if (typeof p.milesRoundTrip === 'number' && Number.isFinite(p.milesRoundTrip)) {
    return p.milesRoundTrip / 2
  }
  return 0
}

function formatPlaceMiles(p) {
  const one = Math.round(oneWayMiles(p) * 100) / 100
  const round = Math.round(one * 2 * 100) / 100
  return `${one} mi one way · ${round} mi round trip`
}

export default function OutingsLocationsPanel({
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
  const milesLabel =
    placeTripKind === 'oneWay' ? 'One-way miles (from home)' : 'Round-trip miles (from home)'

  return (
    <div className="outings-locations__panel">
      <p className="outings__journal-sign-text muted">
        <strong>Nickname only</strong> — no addresses. Use the same word in your day notes and miles
        count automatically.
      </p>

      <form className="outings__locations-form" onSubmit={onAddCustomPlace}>
        <label className="field-block">
          <span className="field-block__label">Place nickname</span>
          <input
            type="text"
            className="input input--line"
            value={placeNickname}
            onChange={(e) => onPlaceNicknameChange(e.target.value)}
            placeholder="e.g. swim, zoo, park"
            autoComplete="off"
            required
          />
        </label>

        <fieldset className="outings__trip-kind">
          <legend className="field-block__label">Trip type</legend>
          <div className="outings__trip-kind-options" role="radiogroup" aria-label="Trip type">
            <label className="outings__trip-kind-option">
              <input
                type="radio"
                name="place-trip-kind"
                value="oneWay"
                checked={placeTripKind === 'oneWay'}
                onChange={() => onPlaceTripKindChange('oneWay')}
              />
              <span>One way</span>
            </label>
            <label className="outings__trip-kind-option">
              <input
                type="radio"
                name="place-trip-kind"
                value="roundTrip"
                checked={placeTripKind === 'roundTrip'}
                onChange={() => onPlaceTripKindChange('roundTrip')}
              />
              <span>Round trip</span>
            </label>
          </div>
        </fieldset>

        <label className="field-block">
          <span className="field-block__label">{milesLabel}</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            className="input input--line"
            value={placeMiles}
            onChange={(e) => onPlaceMilesChange(e.target.value)}
            placeholder="e.g. 6"
            required
          />
        </label>
        {placeFormErr ? (
          <p className="outings__locations-err" role="status">
            {placeFormErr}
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary">
          Save location
        </button>
      </form>

      {customPlaces.length > 0 ? (
        <ul className="outings__locations-list" aria-label="Saved location nicknames">
          {customPlaces.map((p) => (
            <li key={p.id} className="outings__location-row">
              <div className="outings__location-main">
                <strong className="outings__location-label">{p.label}</strong>
                <span className="outings__location-miles muted">{formatPlaceMiles(p)}</span>
              </div>
              <button
                type="button"
                className="btn btn--ghost outings__location-remove"
                onClick={() => onRemoveCustomPlace(p.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted outings__locations-empty">No locations saved yet</p>
      )}
    </div>
  )
}
