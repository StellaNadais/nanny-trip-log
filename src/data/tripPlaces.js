/** One-way miles from Deerfield Dr, Moraga (approximate — tune in this file). */
export const MILE_RATE = 0.54

/**
 * region: oakland | moraga | lafayette | custom — colors on trip highlight layer only
 * aliases: optional shorter phrases matched in diary-style text (case-insensitive, word boundaries)
 */
export const PLACES = [
  {
    id: 'oak-omca',
    label: 'Oakland Museum of California (OMCA)',
    aliases: ['OMCA'],
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
    aliases: ['Fairyland'],
    region: 'oakland',
    milesOneWay: 17,
  },
  {
    id: 'oak-chabot',
    label: 'Chabot Space & Science Center',
    aliases: ['Chabot'],
    region: 'oakland',
    milesOneWay: 12,
  },
  {
    id: 'moraga-lib',
    label: 'Moraga Library',
    aliases: ['Moraga library'],
    region: 'moraga',
    milesOneWay: 3,
  },
  {
    id: 'moraga-rheem',
    label: 'Rheem Valley (shops / errands)',
    aliases: ['Rheem Valley'],
    region: 'moraga',
    milesOneWay: 2.5,
  },
  {
    id: 'moraga-commons',
    label: 'Moraga Commons (park)',
    aliases: ['Moraga Commons'],
    region: 'moraga',
    milesOneWay: 2.5,
  },
  {
    id: 'moraga-learn-play',
    label: 'Learn and Play School',
    aliases: ['Learn and Play', 'Learn & Play School', '1695 Canyon'],
    region: 'moraga',
    milesOneWay: 3, // 1695 Canyon Rd, Moraga CA 94556 — tune vs your home base
  },
  {
    id: 'laf-lib',
    label: 'Lafayette Library',
    aliases: ['Laf Library', 'Lafayette library'],
    region: 'lafayette',
    milesOneWay: 6,
  },
  {
    id: 'laf-music',
    label: 'Music class (Lamorinda / Lafayette)',
    aliases: ['Lamorinda'],
    region: 'lafayette',
    milesOneWay: 6,
  },
]

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]))

/**
 * Exact match (trimmed, case-insensitive) to a frequent location label or alias.
 * @returns {(typeof PLACES)[number] | null}
 */
export function findBuiltInPlaceByNameOrAlias(text) {
  const q = String(text ?? '').trim().toLowerCase()
  if (!q) return null
  for (const p of PLACES) {
    if (p.label.trim().toLowerCase() === q) return p
    for (const a of p.aliases || []) {
      if (String(a).trim().toLowerCase() === q) return p
    }
  }
  return null
}

/** True if this string is already a built-in frequent location (label or alias). */
export function isFrequentPlaceNameOrAlias(text) {
  return findBuiltInPlaceByNameOrAlias(text) != null
}

export function roundTripMilesForPlace(p) {
  if (!p || !Number.isFinite(p.milesOneWay)) return 0
  return Math.round(p.milesOneWay * 2 * 100) / 100
}
