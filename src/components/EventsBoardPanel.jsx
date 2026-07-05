import { useMemo, useState } from 'react'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import { formatWorldCupMatch, upcomingWorldCupGames } from '../data/worldCup2026'
import { todayTileAccent } from '../data/todayTileTypes'
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

/** Events tab — clickable boxes per area; full list opens in popup. */
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
            Tap a box for ideas by area — confirm dates and hours with each place.
          </p>
        </header>

        <div className="events-board__grid events-board__grid--areas">
          {EVENT_LOCATIONS.map(({ id, label }, index) => {
            const meta = LOCATION_META[id] ?? { eyebrow: 'East Bay', hint: 'Tap for the full list.' }
            const accent = todayTileAccent(index)
            const count = byLocation[id]?.length ?? 0
            const preview = locationPreview(byLocation[id])

            return (
              <button
                key={id}
                type="button"
                className={`events-box-tile soft-panel soft-panel--events-box soft-panel--events-box--${accent}`}
                onClick={() => setOpenPanel(id)}
                aria-labelledby={`events-box-${id}`}
              >
                <div className="soft-panel__hero soft-panel__hero--compact">
                  <p className="soft-panel__eyebrow">{meta.eyebrow}</p>
                  <div className="events-box__head">
                    <h3 id={`events-box-${id}`} className="soft-panel__title">
                      {label}
                    </h3>
                    {count > 0 ? (
                      <span className="events-box__count" aria-hidden>
                        {count}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="events-box-tile__body">
                  <p className="events-box-tile__preview">
                    {preview || <span className="muted">{meta.hint}</span>}
                  </p>
                  <span className="events-box-tile__cta">Open list →</span>
                </div>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="events-box-tile soft-panel soft-panel--events-box soft-panel--events-box--world-cup"
          onClick={() => setOpenPanel('world-cup')}
          aria-labelledby="events-box-world-cup"
        >
          <div className="soft-panel__hero soft-panel__hero--compact">
            <p className="soft-panel__eyebrow">FIFA 2026</p>
            <div className="events-box__head">
              <h3 id="events-box-world-cup" className="soft-panel__title">
                World Cup
              </h3>
              {worldCupGames.length > 0 ? (
                <span className="events-box__count" aria-hidden>
                  {worldCupGames.length}
                </span>
              ) : null}
            </div>
          </div>
          <div className="events-box-tile__body">
            <p className="events-box-tile__preview">{worldCupPreview}</p>
            <span className="events-box-tile__cta">Open list →</span>
          </div>
        </button>

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
