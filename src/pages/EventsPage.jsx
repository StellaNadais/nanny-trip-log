import { useMemo } from 'react'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'

export default function EventsPage() {
  const byLocation = useMemo(() => groupFamilyEventsByLocation(), [])

  return (
    <div className="page page--events work-ui">
      <ToolWorkspaceHead
        eyebrow="Events workspace"
        title="Events"
        lede="Family-friendly ideas by area. Times and fees change — confirm with each venue before you go."
      />

      <div className="events__sections">
        {EVENT_LOCATIONS.map(({ id, label }) => (
          <section key={id} className="events__section work-ui__panel" aria-labelledby={`events-loc-${id}`}>
            <h2 id={`events-loc-${id}`} className="events__loc-title">
              {label}
            </h2>
            <ul className="events__list">
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
        ))}
      </div>
    </div>
  )
}
