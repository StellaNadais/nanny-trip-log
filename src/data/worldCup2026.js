/**
 * FIFA World Cup 2026 — USMNT + Bay Area (Levi's) fixtures.
 * Times Pacific; confirm broadcast details before game day.
 *
 * @typedef {{
 *   id: string
 *   dateISO: string
 *   timePT: string
 *   teamA: string
 *   teamB: string
 *   venue: string
 *   city: string
 *   stage: string
 *   region: 'usmnt' | 'bay-area' | 'tournament' | 'brazil' | 'argentina'
 *   watch: string
 *   blurb: string
 *   score?: string
 * }} WorldCupGame
 */

/** @type {WorldCupGame[]} */
export const WORLD_CUP_2026_GAMES = [
  {
    id: 'wc-usa-paraguay',
    dateISO: '2026-06-12',
    timePT: '6:00 PM',
    teamA: 'USA',
    teamB: 'Paraguay',
    venue: 'SoFi Stadium',
    city: 'Inglewood, CA',
    stage: 'Group D',
    region: 'usmnt',
    watch: 'FOX / Telemundo',
    blurb: 'USMNT tournament opener — co-hosts kick off at home.',
    score: '4–1 USA',
  },
  {
    id: 'wc-brazil-morocco',
    dateISO: '2026-06-14',
    timePT: '2:00 PM',
    teamA: 'Brazil',
    teamB: 'Morocco',
    venue: 'NRG Stadium',
    city: 'Houston, TX',
    stage: 'Group C',
    region: 'brazil',
    watch: 'FOX / Telemundo',
    blurb: 'Brazil group opener — Seleção favored to control possession.',
  },
  {
    id: 'wc-argentina-algeria',
    dateISO: '2026-06-15',
    timePT: '5:00 PM',
    teamA: 'Argentina',
    teamB: 'Algeria',
    venue: 'Hard Rock Stadium',
    city: 'Miami, FL',
    stage: 'Group J',
    region: 'argentina',
    watch: 'FOX / Telemundo',
    blurb: 'Argentina tournament opener — late afternoon East Coast kickoff.',
  },
  {
    id: 'wc-qatar-switzerland',
    dateISO: '2026-06-13',
    timePT: '12:00 PM',
    teamA: 'Qatar',
    teamB: 'Switzerland',
    venue: 'SF Bay Area Stadium',
    city: 'Santa Clara, CA',
    stage: 'Group B',
    region: 'bay-area',
    watch: 'FOX / Telemundo',
    blurb: 'Local group-stage match at Levi\'s Stadium.',
  },
  {
    id: 'wc-austria-jordan',
    dateISO: '2026-06-16',
    timePT: '9:00 PM',
    teamA: 'Austria',
    teamB: 'Jordan',
    venue: 'SF Bay Area Stadium',
    city: 'Santa Clara, CA',
    stage: 'Group J',
    region: 'bay-area',
    watch: 'FS1 / Telemundo',
    blurb: 'Evening kickoff in the South Bay.',
  },
  {
    id: 'wc-brazil-scotland',
    dateISO: '2026-06-20',
    timePT: '3:00 PM',
    teamA: 'Brazil',
    teamB: 'Scotland',
    venue: 'Rose Bowl',
    city: 'Pasadena, CA',
    stage: 'Group C',
    region: 'brazil',
    watch: 'FOX / Telemundo',
    blurb: 'Brazil second group match — afternoon watch party on the West Coast.',
  },
  {
    id: 'wc-argentina-austria',
    dateISO: '2026-06-21',
    timePT: '12:00 PM',
    teamA: 'Argentina',
    teamB: 'Austria',
    venue: 'Gillette Stadium',
    city: 'Foxborough, MA',
    stage: 'Group J',
    region: 'argentina',
    watch: 'FOX / Telemundo',
    blurb: 'Argentina midday kickoff — defending champs look to stay on top of the group.',
  },
  {
    id: 'wc-usa-australia',
    dateISO: '2026-06-19',
    timePT: '12:00 PM',
    teamA: 'USA',
    teamB: 'Australia',
    venue: 'Lumen Field',
    city: 'Seattle, WA',
    stage: 'Group D',
    region: 'usmnt',
    watch: 'FOX / Telemundo',
    blurb: 'USMNT second group match — afternoon West Coast watch party.',
  },
  {
    id: 'wc-turkey-paraguay',
    dateISO: '2026-06-19',
    timePT: '9:00 PM',
    teamA: 'Türkiye',
    teamB: 'Paraguay',
    venue: 'SF Bay Area Stadium',
    city: 'Santa Clara, CA',
    stage: 'Group D',
    region: 'bay-area',
    watch: 'FS1 / Telemundo',
    blurb: 'Same night as USMNT — plan around traffic near Levi\'s.',
  },
  {
    id: 'wc-jordan-algeria',
    dateISO: '2026-06-22',
    timePT: '8:00 PM',
    teamA: 'Jordan',
    teamB: 'Algeria',
    venue: 'SF Bay Area Stadium',
    city: 'Santa Clara, CA',
    stage: 'Group J',
    region: 'bay-area',
    watch: 'FS1 / Telemundo',
    blurb: 'Monday night match in Santa Clara.',
  },
  {
    id: 'wc-brazil-haiti',
    dateISO: '2026-06-26',
    timePT: '5:00 PM',
    teamA: 'Brazil',
    teamB: 'Haiti',
    venue: 'SF Bay Area Stadium',
    city: 'Santa Clara, CA',
    stage: 'Group C',
    region: 'brazil',
    watch: 'FOX / Telemundo',
    blurb: 'Brazil closes the group at Levi\'s — Bay Area watch if you can\'t be there.',
  },
  {
    id: 'wc-argentina-jordan',
    dateISO: '2026-06-27',
    timePT: '2:00 PM',
    teamA: 'Argentina',
    teamB: 'Jordan',
    venue: 'Lumen Field',
    city: 'Seattle, WA',
    stage: 'Group J',
    region: 'argentina',
    watch: 'FOX / Telemundo',
    blurb: 'Argentina final group game — Pacific time friendly for West Coast viewing.',
  },
  {
    id: 'wc-paraguay-australia',
    dateISO: '2026-06-25',
    timePT: '7:00 PM',
    teamA: 'Paraguay',
    teamB: 'Australia',
    venue: 'SF Bay Area Stadium',
    city: 'Santa Clara, CA',
    stage: 'Group D',
    region: 'bay-area',
    watch: 'FS1 / Telemundo',
    blurb: 'Final group-stage game at Levi\'s this month.',
  },
  {
    id: 'wc-turkey-usa',
    dateISO: '2026-06-25',
    timePT: '7:00 PM',
    teamA: 'Türkiye',
    teamB: 'USA',
    venue: 'SoFi Stadium',
    city: 'Inglewood, CA',
    stage: 'Group D',
    region: 'usmnt',
    watch: 'FOX / Telemundo',
    blurb: 'USMNT closes the group stage in Los Angeles.',
  },
  {
    id: 'wc-r32-bay-area',
    dateISO: '2026-07-01',
    timePT: '5:00 PM',
    teamA: 'TBD',
    teamB: 'TBD',
    venue: 'SF Bay Area Stadium',
    city: 'Santa Clara, CA',
    stage: 'Round of 32',
    region: 'bay-area',
    watch: 'FOX / Telemundo',
    blurb: 'Knockout round at Levi\'s — USMNT may play here if they win Group D.',
  },
  {
    id: 'wc-third-place',
    dateISO: '2026-07-18',
    timePT: '2:00 PM',
    teamA: 'TBD',
    teamB: 'TBD',
    venue: 'Hard Rock Stadium',
    city: 'Miami, FL',
    stage: 'Third-place match',
    region: 'tournament',
    watch: 'FOX / Telemundo',
    blurb: 'Bronze medal match.',
  },
  {
    id: 'wc-final',
    dateISO: '2026-07-19',
    timePT: '12:00 PM',
    teamA: 'TBD',
    teamB: 'TBD',
    venue: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    stage: 'Final',
    region: 'tournament',
    watch: 'FOX / Telemundo',
    blurb: 'World Cup final — noon East Coast / 9:00 AM Pacific.',
  },
]

