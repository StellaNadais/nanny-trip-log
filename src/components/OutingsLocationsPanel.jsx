export default function OutingsLocationsPanel({
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
        <p className="muted outings__locations-empty">No locations saved yet</p>
      )}
    </div>
  )
}
