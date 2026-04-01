/** One-way miles from Deerfield Dr, Moraga (approximate — tune in this file). */
export const START_POINT_LABEL = 'Deerfield Dr, Moraga'
export const MILE_RATE = 0.54

/** region: oakland → monospace | moraga → italic | lafayette → bold + monospace */
export const PLACES = [
  {
    id: 'oak-omca',
    label: 'Oakland Museum of California (OMCA)',
    region: 'oakland',
    milesOneWay: 16,
  },
  {
    id: 'oak-cmo',
    label: "Children's Museum Oakland",
    region: 'oakland',
    milesOneWay: 15,
  },
  {
    id: 'oak-fairy',
    label: "Children's Fairyland",
    region: 'oakland',
    milesOneWay: 17,
  },
  {
    id: 'oak-chabot',
    label: 'Chabot Space & Science Center',
    region: 'oakland',
    milesOneWay: 12,
  },
  {
    id: 'moraga-lib',
    label: 'Moraga Library',
    region: 'moraga',
    milesOneWay: 3,
  },
  {
    id: 'moraga-rheem',
    label: 'Rheem Valley (shops / errands)',
    region: 'moraga',
    milesOneWay: 2.5,
  },
  {
    id: 'laf-lib',
    label: 'Lafayette Library',
    region: 'lafayette',
    milesOneWay: 6,
  },
  {
    id: 'laf-music',
    label: 'Music class (Lamorinda / Lafayette)',
    region: 'lafayette',
    milesOneWay: 6,
  },
]

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]))

export const PLACE_SUGGESTIONS = PLACES.map(
  (p) => `${p.label} — ~${p.milesOneWay} mi one-way from ${START_POINT_LABEL}`
)

export function placesGroupedForSelect() {
  const groups = { oakland: [], moraga: [], lafayette: [] }
  for (const p of PLACES) {
    groups[p.region].push(p)
  }
  return ['oakland', 'moraga', 'lafayette']
    .map((region) => ({
      region,
      label:
        region === 'oakland'
          ? 'Oakland'
          : region === 'moraga'
            ? 'Moraga'
            : 'Lafayette',
      places: groups[region],
    }))
    .filter((g) => g.places.length > 0)
}