export function formatWorldCupMatch(game) {
  const teams = `${game.teamA} vs ${game.teamB}`
  return game.score ? `${teams} (${game.score})` : teams
}

export function formatWorldCupWhen(game) {
  const date = new Date(`${game.dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${date} · ${game.timePT} PT`
}

/** @returns {'brazil' | 'argentina' | null} */
export function worldCupGameAccent(game) {
  const teams = [game.teamA, game.teamB]
  if (teams.includes('Brazil')) return 'brazil'
  if (teams.includes('Argentina')) return 'argentina'
  return null
}

/** @param {string} [fromISO] */
export function upcomingWorldCupGames(fromISO) {
  const floor = fromISO ?? new Date().toISOString().slice(0, 10)
  return WORLD_CUP_2026_GAMES.filter((g) => g.dateISO >= floor).sort((a, b) => {
    const d = a.dateISO.localeCompare(b.dateISO)
    if (d !== 0) return d
    return a.timePT.localeCompare(b.timePT)
  })
}

/** @param {'Brazil' | 'Argentina'} team @param {string} [fromISO] */
export function upcomingWorldCupGamesForTeam(team, fromISO) {
  const floor = fromISO ?? new Date().toISOString().slice(0, 10)
  return WORLD_CUP_2026_GAMES.filter(
    (g) => g.dateISO >= floor && (g.teamA === team || g.teamB === team)
  ).sort((a, b) => {
    const d = a.dateISO.localeCompare(b.dateISO)
    if (d !== 0) return d
    return a.timePT.localeCompare(b.timePT)
  })
}

/** @param {string} dateISO */
export function worldCupGamesOnDate(dateISO) {
  return WORLD_CUP_2026_GAMES.filter((g) => g.dateISO === dateISO).sort((a, b) =>
    a.timePT.localeCompare(b.timePT)
  )
}
