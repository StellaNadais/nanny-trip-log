import { HOME_PLACE_ID, PLACE_BY_ID } from './tripPlaces'

/**
 * One-way driving miles between nicknamed stops (undirected).
 * Sample distances for demo / portfolio — not real measured legs.
 *
 * @type {{ from: string, to: string, miles: number }[]}
 */
export const TRIP_SEGMENTS = [
  { from: HOME_PLACE_ID, to: 'drop-off', miles: 1.2 },
  { from: 'drop-off', to: 'music', miles: 6.7 },
  { from: 'drop-off', to: 'laf-library', miles: 6.8 },
  { from: 'drop-off', to: 'swim', miles: 6.8 },
  { from: 'drop-off', to: 'commons', miles: 0.6 },
  { from: 'drop-off', to: 'hacienda', miles: 1.8 },
  { from: 'drop-off', to: 'moraga-library', miles: 0.8 },
  { from: HOME_PLACE_ID, to: 'school', miles: 8.0 },
  { from: HOME_PLACE_ID, to: 'swim', miles: 8.0 },
  { from: HOME_PLACE_ID, to: 'store', miles: 3.0 },
]

function placeShort(id) {
  if (id === HOME_PLACE_ID) return 'Home'
  return PLACE_BY_ID[id]?.label ?? id
}

/** Human-readable leg list for Outings UI. */
export function formatTripSegmentNote(s) {
  if (s.from === HOME_PLACE_ID) {
    return `${placeShort(s.to)} from home · ${s.miles} mi`
  }
  return `${placeShort(s.from)} ↔ ${placeShort(s.to)} · ${s.miles} mi`
}
