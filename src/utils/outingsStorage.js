const KEY = 'nanny-outings-places-v1'

/** @typedef {{ id: string, label: string, nickname: string, milesOneWay: number }} OutingPlace */

export function loadOutingsPlaces() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data
      .filter(
        (r) =>
          r &&
          typeof r.id === 'string' &&
          typeof r.label === 'string' &&
          typeof r.milesOneWay === 'number'
      )
      .map((r) => ({
        ...r,
        nickname: typeof r.nickname === 'string' ? r.nickname : '',
      }))
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
