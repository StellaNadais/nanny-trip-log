/**
 * Family-friendly outing ideas by demo area (portfolio-safe fictional places).
 * Confirm dates, hours, and fees with each venue in a real deployment.
 */

export const FAMILY_EVENTS = [
  // Cedar Grove (id: moraga — kept for routing/CSS)
  {
    id: 'mg-1',
    location: 'moraga',
    title: 'Story time & kids’ programs',
    place: 'Cedar Grove Library',
    when: 'Often weekday mornings — check the library calendar',
    blurb: 'Free library story times, crafts, and seasonal reading events for toddlers and school age.',
  },
  {
    id: 'mg-2',
    location: 'moraga',
    title: 'Playground & open field',
    place: 'Cedar Grove Commons',
    when: 'Daily, daylight hours',
    blurb: 'Play structures, grass, picnic spots — easy stroller outing.',
  },
  {
    id: 'mg-3',
    location: 'moraga',
    title: 'Movies & matinees',
    place: 'Town Cinema',
    when: 'Varies — check showtimes',
    blurb: 'Occasional family titles or matinees; good for a rainy-day outing with older kids.',
  },
  {
    id: 'mg-4',
    location: 'moraga',
    title: 'Local trails (easy)',
    place: 'Ridge Loop trails',
    when: 'Weather permitting',
    blurb: 'Short hikes with carriers or sturdy walkers; bring water and sun protection.',
  },
  // Bayfront (id: oakland)
  {
    id: 'ok-1',
    location: 'oakland',
    title: 'Storybook park',
    place: 'Lakeside Park',
    when: 'Typically Thu–Sun + seasonal — check site',
    blurb: 'Storybook sets, gentle rides, puppet shows — aimed at younger children.',
  },
  {
    id: 'ok-2',
    location: 'oakland',
    title: 'City museum family day',
    place: 'Bayfront Museum',
    when: 'Family Sundays & drop-ins — see museum calendar',
    blurb: 'Hands-on art and culture activities; good for mixed ages with adult help.',
  },
  {
    id: 'ok-3',
    location: 'oakland',
    title: 'Story time & literacy events',
    place: 'Bayfront Public Library',
    when: 'Weekly slots — check library calendar',
    blurb: 'Free story times, bilingual options at some branches.',
  },
  {
    id: 'ok-4',
    location: 'oakland',
    title: 'Lake path & gardens',
    place: 'Lakeside Nature Center',
    when: 'Daily',
    blurb: 'Walk the path, birds and turtles, short nature center visits; stroller-friendly loops.',
  },
  {
    id: 'ok-5',
    location: 'oakland',
    title: 'Easy shaded trails',
    place: 'Bayfront hills',
    when: 'Daylight hours',
    blurb: 'Shaded short trails; best with carrier or kids who can handle uneven ground.',
  },
  // Riverview (id: lafayette)
  {
    id: 'lf-1',
    location: 'lafayette',
    title: 'Story time & kids’ programs',
    place: 'Riverview Library',
    when: 'Often weekday mornings — check the library calendar',
    blurb: 'Free story times, crafts, and seasonal reading events; easy pairing with a downtown walk.',
  },
  {
    id: 'lf-2',
    location: 'lafayette',
    title: 'Music classes & recitals',
    place: 'Riverview Music Studio',
    when: 'Weekly lessons; recitals on select weekends',
    blurb: 'Group classes, recitals, and drop-in events — confirm schedule with the studio.',
  },
  {
    id: 'lf-3',
    location: 'lafayette',
    title: 'Reservoir loop walk',
    place: 'Riverview Reservoir',
    when: 'Daily, daylight hours',
    blurb: 'Paved loop, ducks and views — stroller-friendly; dogs on leash in allowed areas.',
  },
  {
    id: 'lf-4',
    location: 'lafayette',
    title: 'Playground & picnic',
    place: 'Riverview Community Park',
    when: 'Daily',
    blurb: 'Play structures, grass, and picnic tables — good short outing between naps.',
  },
  {
    id: 'lf-5',
    location: 'lafayette',
    title: 'Family shows & matinees',
    place: 'Community Theatre',
    when: 'Seasonal — check box office calendar',
    blurb: 'Occasional family-friendly plays and school-break shows; best for school age with an adult.',
  },
]

export const EVENT_LOCATIONS = [
  { id: 'moraga', label: 'Cedar Grove' },
  { id: 'lafayette', label: 'Riverview' },
  { id: 'oakland', label: 'Bayfront' },
]

/** @returns {Record<string, typeof FAMILY_EVENTS>} */
export function groupFamilyEventsByLocation() {
  const map = Object.fromEntries(EVENT_LOCATIONS.map((loc) => [loc.id, []]))
  for (const e of FAMILY_EVENTS) {
    if (map[e.location]) map[e.location].push(e)
  }
  return map
}
