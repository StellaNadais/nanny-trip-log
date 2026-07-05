import { buildTripGraph, milesBetween, resolvePlaceLabel } from './tripSegmentMiles'
import { scanTripLogChunks } from './tripTextScan'
import { HOME_PLACE, HOME_PLACE_ID, MILE_RATE } from '../data/tripPlaces'

export { HOME_PLACE }

function roundMi(n) {
  return Math.round(n * 100) / 100
}

/** Match saved + home nicknames in text (ordered by position). */
export function placeHitsInText(text) {
  const chunks = scanTripLogChunks(text)
  /** @type {{ place: object, start: number, end: number }[]} */
  const hits = []
  for (const c of chunks) {
    if ((c.type === 'place' || c.type === 'token') && c.place && typeof c.start === 'number') {
      hits.push({ place: c.place, start: c.start, end: c.end })
    }
  }
  return hits.sort((a, b) => a.start - b.start)
}

/** Insert Home when narrative says “came back” between two away stops. */
export function expandStopsWithImplicitHome(text, hits) {
  if (!hits.length) return []
  const stops = []
  for (let i = 0; i < hits.length; i += 1) {
    stops.push(hits[i].place)
    if (i >= hits.length - 1) continue
    const gap = String(text).slice(hits[i].end, hits[i + 1].start)
    const returning =
      /\bcame back\b/i.test(gap) ||
      /\bback home\b/i.test(gap) ||
      /\breturned home\b/i.test(gap) ||
      /\bhome for\b/i.test(gap)
    if (
      returning &&
      hits[i].place.id !== HOME_PLACE_ID &&
      hits[i + 1].place.id !== HOME_PLACE_ID
    ) {
      stops.push(HOME_PLACE)
    }
  }
  return stops
}

/**
 * Chained legs: each stop follows the previous (first leg starts at Home).
 * Single away stop → round trip home. Multi-stop day → no automatic return at end.
 */
export function buildSegmentsForStops(stops, graph) {
  if (!stops?.length) return []
  const adj = graph ?? buildTripGraph()
  /** @type {{ from: string, to: string, fromId: string, toId: string, miles: number, note: string }[]} */
  const segments = []
  let prevId = HOME_PLACE_ID

  for (const place of stops) {
    if (!place?.id || place.id === prevId) continue
    const leg = milesBetween(prevId, place.id, adj)
    if (leg == null) return []
    segments.push({
      from: resolvePlaceLabel(prevId),
      to: resolvePlaceLabel(place.id),
      fromId: prevId,
      toId: place.id,
      miles: leg,
      note: '',
    })
    prevId = place.id
  }

  const awayStops = stops.filter((p) => p?.id && p.id !== HOME_PLACE_ID)
  if (awayStops.length === 1 && prevId !== HOME_PLACE_ID) {
    const leg = milesBetween(prevId, HOME_PLACE_ID, adj)
    if (leg == null) return []
    segments.push({
      from: resolvePlaceLabel(prevId),
      to: resolvePlaceLabel(HOME_PLACE_ID),
      fromId: prevId,
      toId: HOME_PLACE_ID,
      miles: leg,
      note: '',
    })
  }

  return segments
}

/** Full daily travel journal object from journal / trip-log text. */
export function buildDayTravelJournal(text, dateISO = '', graph) {
  const journalText = String(text || '').trim()
  const hits = placeHitsInText(journalText)
  const stops = expandStopsWithImplicitHome(journalText, hits)
  const rawSegments = buildSegmentsForStops(stops, graph)
  const segments = rawSegments.map((s, i) => ({
    segment_id: i + 1,
    from: s.from,
    to: s.to,
    miles: s.miles,
    note: s.note,
  }))
  const totalMiles = roundMi(segments.reduce((sum, s) => sum + s.miles, 0))
  const totalCost = roundMi(totalMiles * MILE_RATE)

  return {
    day_entry: {
      date: dateISO || null,
      journal_text: journalText,
    },
    segments,
    summary: {
      total_miles: totalMiles,
      total_segments: segments.length,
      cost_per_mile: MILE_RATE,
      total_cost: totalCost,
    },
  }
}

/** Mileage totals + legacy row shape for receipt cache. */
export function mileageFromDayTravelJournal(journal, graph) {
  const full = journal?.segments?.length
    ? journal
    : buildDayTravelJournal(journal?.day_entry?.journal_text ?? '', journal?.day_entry?.date ?? '', graph)

  const rows = full.segments.map((s) => ({
    placeId: `${s.from}→${s.to}`,
    label: `${s.from} → ${s.to}`,
    miles: s.miles,
    note: s.note,
  }))

  return {
    totalMiles: full.summary.total_miles,
    reimbursement: full.summary.total_cost,
    rows,
    ...full,
  }
}
