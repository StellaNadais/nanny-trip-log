const KEY = 'nanny-outings-places-v1'

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

export function loadOutingsPlaces() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.map(normalizeRow).filter(Boolean)
  } catch {
    return []
  }
}

/** @param {OutingPlace[]} places */
export function saveOutingsPlaces(places) {
  try {
    localStorage.setItem(KEY, JSON.stringify(places))
  } catch {
    /* quota */
  }
}

export const OUTINGS_UPDATED_EVENT = 'nanny-outings-updated'

export function notifyOutingsUpdated() {
  window.dispatchEvent(new Event(OUTINGS_UPDATED_EVENT))
}
