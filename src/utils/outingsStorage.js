import { PLACES, HOME_PLACE_ID } from '../data/tripPlaces'

const KEY = 'nanny-outings-places-v3'
const LEGACY_KEYS = ['nanny-outings-places-v2', 'nanny-outings-places-v1']

export const OUTINGS_UPDATED_EVENT = 'nanny-outings-updated'

/** Fields we never persist (privacy / portfolio safety). */
const FORBIDDEN_KEYS = new Set([
  'address',
  'street',
  'streetAddress',
  'lat',
  'lng',
  'latitude',
  'longitude',
  'placeId',
  'mapsUrl',
  'coordinates',
])

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   nickname: string,
 *   legFromId?: string,
 *   legMiles?: number,
 *   milesRoundTrip?: number,
 * }} OutingPlace
 */

function stripForbiddenFields(row) {
  if (!row || typeof row !== 'object') return row
  const out = { ...row }
  for (const k of FORBIDDEN_KEYS) {
    delete out[k]
  }
  return out
}

function normalizeRow(r) {
  const clean = stripForbiddenFields(r)
  if (!clean || typeof clean.id !== 'string' || typeof clean.label !== 'string') return null
  const label = clean.label.trim()
  if (!label) return null
  const nickname = typeof clean.nickname === 'string' ? clean.nickname.trim() : ''

  if (typeof clean.legFromId === 'string' && Number.isFinite(clean.legMiles)) {
    const legMiles = Math.max(0, clean.legMiles)
    return {
      id: clean.id,
      label,
      nickname,
      legFromId: clean.legFromId,
      legMiles: Math.round(legMiles * 100) / 100,
    }
  }

  let milesRoundTrip
  if (typeof clean.milesRoundTrip === 'number' && Number.isFinite(clean.milesRoundTrip)) {
    milesRoundTrip = clean.milesRoundTrip
  } else if (typeof clean.milesOneWay === 'number' && Number.isFinite(clean.milesOneWay)) {
    milesRoundTrip = clean.milesOneWay * 2
  } else {
    return null
  }
  if (milesRoundTrip < 0) return null
  return {
    id: clean.id,
    label,
    nickname,
    legFromId: HOME_PLACE_ID,
    legMiles: Math.round((milesRoundTrip / 2) * 100) / 100,
  }
}

/** Drop custom rows that duplicate built-in starter places (by label or alias). */
function pruneCustomPlacesAgainstBuiltIn(places) {
  const frequentLabels = new Set(PLACES.map((p) => p.label.trim().toLowerCase()))
  for (const p of PLACES) {
    for (const a of p.aliases || []) {
      frequentLabels.add(String(a).trim().toLowerCase())
    }
  }
  return places.filter((r) => !frequentLabels.has(String(r.label || '').trim().toLowerCase()))
}

function readRawList() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return Array.isArray(data) ? data : []
    }
    for (const legacyKey of LEGACY_KEYS) {
      const legacy = localStorage.getItem(legacyKey)
      if (!legacy) continue
      const data = JSON.parse(legacy)
      if (!Array.isArray(data)) continue
      const migrated = data.map(normalizeRow).filter(Boolean)
      try {
        localStorage.setItem(KEY, JSON.stringify(migrated))
        for (const k of LEGACY_KEYS) localStorage.removeItem(k)
      } catch {
        /* quota */
      }
      return migrated
    }
    return []
  } catch {
    return []
  }
}

export function loadOutingsPlaces() {
  try {
    const list = readRawList().map(normalizeRow).filter(Boolean)
    const pruned = pruneCustomPlacesAgainstBuiltIn(list)
    if (pruned.length !== list.length) {
      try {
        localStorage.setItem(KEY, JSON.stringify(pruned))
      } catch {
        /* quota */
      }
      window.dispatchEvent(new Event(OUTINGS_UPDATED_EVENT))
    }
    return pruned
  } catch {
    return []
  }
}

/** @param {OutingPlace[]} places */
export function saveOutingsPlaces(places) {
  const list = Array.isArray(places) ? places.map(stripForbiddenFields) : []
  const pruned = pruneCustomPlacesAgainstBuiltIn(list)
  const normalized = pruned.map(normalizeRow).filter(Boolean)
  try {
    localStorage.setItem(KEY, JSON.stringify(normalized))
  } catch {
    /* quota */
  }
}

export function notifyOutingsUpdated() {
  window.dispatchEvent(new Event(OUTINGS_UPDATED_EVENT))
}
