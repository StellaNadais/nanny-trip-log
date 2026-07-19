import { EXTRA_CHILD_PER_HOUR, HOURLY_RATE, OVERNIGHT_RATE } from './bookingRates'

/**
 * Parent booking families.
 * Access screen shows nicknames; password = lastName + current year (no spaces).
 * URL slug is the nickname.
 *
 * @typedef {{
 *   slug: string,
 *   nickname: string,
 *   lastName: string,
 *   hourlyRate: number,
 *   extraChildPerHour: number,
 *   overnightRate: number,
 *   availabilityNote?: string,
 * }} BookFamily
 */

/** @type {BookFamily[]} */
export const BOOK_FAMILIES = [
  {
    slug: 'secretgarden',
    nickname: 'secretgarden',
    lastName: 'Smayo',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    slug: 'legos',
    nickname: 'legos',
    lastName: 'Tillman',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    slug: 'lava',
    nickname: 'lava',
    lastName: 'Tulloch',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    slug: 'octopus',
    nickname: 'octopus',
    lastName: 'Ruby',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    slug: 'rainbowvalley',
    nickname: 'rainbowvalley',
    lastName: 'Repka',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    slug: 'kansascity',
    nickname: 'kansascity',
    lastName: 'Nazworthy',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    slug: 'tytycyber',
    nickname: 'tytycyber',
    lastName: 'Almeida',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
]

export function getBookFamily(slug) {
  const key = String(slug || '')
    .trim()
    .toLowerCase()
  return BOOK_FAMILIES.find((f) => f.slug === key) || null
}

export function normalizeFamilyPassword(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

/** Password = last name + current calendar year (e.g. smayo2026). */
export function expectedFamilyPassword(family, year = new Date().getFullYear()) {
  return normalizeFamilyPassword(`${family.lastName}${year}`)
}

export function checkFamilyPassword(family, attempt, year = new Date().getFullYear()) {
  if (!family) return false
  return normalizeFamilyPassword(attempt) === expectedFamilyPassword(family, year)
}
