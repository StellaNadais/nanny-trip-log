import { notifyCloudDataChanged } from './cloudSync'

const KEY = 'nanny-today-custom-tiles-v1'

export const TODAY_CUSTOM_TILES_UPDATED_EVENT = 'nanny-today-custom-tiles-updated'

/** @typedef {'note' | 'link' | 'gif' | 'ideas'} TodayTileType */

/**
 * @typedef {{
 *   id: string,
 *   text: string,
 *   url?: string,
 *   note?: string,
 * }} TodayIdeaItem
 */

/**
 * @typedef {{
 *   id: string,
 *   type: TodayTileType,
 *   title: string,
 *   body?: string,
 *   url?: string,
 *   items?: TodayIdeaItem[],
 *   accent?: string,
 *   createdAt: number,
 * }} TodayCustomTile
 */

const VALID_TYPES = new Set(['note', 'link', 'gif', 'ideas'])

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  const text = String(raw.text ?? '').trim()
  if (!text) return null
  return {
    id: String(raw.id || `idea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    text,
    url: String(raw.url ?? '').trim(),
    note: String(raw.note ?? '').trim(),
  }
}

function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null
  const type = String(raw.type ?? '')
  const title = String(raw.title ?? '').trim()
  if (!VALID_TYPES.has(type) || !title) return null
  const items = Array.isArray(raw.items)
    ? raw.items.map(normalizeItem).filter(Boolean)
    : []
  return {
    id: String(raw.id || `custom-${Date.now()}`),
    type,
    title,
    body: String(raw.body ?? '').trim(),
    url: String(raw.url ?? '').trim(),
    items,
    accent: String(raw.accent ?? 'lavender'),
    createdAt: Number(raw.createdAt) || Date.now(),
  }
}

/** @returns {TodayCustomTile[]} */
export function loadCustomTodayTiles() {
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

/** @param {TodayCustomTile[]} items */
export function saveCustomTodayTiles(items) {
  localStorage.setItem(KEY, JSON.stringify(items.map(normalize).filter(Boolean)))
  notifyCloudDataChanged(KEY)
  window.dispatchEvent(new CustomEvent(TODAY_CUSTOM_TILES_UPDATED_EVENT))
}

/** @param {Omit<TodayCustomTile, 'id' | 'createdAt'> & { id?: string, createdAt?: number }} entry */
export function addCustomTodayTile(entry) {
  const row = normalize({
    ...entry,
    id: entry.id || globalThis.crypto?.randomUUID?.(),
    createdAt: entry.createdAt ?? Date.now(),
  })
  if (!row) return null
  saveCustomTodayTiles([...loadCustomTodayTiles(), row])
  return row
}

/** @param {string} id @param {Partial<TodayCustomTile>} patch */
export function updateCustomTodayTile(id, patch) {
  const items = loadCustomTodayTiles()
  const idx = items.findIndex((t) => t.id === id)
  if (idx < 0) return null
  const next = normalize({ ...items[idx], ...patch, id })
  if (!next) return null
  items[idx] = next
  saveCustomTodayTiles(items)
  return next
}

export function removeCustomTodayTile(id) {
  saveCustomTodayTiles(loadCustomTodayTiles().filter((t) => t.id !== id))
}

/** @param {TodayCustomTile} tile */
export function todayTilePreviewText(tile) {
  const meta = tile.type
  if (meta === 'note' && tile.body) {
    const line = tile.body.split('\n').find((l) => l.trim())?.trim() ?? ''
    return line.length > 72 ? `${line.slice(0, 69)}…` : line
  }
  if (meta === 'link' && tile.url) {
    try {
      return new URL(tile.url).hostname.replace(/^www\./, '')
    } catch {
      return tile.url
    }
  }
  if (meta === 'gif' && tile.url) return 'GIF saved'
  if (meta === 'ideas') {
    if (tile.items?.length) {
      const first = tile.items[0].text
      const suffix = tile.items.length > 1 ? ` · +${tile.items.length - 1} more` : ''
      const line = first.length > 48 ? `${first.slice(0, 45)}…` : first
      return `${line}${suffix}`
    }
    return ''
  }
  if (tile.body) return tile.body.slice(0, 72)
  return ''
}

/** @param {TodayCustomTile} tile */
export function todayTileCount(tile) {
  if (tile.type === 'ideas') return tile.items?.length ?? 0
  if (tile.type === 'note' && tile.body) {
    return tile.body.split('\n').filter((l) => l.trim()).length
  }
  return 0
}

/** @param {string} url */
export function isLikelyImageUrl(url) {
  if (!url) return false
  return /\.(gif|png|jpe?g|webp)(\?|$)/i.test(url) || /giphy\.com\/media\//i.test(url)
}
