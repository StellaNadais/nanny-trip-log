import { addDays, toISODateLocal } from './dates'
import { MILE_RATE, PLACE_BY_ID, PLACES } from '../data/tripPlaces'

const TOKEN_RE = /^«p:([a-z0-9-]+)»/

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

const PLACES_BY_LABEL_LEN = [...PLACES].sort((a, b) => b.label.length - a.label.length)

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

    let matched = null
    for (const p of PLACES_BY_LABEL_LEN) {
      const L = p.label.length
      if (i + L > s.length) continue
      if (s.slice(i, i + L).toLowerCase() !== p.label.toLowerCase()) continue
      if (!boundaryBefore(s, i) || !boundaryAfter(s, i + L)) continue
      matched = p
      break
    }

    if (matched) {
      chunks.push({
        type: 'place',
        value: s.slice(i, i + matched.label.length),
        place: matched,
      })
      i += matched.label.length
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
 * Round-trip miles per matched place (typed name or legacy «p:id» token).
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

export function computeWeekTripMileage(weekStart, daysByIso) {
  const breakdown = []
  let totalMiles = 0
  for (let i = 0; i < 7; i++) {
    const iso = toISODateLocal(addDays(weekStart, i))
    const day = daysByIso?.[iso]
    const t = day?.tripLog || ''
    const { totalMiles: dayMiles, rows } = computeTripMileageForText(t)
    if (dayMiles > 0) {
      totalMiles += dayMiles
      breakdown.push({ iso, rows })
    }
  }
  const reimbursement = Math.round(totalMiles * MILE_RATE * 100) / 100
  return { totalMiles, reimbursement, breakdown }
}
