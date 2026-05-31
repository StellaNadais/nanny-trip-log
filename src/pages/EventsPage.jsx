import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EVENT_LOCATIONS, groupFamilyEventsByLocation } from '../data/familyEvents'

export default function EventsPage() {
  const byLocation = useMemo(() => groupFamilyEventsByLocation(), [])

  return (
    <div className="page page--events">
      <header className="events__head">
        <Link to="/hub" className="page-back page-back--ghost">
          ← Hub
        </Link>
        <h1 className="events__title">
          Events <span className="placeholder__code">(D)</span>
        </h1>
        <p className="muted events__lede">
          Family-friendly ideas by area. Times and fees change — confirm with each venue before you go.
        </p>
      </header>

      <div className="events__sections">
        {EVENT_LOCATIONS.map(({ id, label }) => (
          <section key={id} className="events__section" aria-labelledby={`events-loc-${id}`}>
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
