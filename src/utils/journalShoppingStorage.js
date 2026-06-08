import { parseGroceryDraft } from './parseGroceryDraft'

const KEY = 'nanny-journal-shopping-v1'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadShoppingLists() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  } catch {
    return {}
  }
}

export function saveShoppingLists(lists) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lists))
  } catch {
    /* ignore */
  }
}

/** @returns {{ id: string, text: string, done: boolean }[]} */
export function loadShoppingForWeek(weekKey) {
  const lists = loadShoppingLists()
  const row = lists[weekKey]
  return Array.isArray(row) ? row : []
}

export function persistShoppingForWeek(weekKey, items) {
  const lists = loadShoppingLists()
  lists[weekKey] = items
  saveShoppingLists(lists)
}

export function addShoppingItem(weekKey, text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return loadShoppingForWeek(weekKey)
  const items = [
    ...loadShoppingForWeek(weekKey),
    { id: newId(), text: trimmed, done: false },
  ]
  persistShoppingForWeek(weekKey, items)
  return items
}

/** Add one or many items (comma / newline separated). */
export function addShoppingItems(weekKey, raw) {
  const parts = parseGroceryDraft(raw)
  if (!parts.length) return loadShoppingForWeek(weekKey)
  const items = [
    ...loadShoppingForWeek(weekKey),
    ...parts.map((text) => ({ id: newId(), text, done: false })),
  ]
  persistShoppingForWeek(weekKey, items)
  return items
}

export function toggleShoppingItem(weekKey, id) {
  const items = loadShoppingForWeek(weekKey).map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  )
  persistShoppingForWeek(weekKey, items)
  return items
}

export function removeShoppingItem(weekKey, id) {
  const items = loadShoppingForWeek(weekKey).filter((t) => t.id !== id)
  persistShoppingForWeek(weekKey, items)
  return items
}
