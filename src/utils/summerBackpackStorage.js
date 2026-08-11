import { notifyCloudDataChanged } from './cloudSync'

export const SUMMER_BACKPACK_STORAGE_KEY = 'nanny-summer-backpack-v1'

export const SUMMER_BACKPACK_ITEMS = [
  'Water bottle',
  'Sunscreen',
  'Hat',
  'Sunglasses',
  'Change of clothes',
  'Snacks',
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
