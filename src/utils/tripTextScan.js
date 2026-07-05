import { HOME_PLACE, PLACE_BY_ID, PLACES } from '../data/tripPlaces'
import { loadOutingsPlaces } from './outingsStorage'
import { outingRecordToPlace } from './outingsPlaceModel'

const TOKEN_RE = /^«p:([a-z0-9-]+)»/

function buildBuiltInPhrasesSorted() {
  const out = [{ phrase: HOME_PLACE.label, place: HOME_PLACE }]
  for (const a of HOME_PLACE.aliases || []) {
    if (a) out.push({ phrase: a, place: HOME_PLACE })
  }
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
