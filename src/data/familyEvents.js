/**
 * Family-friendly outing ideas by area (East Bay).
 * Confirm dates, hours, and fees with each venue — this list does not update live.
 */

export const FAMILY_EVENTS = [
  // Moraga
  {
    id: 'mg-1',
    location: 'moraga',
    title: 'Story time & kids’ programs',
    place: 'Moraga Library',
    when: 'Often weekday mornings — check CCCL calendar',
    blurb: 'Free library story times, crafts, and seasonal reading events for toddlers and school age.',
  },
  {
    id: 'mg-2',
    location: 'moraga',
    title: 'Playground & open field',
    place: 'Moraga Commons Park',
    when: 'Daily, daylight hours',
    blurb: 'Play structures, grass, picnic spots — easy stroller outing.',
  },
  {
    id: 'mg-3',
    location: 'moraga',
    title: 'Movies & matinees',
    place: 'Rheem Theatre',
    when: 'Varies — check showtimes',
    blurb: 'Occasional family titles or matinees; good for a rainy-day outing with older kids.',
  },
  {
    id: 'mg-4',
    location: 'moraga',
    title: 'Local trails (easy)',
    place: 'Shell Ridge / nearby Moraga trails',
    when: 'Weather permitting',
    blurb: 'Short hikes with carriers or sturdy walkers; bring water and sun protection.',
  },
  // Oakland
  {
    id: 'ok-1',
    location: 'oakland',
    title: 'Children’s Fairyland',
    place: 'Lake Merritt',
    when: 'Typically Thu–Sun + seasonal — check site',
    blurb: 'Storybook sets, gentle rides, puppet shows — aimed at younger children.',
  },
  {
    id: 'ok-2',
    location: 'oakland',
    title: 'Oakland Museum of California (OMCA)',
    place: 'Oakland',
    when: 'Family Sundays & drop-ins — see museum calendar',
    blurb: 'Hands-on art and culture activities; good for mixed ages with adult help.',
  },
  {
    id: 'ok-3',
    location: 'oakland',
    title: 'Story time & literacy events',
    place: 'Oakland Public Library (Main + branches)',
    when: 'Weekly slots — check OPL calendar',
    blurb: 'Free story times, bilingual options at some branches.',
  },
  {
    id: 'ok-4',
    location: 'oakland',
    title: 'Lake Merritt & gardens',
    place: 'Lakeside Park / Rotary Nature Center',
    when: 'Daily',
    blurb: 'Walk the path, birds and turtles, short nature center visits; stroller-friendly loops.',
  },
  {
    id: 'ok-5',
    location: 'oakland',
    title: 'Redwood Regional Park (easy trails)',
    place: 'Oakland hills',
    when: 'Daylight hours',
    blurb: 'Shaded short trails; best with carrier or kids who can handle uneven ground.',
  },
  // Lafayette
  {
    id: 'lf-1',
    location: 'lafayette',
    title: 'Story time & kids’ programs',
    place: 'Lafayette Library',
    when: 'Often weekday mornings — check CCCL calendar',
    blurb: 'Free story times, crafts, and seasonal reading events; easy pairing with a downtown walk.',
  },
  {
    id: 'lf-2',
    location: 'lafayette',
    title: 'Music classes & recitals',
    place: 'Lamorinda Music (and nearby studios)',
    when: 'Weekly lessons; recitals on select weekends',
    blurb: 'Group classes, recitals, and drop-in events — confirm schedule with the studio.',
  },
  {
    id: 'lf-3',
    location: 'lafayette',
    title: 'Reservoir loop walk',
    place: 'Lafayette Reservoir',
    when: 'Daily, daylight hours',
    blurb: 'Paved loop, ducks and views — stroller-friendly; dogs on leash in allowed areas.',
  },
  {
    id: 'lf-4',
    location: 'lafayette',
    title: 'Playground & picnic',
    place: 'Lafayette Community Park',
    when: 'Daily',
    blurb: 'Play structures, grass, and picnic tables — good short outing between naps.',
  },
  {
    id: 'lf-5',
    location: 'lafayette',
    title: 'Family shows & matinees',
    place: 'Town Hall Theatre',
    when: 'Seasonal — check box office calendar',
    blurb: 'Occasional family-friendly plays and school-break shows; best for school age with an adult.',
  },
]

export const EVENT_LOCATIONS = [
  { id: 'moraga', label: 'Moraga' },
  { id: 'lafayette', label: 'Lafayette' },
  { id: 'oakland', label: 'Oakland' },
]

/** @returns {Record<string, typeof FAMILY_EVENTS>} */
export function groupFamilyEventsByLocation() {
  const map = Object.fromEntries(EVENT_LOCATIONS.map((loc) => [loc.id, []]))
  for (const e of FAMILY_EVENTS) {
    if (map[e.location]) map[e.location].push(e)
  }
  return map
}
