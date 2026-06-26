import { useMemo } from 'react'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import WorldCupGamesPanel from '../components/WorldCupGamesPanel'
import WorkspaceTileBoard from '../components/WorkspaceTileBoard'

export default function EventsPage() {
  const byLocation = useMemo(() => groupFamilyEventsByLocation(), [])

  return (
    <div className="page page--events page--workspace work-ui">

      <div className="journal__layout events__layout">
        <WorkspaceTileBoard
          workspaceId="events"
          tiles={[
            {
              id: 'world-cup',
              label: 'World Cup',
              children: <WorldCupGamesPanel />,
            },
            ...EVENT_LOCATIONS.map(({ id, label }) => ({
              id,
              label,
              children: (
                <section className="journal-panel events__section" aria-labelledby={`events-loc-${id}`}>
                  <ul className="events__list journal-panel__body">
                    {byLocation[id]?.map((ev) => (
                      <li key={ev.id} className="events__item">
                        <p className="events__item-title">{ev.title}</p>
                        <p className="events__place muted">{ev.place}</p>
                        <p className="events__when">{ev.when}</p>
                        <p className="events__blurb muted">{ev.blurb}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ),
            })),
          ]}
        />
      </div>
    </div>
  )
}
