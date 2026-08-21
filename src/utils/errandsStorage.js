import { parseGroceryDraft } from './parseGroceryDraft'
import { notifyCloudDataChanged } from './cloudSync'

const KEY = 'nanny-errands-v1'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadErrandsLists() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  } catch {
    return {}
  }
}

export function saveErrandsLists(lists) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lists))
    notifyCloudDataChanged(KEY)
  } catch {
    /* ignore */
  }
}

/** @returns {{ id: string, text: string, done: boolean }[]} */
export function loadErrandsForWeek(weekKey) {
  const lists = loadErrandsLists()
  const row = lists[weekKey]
  return Array.isArray(row) ? row : []
}

export function persistErrandsForWeek(weekKey, items) {
  const lists = loadErrandsLists()
  lists[weekKey] = items
  saveErrandsLists(lists)
}

/** Add one or many errands (comma / newline separated). */
export function addErrandItems(weekKey, raw) {
  const parts = parseGroceryDraft(raw)
  if (!parts.length) return loadErrandsForWeek(weekKey)
  const items = [
    ...loadErrandsForWeek(weekKey),
    ...parts.map((text) => ({ id: newId(), text, done: false })),
  ]
  persistErrandsForWeek(weekKey, items)
  return items
}

export function toggleErrandItem(weekKey, id) {
  const items = loadErrandsForWeek(weekKey).map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  )
  persistErrandsForWeek(weekKey, items)
  return items
}

export function removeErrandItem(weekKey, id) {
  const items = loadErrandsForWeek(weekKey).filter((t) => t.id !== id)
  persistErrandsForWeek(weekKey, items)
  return items
}
