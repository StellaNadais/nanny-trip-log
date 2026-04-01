import { addDays, toISODateLocal } from './dates'
import { MILE_RATE, PLACE_BY_ID } from '../data/tripPlaces'

const TOKEN_SOURCE = '«p:([a-z0-9-]+)»'

export function splitTripLogForMirror(text) {
  const s = String(text || '')
  const chunks = []
  let last = 0
  let m
  const re = new RegExp(TOKEN_SOURCE, 'g')
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      chunks.push({ type: 'text', value: s.slice(last, m.index) })
    }
    const id = m[1]
    chunks.push({
      type: 'place',
      id,
      place: PLACE_BY_ID[id] || null,
    })
    last = m.index + m[0].length
  }
  if (last < s.length) {
    chunks.push({ type: 'text', value: s.slice(last) })
  }
  return chunks
}

export function extractPlaceIdsFromText(text) {
  const s = String(text || '')
  const ids = []
  let m
  const re = new RegExp(TOKEN_SOURCE, 'g')
  while ((m = re.exec(s)) !== null) {
    ids.push(m[1])
  }
  return ids
}

/**
 * Round-trip miles per token occurrence; reimbursement at MILE_RATE.
 */
export function computeTripMileageForText(text) {
  const ids = extractPlaceIdsFromText(text)
  let totalMiles = 0
  const rows = []
  for (const id of ids) {
    const p = PLACE_BY_ID[id]
    if (!p) continue
    const milesRt = p.milesOneWay * 2
    totalMiles += milesRt
    rows.push({ placeId: id, label: p.label, miles: milesRt })
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
    const text = day?.tripLog || ''
    const { totalMiles: dayMiles, rows } = computeTripMileageForText(text)
    if (dayMiles > 0) {
      totalMiles += dayMiles
      breakdown.push({ iso, rows })
    }
  }
  const reimbursement = Math.round(totalMiles * MILE_RATE * 100) / 100
  return { totalMiles, reimbursement, breakdown }
}
