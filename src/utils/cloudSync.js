/** localStorage keys mirrored to Supabase for nanny + family sharing. */
export const CLOUD_SYNC_KEYS = [
  'nanny-bookings-v1',
  'nanny-parent-reminders-v1',
  'nanny-journal-shopping-v1',
  'nanny-errands-v1',
  'nanny-kid-journal-v1',
  'nanny-shift-punctuality-v1',
  'nanny-receipt-settings-v1',
  'nanny-shift-contract-v1',
  'nanny-trip-log-v1',
  'nanny-outings-places-v3',
  'nanny-custom-celebrations-v1',
  'nanny-today-custom-tiles-v1',
  'nanny-summer-backpack-v1',
]

/** Domain events fired when a synced key changes from the cloud. */
const KEY_DOMAIN_EVENTS = {
  'nanny-outings-places-v3': 'nanny-outings-updated',
  'nanny-custom-celebrations-v1': 'nanny-custom-celebrations-updated',
  'nanny-today-custom-tiles-v1': 'nanny-today-custom-tiles-updated',
  'nanny-receipt-settings-v1': 'nanny-receipt-mileage',
  'nanny-summer-backpack-v1': 'nanny-summer-backpack-updated',
}

export const CLOUD_DATA_CHANGED_EVENT = 'nanny-cloud-data-changed'
export const CLOUD_DATA_APPLIED_EVENT = 'nanny-cloud-data-applied'

export const CLOUD_RETENTION_DAYS = 7

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
  const changedKeys = []

  for (const key of CLOUD_SYNC_KEYS) {
    if (typeof data[key] === 'string' && localStorage.getItem(key) !== data[key]) {
      localStorage.setItem(key, data[key])
      changed = true
      changedKeys.push(key)
    }
  }

  if (!changed) return

  for (const key of changedKeys) {
    const eventName = KEY_DOMAIN_EVENTS[key]
    if (eventName) window.dispatchEvent(new Event(eventName))
  }
  window.dispatchEvent(new Event(CLOUD_DATA_APPLIED_EVENT))
}
