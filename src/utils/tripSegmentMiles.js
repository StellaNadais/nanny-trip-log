import { HOME_PLACE_ID, PLACE_BY_ID, PLACES } from '../data/tripPlaces'
import { TRIP_SEGMENTS } from '../data/tripSegments'
import { loadOutingsPlaces } from './outingsStorage'
import { buildSegmentsForStops } from './dayTravelJournal'

function roundMi(n) {
  return Math.round(n * 100) / 100
}

function addUndirectedEdge(adj, a, b, miles) {
  if (!Number.isFinite(miles) || miles < 0) return
  if (!adj.has(a)) adj.set(a, [])
  if (!adj.has(b)) adj.set(b, [])
  adj.get(a).push({ to: b, miles })
  adj.get(b).push({ to: a, miles })
}

/** @returns {Map<string, { to: string, miles: number }[]>} */
export function buildTripGraph() {
  const adj = new Map()
  for (const s of TRIP_SEGMENTS) {
    addUndirectedEdge(adj, s.from, s.to, s.miles)
  }
  for (const row of loadOutingsPlaces()) {
    if (typeof row.legFromId === 'string' && Number.isFinite(row.legMiles)) {
      addUndirectedEdge(adj, row.legFromId, row.id, row.legMiles)
    } else if (Number.isFinite(row.milesRoundTrip)) {
      addUndirectedEdge(adj, HOME_PLACE_ID, row.id, row.milesRoundTrip / 2)
    }
  }
  return adj
}

/**
 * Shortest one-way miles between two place ids (Dijkstra on small graph).
 * @param {Map<string, { to: string, miles: number }[]>} [graph]
 */
export function milesBetween(fromId, toId, graph) {
  if (fromId === toId) return 0
  const adj = graph ?? buildTripGraph()
  const dist = new Map([[fromId, 0]])
  /** @type {{ id: string, miles: number }[]} */
  const heap = [{ id: fromId, miles: 0 }]

  while (heap.length > 0) {
    heap.sort((a, b) => a.miles - b.miles)
    const { id, miles } = heap.shift()
    if (id === toId) return roundMi(miles)
    if (miles > (dist.get(id) ?? Infinity)) continue
    for (const { to, miles: w } of adj.get(id) || []) {
      const next = miles + w
      if (next < (dist.get(to) ?? Infinity)) {
        dist.set(to, next)
        heap.push({ id: to, miles: next })
      }
    }
  }
  return null
}

/**
 * One-way miles home → place (for display / simple round trips).
 * @param {{ id: string }} place
 */
export function oneWayMilesFromHome(place, graph) {
  if (!place?.id || place.id === HOME_PLACE_ID) return 0
  const m = milesBetween(HOME_PLACE_ID, place.id, graph)
  return m == null ? 0 : m
}

/** Round trip home → place → home. */
export function roundTripMilesForPlace(place, graph) {
  const ow = oneWayMilesFromHome(place, graph)
  return roundMi(ow * 2)
}

/**
 * @deprecated Prefer buildDayTravelJournal — sums chained leg miles for a place list.
 */
export function runMilesForPlaceChain(places, graph) {
  const segments = buildSegmentsForStops(places ?? [], graph)
  if (!segments.length) return 0
  return roundMi(segments.reduce((sum, s) => sum + s.miles, 0))
}

/** Built-in + custom ids for Outings “connect from” dropdown. */
export function legAnchorOptions() {
  return [
    { id: HOME_PLACE_ID, label: 'Home' },
    ...PLACES.map((p) => ({ id: p.id, label: p.label })),
  ]
}

export function allPlaceIdsInGraph() {
  const ids = new Set([HOME_PLACE_ID, ...PLACES.map((p) => p.id)])
  for (const row of loadOutingsPlaces()) {
    if (row?.id) ids.add(row.id)
  }
  return ids
}

/** Resolve label for any graph id (built-in or custom row). */
export function resolvePlaceLabel(id) {
  if (id === HOME_PLACE_ID) return 'Home'
  if (PLACE_BY_ID[id]) return PLACE_BY_ID[id].label
  const custom = loadOutingsPlaces().find((r) => r.id === id)
  return custom?.label ?? id
}
