import { PLACES } from '../data/tripPlaces'

const KEY = 'nanny-outings-places-v1'

export const OUTINGS_UPDATED_EVENT = 'nanny-outings-updated'

/**
 * @typedef {{ id: string, label: string, nickname: string, milesRoundTrip: number }} OutingPlace
 */

function normalizeRow(r) {
  if (!r || typeof r.id !== 'string' || typeof r.label !== 'string') return null
  let milesRoundTrip
  if (typeof r.milesRoundTrip === 'number' && Number.isFinite(r.milesRoundTrip)) {
    milesRoundTrip = r.milesRoundTrip
  } else if (typeof r.milesOneWay === 'number' && Number.isFinite(r.milesOneWay)) {
    milesRoundTrip = r.milesOneWay * 2
  } else {
    return null
  }
  if (milesRoundTrip < 0) return null
  return {
    id: r.id,
    label: r.label,
    milesRoundTrip: Math.round(milesRoundTrip * 100) / 100,
    nickname: typeof r.nickname === 'string' ? r.nickname : '',
  }
}

/** Drop custom rows that duplicate app-wide frequent places (now carried in tripPlaces). */
function pruneCustomPlacesAgainstBuiltIn(places) {
  const frequentLabels = new Set(PLACES.map((p) => p.label.trim().toLowerCase()))
  return places.filter((r) => !frequentLabels.has(String(r.label || '').trim().toLowerCase()))
}

export function loadOutingsPlaces() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    const list = data.map(normalizeRow).filter(Boolean)
    const pruned = pruneCustomPlacesAgainstBuiltIn(list)
    if (pruned.length !== list.length) {
      try {
        localStorage.setItem(KEY, JSON.stringify(pruned))
      } catch {
        /* quota */
      }
      window.dispatchEvent(new Event(OUTINGS_UPDATED_EVENT))
    }
    return pruned
  } catch {
    return []
  }
}

/** @param {OutingPlace[]} places */
export function saveOutingsPlaces(places) {
  const list = Array.isArray(places) ? places : []
  const pruned = pruneCustomPlacesAgainstBuiltIn(list)
  try {
    localStorage.setItem(KEY, JSON.stringify(pruned))
  } catch {
    /* quota */
  }
}

export function notifyOutingsUpdated() {
  window.dispatchEvent(new Event(OUTINGS_UPDATED_EVENT))
}
