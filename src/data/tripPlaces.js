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
 * Portfolio-safe place nicknames only — no real client or venue names.
 * region: highlight color in trip/journal mirror only (internal key)
 */
export const PLACES = [
  {
    id: 'drop-off',
    label: 'School run',
    aliases: ['school run', 'pickup', 'pick-up', 'morning pickup'],
    region: 'moraga',
  },
  {
    id: 'music',
    label: 'Music',
    aliases: ['music', 'music class', 'music lesson', 'lessons'],
    region: 'lafayette',
  },
  {
    id: 'laf-library',
    label: 'Town library',
    aliases: ['town library', 'city library', 'library', 'storytime', 'story time'],
    region: 'lafayette',
  },
  {
    id: 'swim',
    label: 'Swim',
    aliases: ['swim', 'swim school', 'swim lessons', 'pool', 'aquatics'],
    region: 'lafayette',
  },
  {
    id: 'commons',
    label: 'Park',
    aliases: ['park', 'commons', 'town park', 'playground'],
    region: 'moraga',
  },
  {
    id: 'hacienda',
    label: 'Garden',
    aliases: ['garden', 'community garden', 'gardens'],
    region: 'moraga',
  },
  {
    id: 'moraga-library',
    label: 'Branch library',
    aliases: ['branch library', 'neighborhood library'],
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
