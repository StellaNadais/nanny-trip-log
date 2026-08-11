import { notifyCloudDataChanged } from './cloudSync'

export const SUMMER_BACKPACK_STORAGE_KEY = 'nanny-summer-backpack-v1'

export const SUMMER_BACKPACK_ITEMS = [
  'Water bottle',
  'Sunscreen',
  'Hat',
  'Sunglasses',
  'Change of clothes',
  'Light snack (4yo)',
  'Snack box + ice pack (2.5yo)',
  'Wet wipes',
  'Towel',
  'Swimsuit',
  'Shoes or sandals',
  'Bug spray',
  'First-aid basics',
]

export function loadSummerBackpack() {
  try {
    const saved = JSON.parse(localStorage.getItem(SUMMER_BACKPACK_STORAGE_KEY))
    // "Snacks" was replaced by age-specific items. Discard retired values so
    // a stale completed check never incorrectly marks either new snack packed.
    return Array.isArray(saved) ? saved.filter((item) => SUMMER_BACKPACK_ITEMS.includes(item)) : []
  } catch {
    return []
  }
}

export function saveSummerBackpack(items) {
  try {
    localStorage.setItem(SUMMER_BACKPACK_STORAGE_KEY, JSON.stringify(items))
    notifyCloudDataChanged(SUMMER_BACKPACK_STORAGE_KEY)
  } catch {
    /* ignore quota */
  }
}
