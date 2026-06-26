import { useMemo } from 'react'
import {
  formatWorldCupMatch,
  formatWorldCupWhen,
  upcomingWorldCupGames,
  worldCupGameAccent,
} from '../data/worldCup2026'
import { toISODateLocal } from '../utils/dates'

const REGION_LABEL = {
  usmnt: 'USMNT',
  'bay-area': 'Bay Area',
  tournament: 'Tournament',
  brazil: 'Brazil',
  argentina: 'Argentina',
}

export default function WorldCupGamesPanel() {
  const games = useMemo(() => upcomingWorldCupGames(toISODateLocal(new Date())), [])

  return (
    <section className="journal-panel events__section world-cup-panel" aria-label="World Cup 2026 games">
      <p className="world-cup-panel__intro muted">
        USMNT, Levi&apos;s Stadium, and tournament dates. Brazil and Argentina games are outlined.
        Times Pacific.
      </p>
      <ul className="events__list journal-panel__body">
        {games.length === 0 ? (
          <li className="events__item">
            <p className="events__item-title">No upcoming games</p>
            <p className="events__blurb muted">The 2026 World Cup schedule has wrapped.</p>
          </li>
        ) : (
          games.map((game) => {
            const accent = worldCupGameAccent(game)
            return (
              <li
                key={game.id}
                className={[
                  'events__item',
                  'world-cup-panel__item',
                  accent ? `world-cup-panel__item--${accent}` : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <p className="events__item-title">{formatWorldCupMatch(game)}</p>
                <p className="events__place muted">
                  {game.venue} · {game.city}
                </p>
                <p className="events__when">{formatWorldCupWhen(game)}</p>
                <p className="world-cup-panel__meta muted">
                  {REGION_LABEL[game.region] ?? game.region} · {game.stage} · {game.watch}
                </p>
                <p className="events__blurb muted">{game.blurb}</p>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
