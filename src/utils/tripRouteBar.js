import { HOME_PLACE, HOME_PLACE_ID, PLACE_BY_ID, PLACES } from '../data/tripPlaces'
import { loadOutingsPlaces } from './outingsStorage'
import { outingRecordToPlace } from './outingsPlaceModel'

function customPlaceById(id, rows) {
  const list = rows ?? loadOutingsPlaces()
  for (const row of list) {
    const p = outingRecordToPlace(row)
    if (p?.id === id) return p
  }
  return null
}

function placeFromId(id, rows) {
  if (!id) return null
  if (id === HOME_PLACE_ID) return HOME_PLACE
  return PLACE_BY_ID[id] || customPlaceById(id, rows)
}

/**
 * Resolve ordered place ids to place objects (includes Home when selected).
 * @param {string[]} ids
 * @param {ReturnType<typeof loadOutingsPlaces>} [rows]
 */
export function resolveRoutePlaces(ids, rows) {
  const list = Array.isArray(ids) ? ids : []
  /** @type {{ id: string, label: string, region?: string }[]} */
  const out = []
  for (const id of list) {
    const p = placeFromId(id, rows)
    if (p) out.push(p)
  }
  return out
}

/**
 * Full route for the bar: always bookends Home; keeps mid-route Home stops.
 * @param {string[]} ids
 * @param {ReturnType<typeof loadOutingsPlaces>} [rows]
 */
export function routeStopsFromIds(ids, rows) {
  const middle = resolveRoutePlaces(ids, rows)
  if (!middle.length) return [HOME_PLACE, HOME_PLACE]
  const withStart = middle[0].id === HOME_PLACE_ID ? middle : [HOME_PLACE, ...middle]
  return withStart[withStart.length - 1].id === HOME_PLACE_ID
    ? withStart
    : [...withStart, HOME_PLACE]
}

/**
 * Places still available to add. Home stays selectable unless it was just added.
 * @param {string[]} ids
 * @param {ReturnType<typeof loadOutingsPlaces>} [rows]
 */
export function availablePlacesForRoute(ids, rows) {
  const list = rows ?? loadOutingsPlaces()
  const prev = Array.isArray(ids) ? ids : []
  const onRoute = new Set(prev.filter((id) => id && id !== HOME_PLACE_ID))
  /** @type {{ id: string, label: string, region?: string }[]} */
  const out = []

  // Home is always choosable except right after selecting Home (avoid Home, Home spam)
  if (prev[prev.length - 1] !== HOME_PLACE_ID) {
    out.push(HOME_PLACE)
  }

  for (const p of PLACES) {
    if (onRoute.has(p.id)) continue
    out.push(p)
  }

  for (const row of list) {
    const p = outingRecordToPlace(row)
    if (!p || onRoute.has(p.id)) continue
    out.push(p)
  }

  return out
}

/**
 * Append a place id to the route (Home may appear more than once for mid-day returns).
 * @param {string[]} ids
 * @param {{ id: string }} place
 */
export function appendPlaceToRouteIds(ids, place) {
  const id = place?.id
  if (!id) return Array.isArray(ids) ? [...ids] : []
  const prev = Array.isArray(ids) ? ids : []
  if (prev[prev.length - 1] === id) return prev
  if (id !== HOME_PLACE_ID && prev.includes(id)) return prev
  return [...prev, id]
}

/**
 * Text for mileage engine from structured route ids.
 * @param {string[]} ids
 * @param {ReturnType<typeof loadOutingsPlaces>} [rows]
 */
export function routeIdsToMileageText(ids, rows) {
  return resolveRoutePlaces(ids, rows)
    .map((p) => p.label)
    .join(', ')
}
