import { useMemo } from 'react'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'
import ToolWorkspaceHead from '../components/ToolWorkspaceHead'
import { useJournalDaySky } from '../hooks/useJournalDaySky'
import { toISODateLocal } from '../utils/dates'

const LOCATION_PANEL_CLASS = {
  moraga: 'journal-panel--about',
  lafayette: 'journal-panel--meals',
  oakland: 'journal-panel--nap',
}

export default function EventsPage() {
  const byLocation = useMemo(() => groupFamilyEventsByLocation(), [])
  const daySky = useJournalDaySky(toISODateLocal(new Date()))

  return (
    <div
      className="page page--events page--kid-journal work-ui"
      style={daySky.style}
      data-sky-phase={daySky.label}
    >
      <ToolWorkspaceHead
        eyebrow="Events workspace"
        title="Events"
        lede="Family-friendly ideas by area. Times and fees change — confirm with each venue before you go."
      />

      <div className="journal__layout events__layout">
        <p className="journal__sky-phase events__sky-phase" aria-live="polite">
          {daySky.label}
        </p>

        <div className="events__sections">
          {EVENT_LOCATIONS.map(({ id, label }) => (
            <section
              key={id}
              className={`journal-panel events__section ${LOCATION_PANEL_CLASS[id] ?? ''}`}
              aria-labelledby={`events-loc-${id}`}
            >
              <div className="journal-mood-bar__head">
                <h2 id={`events-loc-${id}`} className="journal-mood-bar__title events__loc-title">
                  {label}
                </h2>
              </div>
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
          ))}
        </div>
      </div>
    </div>
  )
}
