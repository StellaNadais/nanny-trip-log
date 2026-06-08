/** Implicit start/end for every trip — not matched in journal text. */
export const HOME_PLACE_ID = 'home'

/** Matched in journal text; legs still start/end here. */
export const HOME_PLACE = {
  id: HOME_PLACE_ID,
  label: 'Home',
  aliases: ['home', 'back home'],
  region: 'home',
}

/** IRS-style mileage rate. */
export const MILE_RATE = 0.54

/**
 * Saved place nicknames only — no addresses or coordinates in code.
 * region: highlight color in trip/journal mirror only
 */
export const PLACES = [
  {
    id: 'drop-off',
    label: "H's drop off",
    aliases: [
      "H's drop off",
      "H\u2019s drop off",
      "h's drop off",
      'Hs drop off',
      'drop off',
      'drop-off',
    ],
    region: 'moraga',
  },
  {
    id: 'music',
    label: 'Lamorinda music',
    aliases: ['music', 'Lamorinda', 'Lamorinda Music'],
    region: 'lafayette',
  },
  {
    id: 'laf-library',
    label: 'Lafayette Library',
    aliases: ['Laf Library', 'Lafayette library', 'storytime', 'story time'],
    region: 'lafayette',
  },
  {
    id: 'commons',
    label: 'Commons',
    aliases: ['commons', 'Moraga Commons', 'Moraga commons'],
    region: 'moraga',
  },
  {
    id: 'hacienda',
    label: 'Hacienda de las Flores',
    aliases: ['Hacienda', 'las Flores', 'Hacienda de las Flores'],
    region: 'moraga',
  },
  {
    id: 'moraga-library',
    label: 'Moraga Library',
    aliases: ['Moraga library'],
    region: 'moraga',
  },
  {
    id: 'school',
    label: 'School',
    aliases: ['school'],
    region: 'moraga',
  },
  {
    id: 'store',
    label: 'Store',
    aliases: ['store', 'the store', 'grocery store', 'grocery'],
    region: 'moraga',
  },
]

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]))

/**
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

export function isFrequentPlaceNameOrAlias(text) {
  return findBuiltInPlaceByNameOrAlias(text) != null
}
