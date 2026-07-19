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
  placeFormOpen,
  onTogglePlaceFormOpen,
  placeFormErr,
  onAddCustomPlace,
  onRemoveCustomPlace,
}) {
  const milesLabel =
    placeTripKind === 'oneWay' ? 'One-way miles (from home)' : 'Round-trip miles (from home)'

  return (
    <div className="outings-locations__panel">
      <p className="outings-locations__lede muted">
        <strong>Nickname only</strong> — no addresses. Use the same word in day notes and miles count
        automatically.
      </p>

      <button
        type="button"
        className={`outings-locations__add-btn${placeFormOpen ? ' outings-locations__add-btn--open' : ''}`}
        onClick={onTogglePlaceFormOpen}
        aria-expanded={placeFormOpen}
      >
        <span className="outings-locations__add-btn-ico" aria-hidden>
          {placeFormOpen ? '−' : '+'}
        </span>
        {placeFormOpen ? 'Close form' : 'Add place nickname…'}
      </button>

      {placeFormOpen ? (
        <form className="outings-locations__form" onSubmit={onAddCustomPlace}>
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
            <p className="outings-locations__err" role="status">
              {placeFormErr}
            </p>
          ) : null}
          <button type="submit" className="btn btn--primary outings-locations__submit">
            Save location
          </button>
        </form>
      ) : null}

      {customPlaces.length > 0 ? (
        <ul className="outings-locations__list" aria-label="Saved location nicknames">
          {customPlaces.map((p) => (
            <li key={p.id} className="outings-locations__chip">
              <div className="outings-locations__chip-body">
                <span className="outings-locations__chip-name">{p.label}</span>
                <span className="outings-locations__chip-miles">{formatPlaceMiles(p)}</span>
              </div>
              <button
                type="button"
                className="outings-locations__chip-remove"
                onClick={() => onRemoveCustomPlace(p.id)}
                aria-label={`Remove ${p.label}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="outings-locations__empty muted">Nothing yet</p>
      )}
    </div>
  )
}
