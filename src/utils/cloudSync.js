import { addDays, startOfWeekMonday, toISODateLocal } from './dates'

export const CLOUD_SYNC_KEYS = [
  'nanny-bookings-v1',
  'nanny-parent-reminders-v1',
  'nanny-journal-shopping-v1',
  'nanny-kid-journal-v1',
]

export const CLOUD_DATA_CHANGED_EVENT = 'nanny-cloud-data-changed'
export const CLOUD_DATA_APPLIED_EVENT = 'nanny-cloud-data-applied'

export function notifyCloudDataChanged(key) {
  if (!CLOUD_SYNC_KEYS.includes(key) || typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CLOUD_DATA_CHANGED_EVENT, { detail: { key } }))
}

export function readCloudSyncData() {
  return Object.fromEntries(CLOUD_SYNC_KEYS.map((key) => [key, localStorage.getItem(key)]))
}

export function applyCloudSyncData(data) {
  if (!data || typeof data !== 'object') return

  let changed = false
  for (const key of CLOUD_SYNC_KEYS) {
    if (typeof data[key] === 'string' && localStorage.getItem(key) !== data[key]) {
      localStorage.setItem(key, data[key])
      changed = true
    }
  }
  if (changed) window.dispatchEvent(new Event(CLOUD_DATA_APPLIED_EVENT))
}

/** Current Monday–Sunday week; the API expires this record at local Sunday midnight. */
export function currentWeekKey() {
  return toISODateLocal(startOfWeekMonday(new Date()))
}

export function currentWeekExpiresAt() {
  const monday = startOfWeekMonday(new Date())
  const sundayEnd = addDays(monday, 7)
  sundayEnd.setHours(0, 0, 0, 0)
  return sundayEnd.toISOString()
}
