import { useEffect, useId, useMemo, useState } from 'react'
import { HOME_PLACE_ID } from '../data/tripPlaces'
import { loadOutingsPlaces, OUTINGS_UPDATED_EVENT } from '../utils/outingsStorage'
import {
  appendPlaceToDayNotes,
  availableCustomPlacesForRoute,
  routeStopsForBar,
} from '../utils/tripRouteBar'

function segClass(region, isHome) {
  if (isHome) return 'trip-route-bar__seg--home'
  if (region === 'custom') return 'trip-route-bar__seg--custom'
  if (region === 'moraga') return 'trip-route-bar__seg--moraga'
  if (region === 'lafayette') return 'trip-route-bar__seg--lafayette'
  return 'trip-route-bar__seg--place'
}

/**
 * Equal-width route bar: Home → stops → Home.
 * Tap opens a drawer of caregiver places; tap a place to add it to the route.
 */
export default function TripRouteBar({ dayNotes, onDayNotesChange }) {
  const titleId = useId()
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [customRows, setCustomRows] = useState(() => loadOutingsPlaces())

  useEffect(() => {
    const sync = () => setCustomRows(loadOutingsPlaces())
    window.addEventListener(OUTINGS_UPDATED_EVENT, sync)
    return () => window.removeEventListener(OUTINGS_UPDATED_EVENT, sync)
  }, [])

  const stops = useMemo(() => routeStopsForBar(dayNotes), [dayNotes])
  const pool = useMemo(
    () => availableCustomPlacesForRoute(dayNotes, customRows),
    [dayNotes, customRows],
  )

  const addPlace = (place) => {
    onDayNotesChange(appendPlaceToDayNotes(dayNotes, place))
  }

  return (
    <section className="trip-route-bar journal-mood-bar" aria-labelledby={titleId}>
      <div className="journal-mood-bar__head">
        <span className="journal-mood-bar__title" id={titleId}>
          Route
        </span>
        <span className="journal-mood-bar__picked muted">
          {open ? 'Tap a place to add' : 'Tap bar for places'}
        </span>
      </div>

      <button
        type="button"
        className={`trip-route-bar__track journal-mood-bar__track${open ? ' trip-route-bar__track--open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Today's route. Tap to show places."
        onClick={() => setOpen((v) => !v)}
        style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }}
      >
        {stops.map((stop, i) => {
          const isHome = stop.id === HOME_PLACE_ID
          return (
            <span
              key={`${stop.id}-${i}`}
              className={`trip-route-bar__seg ${segClass(stop.region, isHome)}`}
              title={stop.label}
            >
              <span className="trip-route-bar__label">{stop.label}</span>
            </span>
          )
        })}
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
                    className="trip-route-bar__pool-btn"
                    onClick={() => addPlace(place)}
                    aria-label={`Add ${place.label} to route`}
                    tabIndex={open ? 0 : -1}
                  >
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="trip-route-bar__empty muted">
              {customRows.length === 0
                ? 'Add places under Outings → Locations first.'
                : 'All your places are already on the route.'}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
