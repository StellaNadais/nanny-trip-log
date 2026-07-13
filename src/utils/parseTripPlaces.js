import { addDays, toISODateLocal } from './dates'
import { MILE_RATE } from '../data/tripPlaces'
import { buildTripGraph } from './tripSegmentMiles'
import { buildDayTravelJournal, mileageFromDayTravelJournal } from './dayTravelJournal'
import { routeIdsToMileageText } from './tripRouteBar'

export { buildDayTravelJournal, mileageFromDayTravelJournal } from './dayTravelJournal'
export { scanTripLogChunks, splitTripLogForMirror } from './tripTextScan'

/** True when text between two place matches links them (legacy chain grouping). */
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

/**
 * Daily travel journal: chained legs from place nicknames in text.
 * @see buildDayTravelJournal
 */
export function computeTripMileageForText(text, dateISO = '') {
  const graph = buildTripGraph()
  const journal = buildDayTravelJournal(text, dateISO, graph)
  return mileageFromDayTravelJournal(journal, graph)
}

function dayNotesConcatForDate(journalEntries, iso) {
  if (!Array.isArray(journalEntries) || !iso) return ''
  return journalEntries
    .filter((e) => e.dateISO === iso)
    .map((e) => e.dayNotes || '')
    .filter(Boolean)
    .join('\n')
}

function routeTextForDate(journalEntries, iso, draftRoutesByIso) {
  if (draftRoutesByIso && Object.prototype.hasOwnProperty.call(draftRoutesByIso, iso)) {
    return routeIdsToMileageText(draftRoutesByIso[iso] || [])
  }
  if (!Array.isArray(journalEntries) || !iso) return ''
  const forDay = journalEntries.filter((e) => e.dateISO === iso)
  const latest = [...forDay].sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''))[0]
  return routeIdsToMileageText(latest?.routePlaceIds || [])
}

/**
 * @param draftDayNotesByIso optional map iso -> string; overrides saved journal notes for those days (live typing)
 * @param draftRoutesByIso optional map iso -> place id[]; structured route from Route bar
 */
export function computeWeekTripMileage(
  weekStart,
  daysByIso,
  journalEntries = [],
  draftDayNotesByIso = null,
  draftRoutesByIso = null
) {
  const breakdown = []
  let totalMiles = 0
  for (let i = 0; i < 7; i++) {
    const iso = toISODateLocal(addDays(weekStart, i))
    const trip = daysByIso?.[iso]?.tripLog || ''
    let notes = dayNotesConcatForDate(journalEntries, iso)
    if (draftDayNotesByIso && Object.prototype.hasOwnProperty.call(draftDayNotesByIso, iso)) {
      notes = draftDayNotesByIso[iso] ?? ''
    }
    const routeText = routeTextForDate(journalEntries, iso, draftRoutesByIso)
    const combined = [trip, notes, routeText].filter(Boolean).join('\n')
    const journal = buildDayTravelJournal(combined, iso, buildTripGraph())
    if (journal.summary.total_miles > 0) {
      totalMiles += journal.summary.total_miles
      breakdown.push({ iso, ...journal })
    }
  }
  const reimbursement = Math.round(totalMiles * MILE_RATE * 100) / 100
  return { totalMiles, reimbursement, breakdown }
}
