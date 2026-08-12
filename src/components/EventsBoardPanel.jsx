import { useMemo, useState } from 'react'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { formatWorldCupMatch, upcomingWorldCupGames } from '../data/worldCup2026'
import { toISODateLocal } from '../utils/dates'
import EventsPanelModal from './EventsPanelModal'

const LOCATION_META = {
  moraga: { eyebrow: 'East Bay', hint: 'Moraga outings — tap for the full list.' },
  lafayette: { eyebrow: 'East Bay', hint: 'Lafayette outings — tap for the full list.' },
  oakland: { eyebrow: 'East Bay', hint: 'Oakland outings — tap for the full list.' },
}

function locationPreview(events) {
  if (!events?.length) return ''
  const lead = events[0]?.title ?? ''
  return events.length > 1 ? `${events.length} ideas · ${lead}` : lead
}

/** Events tab — list of areas; full list opens in popup. */
export default function EventsBoardPanel() {
  const [openPanel, setOpenPanel] = useState(null)
  const byLocation = useMemo(() => groupFamilyEventsByLocation(), [])
  const worldCupGames = useMemo(() => upcomingWorldCupGames(toISODateLocal(new Date())), [])

  const worldCupPreview = worldCupGames.length
    ? formatWorldCupMatch(worldCupGames[0])
    : 'No upcoming games'

  return (
    <>
      <div className="events-board" aria-labelledby="events-board-heading">
        <header className="events-board__intro">
          <p className="events-board__eyebrow">East Bay & beyond</p>
          <h2 id="events-board-heading" className="events-board__title">
            Local events
          </h2>
          <p className="events-board__lede muted">
            Tap an area for ideas — confirm dates and hours with each place.
          </p>
        </header>

        <ul className="events-board-list">
          {EVENT_LOCATIONS.map(({ id, label }) => {
            const meta = LOCATION_META[id] ?? { eyebrow: 'East Bay', hint: 'Tap for the full list.' }
            const count = byLocation[id]?.length ?? 0
            const preview = locationPreview(byLocation[id])

            return (
              <li key={id} className="events-board-list__item">
                <button
                  type="button"
                  className="events-board-list__row"
                  onClick={() => setOpenPanel(id)}
                  aria-labelledby={`events-area-${id}`}
                >
                  <div className="events-board-list__head">
                    <span className="events-board-list__icon" aria-hidden>
                      ◎
                    </span>
                    <strong id={`events-area-${id}`} className="events-board-list__title">
                      {label}
                    </strong>
                    <span className="events-board-list__eyebrow muted">{meta.eyebrow}</span>
                    {count > 0 ? (
                      <span className="events-board-list__count" aria-hidden>
                        {count}
                      </span>
                    ) : null}
                  </div>
                  <p className="events-board-list__preview muted">
                    {preview || meta.hint}
                  </p>
                  <span className="events-board-list__cta">Open list →</span>
                </button>
              </li>
            )
          })}

          <li className="events-board-list__item">
            <button
              type="button"
              className="events-board-list__row events-board-list__row--world-cup"
              onClick={() => setOpenPanel('world-cup')}
              aria-labelledby="events-area-world-cup"
            >
              <div className="events-board-list__head">
                <span className="events-board-list__icon" aria-hidden>
                  ★
                </span>
                <strong id="events-area-world-cup" className="events-board-list__title">
                  World Cup
                </strong>
                <span className="events-board-list__eyebrow muted">FIFA 2026</span>
                {worldCupGames.length > 0 ? (
                  <span className="events-board-list__count" aria-hidden>
                    {worldCupGames.length}
                  </span>
                ) : null}
              </div>
              <p className="events-board-list__preview muted">{worldCupPreview}</p>
              <span className="events-board-list__cta">Open list →</span>
            </button>
          </li>
        </ul>

        <p className="events-board__footnote muted">
          Venue details can change — double-check before you go.
        </p>
      </div>

      <EventsPanelModal
        open={openPanel != null}
        onClose={() => setOpenPanel(null)}
        panel={openPanel}
        byLocation={byLocation}
      />
    </>
  )
}
