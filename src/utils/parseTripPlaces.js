import { addDays, toISODateLocal } from './dates'
import { MILE_RATE, PLACE_BY_ID, PLACES } from '../data/tripPlaces'

const TOKEN_RE = /^«p:([a-z0-9-]+)»/

function buildPlacePhrasesSorted() {
  const out = []
  for (const p of PLACES) {
    out.push({ phrase: p.label, place: p })
    for (const a of p.aliases || []) {
      if (a && typeof a === 'string') out.push({ phrase: a, place: p })
    }
  }
  return out.sort((a, b) => b.phrase.length - a.phrase.length)
}

const PLACE_PHRASES_SORTED = buildPlacePhrasesSorted()

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
  let i = 0
  while (i < s.length) {
    if (s[i] === '«') {
      const rest = s.slice(i)
      const tm = rest.match(TOKEN_RE)
      if (tm) {
        const full = tm[0]
        const id = tm[1]
        chunks.push({
          type: 'token',
          value: full,
          place: PLACE_BY_ID[id] || null,
        })
        i += full.length
        continue
      }
    }

    let matchedPhrase = null
    let matchedPlace = null
    for (const { phrase, place } of PLACE_PHRASES_SORTED) {
      const L = phrase.length
      if (i + L > s.length) continue
      if (s.slice(i, i + L).toLowerCase() !== phrase.toLowerCase()) continue
      if (!boundaryBefore(s, i) || !boundaryAfter(s, i + L)) continue
      matchedPhrase = phrase
      matchedPlace = place
      break
    }

    if (matchedPlace && matchedPhrase) {
      chunks.push({
        type: 'place',
        value: s.slice(i, i + matchedPhrase.length),
        place: matchedPlace,
      })
      i += matchedPhrase.length
      continue
    }

    const prev = chunks[chunks.length - 1]
    if (prev && prev.type === 'text') {
      prev.value += s[i]
    } else {
      chunks.push({ type: 'text', value: s[i] })
    }
    i += 1
  }
  return chunks
}

export function splitTripLogForMirror(text) {
  return scanTripLogChunks(text)
}

/**
 * Round-trip miles per matched place (typed name, alias, or legacy «p:id» token).
 */
export function computeTripMileageForText(text) {
  const chunks = scanTripLogChunks(text)
  let totalMiles = 0
  const rows = []
  for (const c of chunks) {
    if ((c.type === 'place' || c.type === 'token') && c.place) {
      const milesRt = c.place.milesOneWay * 2
      totalMiles += milesRt
      rows.push({ placeId: c.place.id, label: c.place.label, miles: milesRt })
    }
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
