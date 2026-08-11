export const CLOUD_SYNC_KEYS = [
  'nanny-bookings-v1',
  'nanny-parent-reminders-v1',
  'nanny-journal-shopping-v1',
  'nanny-kid-journal-v1',
  'nanny-shift-punctuality-v1',
  'nanny-receipt-settings-v1',
  'nanny-shift-contract-v2',
  'nanny-trip-log-v1',
  'nanny-outings-places-v3',
  'nanny-summer-backpack-v1',
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
