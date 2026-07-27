import { EXTRA_CHILD_PER_HOUR, HOURLY_RATE, OVERNIGHT_RATE } from './bookingRates'

/**
 * Parent booking families.
 * An invitation URL is the only way into a family booking portal.
 *
 * @typedef {{
 *   inviteToken: string,
 *   nickname: string,
 *   lastName: string,
 *   lastNamePlural: string,
 *   hourlyRate: number,
 *   extraChildPerHour: number,
 *   overnightRate: number,
 *   availabilityNote?: string,
 * }} BookFamily
 */

/** @type {BookFamily[]} */
export const BOOK_FAMILIES = [
  {
    inviteToken: 'q7m2k9v4s8p1',
    nickname: 'secretgarden',
    lastName: 'Smayo',
    lastNamePlural: 'Smayos',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    inviteToken: 'r4x8n2c6w9d3',
    nickname: 'legos',
    lastName: 'Tillman',
    lastNamePlural: 'Tillmans',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    inviteToken: 'b9k3f7v1m6q2',
    nickname: 'lava',
    lastName: 'Tulloch',
    lastNamePlural: 'Tullochs',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    inviteToken: 'h6v1p8z4r2n7',
    nickname: 'octopus',
    lastName: 'Ruby',
    lastNamePlural: 'Rubys',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    inviteToken: 'c2h7w5k9m4x8',
    nickname: 'rainbowvalley',
    lastName: 'Repka',
    lastNamePlural: 'Repkas',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    inviteToken: 'd8w5q3v7p1r6',
    nickname: 'kansascity',
    lastName: 'Nazworthy',
    lastNamePlural: 'Nazworthys',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    inviteToken: 'j3f9n6x2k8v4',
    nickname: 'tytycyber',
    lastName: 'Almeida',
    lastNamePlural: 'Almeidas',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
  {
    inviteToken: 'p5z4m7q1w8h2',
    nickname: 'novastella',
    lastName: 'Nadais',
    lastNamePlural: 'Nadaises',
    hourlyRate: HOURLY_RATE,
    extraChildPerHour: EXTRA_CHILD_PER_HOUR,
    overnightRate: OVERNIGHT_RATE,
    availabilityNote: 'Request dates on the calendar — I’ll confirm what works.',
  },
]

export function getBookFamilyByInviteToken(inviteToken) {
  const key = String(inviteToken || '')
    .trim()
    .toLowerCase()
  return BOOK_FAMILIES.find((family) => family.inviteToken === key) || null
}
