import { notifyCloudDataChanged } from './cloudSync'

export const SUMMER_BACKPACK_STORAGE_KEY = 'nanny-summer-backpack-v1'
export const SUMMER_BACKPACK_UPDATED_EVENT = 'nanny-summer-backpack-updated'

export const SUMMER_BACKPACK_ITEMS = [
  'Water bottle',
  'Sunscreen',
  'Hat',
  'Extra clothes',
  'Light snack (4yo)',
  'Snack box + ice pack (2.5yo)',
]

export function loadSummerBackpack() {
  try {
    const saved = JSON.parse(localStorage.getItem(SUMMER_BACKPACK_STORAGE_KEY))
    // Discard retired values after list updates so stale selections never
    // mark a different checklist item as packed.
    return Array.isArray(saved) ? saved.filter((item) => SUMMER_BACKPACK_ITEMS.includes(item)) : []
  } catch {
    return []
  }
}

export function saveSummerBackpack(items) {
  try {
    localStorage.setItem(SUMMER_BACKPACK_STORAGE_KEY, JSON.stringify(items))
    notifyCloudDataChanged(SUMMER_BACKPACK_STORAGE_KEY)
    window.dispatchEvent(new Event(SUMMER_BACKPACK_UPDATED_EVENT))
  } catch {
    /* ignore quota */
  }
}
