import { useEffect, useId, useMemo, useState } from 'react'
import { HOME_PLACE_ID } from '../data/tripPlaces'
import { loadOutingsPlaces, OUTINGS_UPDATED_EVENT } from '../utils/outingsStorage'
import {
  appendPlaceToRouteIds,
  availablePlacesForRoute,
  resolveRoutePlaces,
  routeStopsFromIds,
} from '../utils/tripRouteBar'

/**
 * Route inside What we did: selected places above the bar; bar is from→to visual.
 * Does not write into day notes.
 */
export default function TripRouteBar({ routePlaceIds = [], onRoutePlaceIdsChange }) {
  const titleId = useId()
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [customRows, setCustomRows] = useState(() => loadOutingsPlaces())

  useEffect(() => {
    const sync = () => setCustomRows(loadOutingsPlaces())
    window.addEventListener(OUTINGS_UPDATED_EVENT, sync)
    return () => window.removeEventListener(OUTINGS_UPDATED_EVENT, sync)
  }, [])

  const ids = Array.isArray(routePlaceIds) ? routePlaceIds : []
  const selected = useMemo(() => resolveRoutePlaces(ids, customRows), [ids, customRows])
  const stops = useMemo(() => routeStopsFromIds(ids, customRows), [ids, customRows])
  const pool = useMemo(() => availablePlacesForRoute(ids, customRows), [ids, customRows])

  const awayCount = selected.length
  const fillPercent =
    awayCount <= 0 ? 0 : Math.min(100, Math.round((awayCount / (awayCount + 1)) * 100))
  const routeLabel = stops.map((s) => s.label).join(' → ')
  const hintLabel = open ? 'Tap a place' : awayCount > 0 ? `${awayCount} stop${awayCount === 1 ? '' : 's'}` : 'Tap bar for places'

  const addPlace = (place) => {
    onRoutePlaceIdsChange?.(appendPlaceToRouteIds(ids, place))
  }

  const removeAt = (index) => {
    onRoutePlaceIdsChange?.(ids.filter((_, i) => i !== index))
  }

  return (
    <section
      className="journal-day-progress journal-day-progress--thin trip-route-bar"
      aria-labelledby={titleId}
    >
      {selected.length > 0 ? (
        <ul className="trip-route-bar__selected" aria-label="Places on today's route">
          {selected.map((place, i) => (
            <li key={`${place.id}-${i}`}>
              <button
                type="button"
                className={`trip-route-bar__chip${place.id === HOME_PLACE_ID ? ' trip-route-bar__chip--home' : ''}`}
                onClick={() => removeAt(i)}
                aria-label={`Remove ${place.label} from route`}
                title={`Remove ${place.label}`}
              >
                {place.label}
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="journal-day-progress__head">
        <span className="journal-day-progress__title" id={titleId}>
          Route
        </span>
        <span className="journal-day-progress__label muted">{hintLabel}</span>
      </div>

      <button
        type="button"
        className={`journal-day-progress__track trip-route-bar__track${open ? ' trip-route-bar__track--open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Route from-to: ${routeLabel}. Tap to ${open ? 'hide' : 'show'} places.`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="journal-day-progress__fill" style={{ width: `${fillPercent}%` }} aria-hidden />
        <div
          className="trip-route-bar__path"
          style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }}
          aria-hidden
        >
          {stops.map((stop, i) => (
            <span
              key={`${stop.id}-${i}`}
              className={`trip-route-bar__path-seg${stop.id === HOME_PLACE_ID ? ' trip-route-bar__path-seg--home' : ''}`}
            >
              {stop.label}
            </span>
          ))}
        </div>
      </button>

      <div
        id={panelId}
        className={`trip-route-bar__drawer${open ? ' trip-route-bar__drawer--open' : ''}`}
        role="region"
        aria-label="Places to add"
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <div className="trip-route-bar__drawer-inner">
          {pool.length > 0 ? (
            <ul className="trip-route-bar__pool">
              {pool.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    className={`trip-route-bar__pool-btn${place.id === HOME_PLACE_ID ? ' trip-route-bar__pool-btn--home' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      addPlace(place)
                    }}
                    aria-label={`Add ${place.label} to route`}
                    tabIndex={open ? 0 : -1}
                  >
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="trip-route-bar__empty muted">All places are already on the route.</p>
          )}
        </div>
      </div>
    </section>
  )
}
