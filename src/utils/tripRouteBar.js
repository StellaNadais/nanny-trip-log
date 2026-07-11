import { HOME_PLACE, HOME_PLACE_ID } from '../data/tripPlaces'
import { placeHitsInText } from './dayTravelJournal'
import { loadOutingsPlaces } from './outingsStorage'
import { outingRecordToPlace } from './outingsPlaceModel'

/**
 * Ordered away stops from journal text (Home is display-only bookend).
 * @param {string} text
 * @returns {{ id: string, label: string, region?: string }[]}
 */
export function awayStopsFromText(text) {
  return placeHitsInText(text)
    .map((h) => h.place)
    .filter((p) => p?.id && p.id !== HOME_PLACE_ID)
}

/**
 * Full route for the bar: Home → stops → Home.
 * @param {string} text
 */
export function routeStopsForBar(text) {
  const away = awayStopsFromText(text)
  return [HOME_PLACE, ...away, HOME_PLACE]
}

/**
 * Caregiver-added places not yet on today's route.
 * @param {string} text
 * @param {ReturnType<typeof loadOutingsPlaces>} [rows]
 */
export function availableCustomPlacesForRoute(text, rows) {
  const list = rows ?? loadOutingsPlaces()
  const onRoute = new Set(awayStopsFromText(text).map((p) => p.id))
  /** @type {{ id: string, label: string, region: string }[]} */
  const out = []
  for (const row of list) {
    const p = outingRecordToPlace(row)
    if (!p || onRoute.has(p.id)) continue
    out.push(p)
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Append a place nickname to day notes so mileage + mirror stay in sync.
 * @param {string} text
 * @param {{ id: string, label: string }} place
 */
export function appendPlaceToDayNotes(text, place) {
  const label = String(place?.label || '').trim()
  if (!label) return String(text || '')
  const already = awayStopsFromText(text).some((p) => p.id === place.id)
  if (already) return String(text || '')
  const base = String(text || '').trim()
  if (!base) return label
  const needsSpace = /[,;.\s]$/.test(base)
  return needsSpace ? `${base}${label}` : `${base}, ${label}`
}
