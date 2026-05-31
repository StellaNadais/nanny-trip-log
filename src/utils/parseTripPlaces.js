import { addDays, toISODateLocal } from './dates'
import { MILE_RATE, PLACE_BY_ID, PLACES } from '../data/tripPlaces'
import { loadOutingsPlaces } from './outingsStorage'
import { outingRecordToPlace } from './outingsPlaceModel'
import { runMilesForPlaceChain, buildTripGraph } from './tripSegmentMiles'

export { runMilesForPlaceChain }

const TOKEN_RE = /^«p:([a-z0-9-]+)»/

/** True when text between two place matches links them (home → A → B → home style). */
export function isConnectorGapBetweenPlaces(gap) {
  if (gap == null) return false
  const g = String(gap)
  if (!g.trim()) return false
  if (/\bthen\b/i.test(g)) return true
  if (/\s\+\s/.test(g)) return true
  const t = g.trim()
  if (/^\+\s*/.test(t)) return true
  if (/\+\s*$/.test(t)) return true
  return false
}

function buildBuiltInPhrasesSorted() {
  const out = []
  for (const p of PLACES) {
    out.push({ phrase: p.label, place: p })
    for (const a of p.aliases || []) {
      if (a && typeof a === 'string') out.push({ phrase: a, place: p })
    }
  }
  return out
}

function buildCustomPhrasesSorted() {
  const out = []
  for (const r of loadOutingsPlaces()) {
    const p = outingRecordToPlace(r)
    if (!p) continue
    out.push({ phrase: p.label, place: p })
    for (const a of p.aliases || []) {
      if (a) out.push({ phrase: a, place: p })
    }
  }
  return out
}

function getPlacePhrasesSorted() {
  return [...buildBuiltInPhrasesSorted(), ...buildCustomPhrasesSorted()].sort(
    (a, b) => b.phrase.length - a.phrase.length
  )
}

function getMergedPlaceById() {
  const m = { ...PLACE_BY_ID }
  for (const r of loadOutingsPlaces()) {
    const p = outingRecordToPlace(r)
    if (p) m[p.id] = p
  }
  return m
}

/** Letter, digit, or apostrophe (e.g. Children's) counts as “word” interior. */
function isWordChar(c) {
  return c !== undefined && /[a-zA-Z0-9']/.test(c)
}

function boundaryBefore(text, i) {
  return i === 0 || !isWordChar(text[i - 1])
}

function boundaryAfter(text, end) {
  return end >= text.length || !isWordChar(text[end])
}

/**
 * Scan text into chunks for mirror + mileage (non-overlapping; tokens take priority at «).
 */
export function scanTripLogChunks(text) {
  const s = String(text || '')
  const chunks = []
  const placeById = getMergedPlaceById()
  const placePhrasesSorted = getPlacePhrasesSorted()
  let i = 0
  while (i < s.length) {
    if (s[i] === '«') {
      const rest = s.slice(i)
      const tm = rest.match(TOKEN_RE)
      if (tm) {
        const full = tm[0]
        const id = tm[1]
        const start = i
        chunks.push({
          type: 'token',
          value: full,
          place: placeById[id] || null,
          start,
          end: start + full.length,
        })
        i += full.length
        continue
      }
    }

    let matchedPhrase = null
    let matchedPlace = null
    for (const { phrase, place } of placePhrasesSorted) {
      const L = phrase.length
      if (i + L > s.length) continue
      if (s.slice(i, i + L).toLowerCase() !== phrase.toLowerCase()) continue
      if (!boundaryBefore(s, i) || !boundaryAfter(s, i + L)) continue
      matchedPhrase = phrase
      matchedPlace = place
      break
    }

    if (matchedPlace && matchedPhrase) {
      const start = i
      const len = matchedPhrase.length
      chunks.push({
        type: 'place',
        value: s.slice(i, i + len),
        place: matchedPlace,
        start,
        end: start + len,
      })
      i += len
      continue
    }

    const start = i
    const prev = chunks[chunks.length - 1]
    if (prev && prev.type === 'text') {
      prev.value += s[i]
      prev.end = i + 1
    } else {
      chunks.push({ type: 'text', value: s[i], start, end: i + 1 })
    }
    i += 1
  }
  return chunks
}

export function splitTripLogForMirror(text) {
  return scanTripLogChunks(text)
}

/**
 * Mileage from place names / tokens, grouped by "then" or "+" between consecutive matches.
 * Unlinked matches each count as their own home → place → home run.
 */
export function computeTripMileageForText(text) {
  const s = String(text || '')
  const chunks = scanTripLogChunks(s)
  /** @type {{ place: object, start: number, end: number }[]} */
  const hits = []
  for (const c of chunks) {
    if ((c.type === 'place' || c.type === 'token') && c.place && typeof c.start === 'number') {
      hits.push({ place: c.place, start: c.start, end: c.end })
    }
  }
  if (hits.length === 0) {
    return { totalMiles: 0, reimbursement: 0, rows: [] }
  }

  const groups = []
  let i = 0
  while (i < hits.length) {
    const group = [hits[i]]
    let last = hits[i]
    let j = i + 1
    while (j < hits.length) {
      const gap = s.slice(last.end, hits[j].start)
      if (!isConnectorGapBetweenPlaces(gap)) break
      group.push(hits[j])
      last = hits[j]
      j++
    }
    groups.push(group)
    i = j
  }

  let totalMiles = 0
  const rows = []
  const graph = buildTripGraph()
  for (const g of groups) {
    const places = g.map((h) => h.place)
    const miles = runMilesForPlaceChain(places, graph)
    totalMiles += miles
    rows.push({
      placeId: places.map((p) => p.id).join('|'),
      label: places.map((p) => p.label).join(' → '),
      miles,
    })
  }
  const reimbursement = Math.round(totalMiles * MILE_RATE * 100) / 100
  return { totalMiles, reimbursement, rows }
}

function dayNotesConcatForDate(journalEntries, iso) {
  if (!Array.isArray(journalEntries) || !iso) return ''
  return journalEntries
    .filter((e) => e.dateISO === iso)
    .map((e) => e.dayNotes || '')
    .filter(Boolean)
    .join('\n')
}

/**
 * @param draftDayNotesByIso optional map iso -> string; overrides saved journal notes for those days (live typing)
 */
export function computeWeekTripMileage(weekStart, daysByIso, journalEntries = [], draftDayNotesByIso = null) {
  const breakdown = []
  let totalMiles = 0
  for (let i = 0; i < 7; i++) {
    const iso = toISODateLocal(addDays(weekStart, i))
    const trip = daysByIso?.[iso]?.tripLog || ''
    let notes = dayNotesConcatForDate(journalEntries, iso)
    if (draftDayNotesByIso && Object.prototype.hasOwnProperty.call(draftDayNotesByIso, iso)) {
      notes = draftDayNotesByIso[iso] ?? ''
    }
    const combined = [trip, notes].filter(Boolean).join('\n')
    const { totalMiles: dayMiles, rows } = computeTripMileageForText(combined)
    if (dayMiles > 0) {
      totalMiles += dayMiles
      breakdown.push({ iso, rows })
    }
  }
  const reimbursement = Math.round(totalMiles * MILE_RATE * 100) / 100
  return { totalMiles, reimbursement, breakdown }
}
