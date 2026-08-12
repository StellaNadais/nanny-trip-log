export default function OutingsLocationsPanel({
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
    <div className="outings-locations__panel">
      <button
        type="button"
        className={`outings-expenses__add-btn${locationsOpen ? ' outings-expenses__add-btn--open' : ''}`}
        onClick={onToggleLocationsOpen}
        aria-expanded={locationsOpen}
      >
        <span className="outings-expenses__add-btn-ico" aria-hidden>
          {locationsOpen ? '−' : '+'}
        </span>
        {locationsOpen ? 'Close form' : 'Add location…'}
      </button>

      {locationsOpen ? (
        <form className="outings-expenses__form" onSubmit={onAddCustomPlace}>
          <label className="field-block">
            <span className="field-block__label">Place nickname</span>
            <input
              type="text"
              className="input input--line"
              value={placeNickname}
              onChange={(e) => onPlaceNicknameChange(e.target.value)}
              placeholder="e.g. swim, zoo (no address)"
              autoComplete="off"
              required
            />
          </label>
          <label className="field-block">
            <span className="field-block__label">Round trip miles (from home)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              className="input input--line"
              value={placeRoundTrip}
              onChange={(e) => onPlaceRoundTripChange(e.target.value)}
              placeholder="e.g. 12"
              required
            />
          </label>
          {placeFormErr ? (
            <p className="outings__locations-err" role="status">
              {placeFormErr}
            </p>
          ) : null}
          <button type="submit" className="btn btn--primary outings-expenses__submit">
            Save location
          </button>
        </form>
      ) : null}

      {customPlaces.length > 0 ? (
        <ul className="outings__locations-list" aria-label="Saved location nicknames">
          {customPlaces.map((p) => (
            <li key={p.id} className="outings__location-row">
              <div className="outings__location-main">
                <strong className="outings__location-label">{p.label}</strong>
                <span className="outings__location-miles muted">
                  {p.milesRoundTrip ?? (p.legMiles != null ? p.legMiles * 2 : 0)} mi round trip
                </span>
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
        <p className="outings-expenses__empty muted">No locations saved yet</p>
      )}
    </div>
  )
}
