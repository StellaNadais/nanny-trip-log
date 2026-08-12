const KEY = 'nanny-custom-celebrations-v1'

export const CUSTOM_CELEBRATIONS_UPDATED_EVENT = 'nanny-custom-celebrations-updated'

/**
 * @typedef {{
 *   id: string,
 *   year: number,
 *   month: number,
 *   day: number,
 *   spanDays?: number,
 *   title: string,
 *   theme?: string,
 *   activities?: string[],
 * }} CustomCelebration
 */

function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null
  const year = Number(raw.year)
  const month = Number(raw.month)
  const day = Number(raw.day)
  const title = String(raw.title ?? '').trim()
  if (!title || !Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return {
    id: String(raw.id || `custom-${Date.now()}`),
    year,
    month,
    day,
    spanDays: Math.max(1, Number(raw.spanDays) || 1),
    title,
    theme: String(raw.theme ?? '').trim(),
    activities: Array.isArray(raw.activities)
      ? raw.activities.filter((a) => typeof a === 'string' && a.trim()).map((a) => a.trim())
      : [],
  }
}

/** @returns {CustomCelebration[]} */
export function loadCustomCelebrations() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalize).filter(Boolean)
  } catch {
    return []
  }
}

/** @param {CustomCelebration[]} items */
export function saveCustomCelebrations(items) {
  localStorage.setItem(KEY, JSON.stringify(items.map(normalize).filter(Boolean)))
  window.dispatchEvent(new CustomEvent(CUSTOM_CELEBRATIONS_UPDATED_EVENT))
}

/** @param {Omit<CustomCelebration, 'id'> & { id?: string }} entry */
export function addCustomCelebration(entry) {
  const row = normalize({ ...entry, id: entry.id || globalThis.crypto?.randomUUID?.() })
  if (!row) return null
  saveCustomCelebrations([...loadCustomCelebrations(), row])
  return row
}

export function removeCustomCelebration(id) {
  saveCustomCelebrations(loadCustomCelebrations().filter((c) => c.id !== id))
}
