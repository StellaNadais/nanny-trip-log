/** Event ideas for one East Bay area — board list or popup list. */
export default function EventsLocationList({ events, variant = 'modal' }) {
  if (!events?.length) {
    return <p className="muted events__empty">No ideas listed for this area yet.</p>
  }

  const sectionClass =
    variant === 'board' ? 'events__section events__section--board' : 'events__section events__section--modal'

  const listClass = variant === 'modal' ? 'events__list events__list--flush' : 'events__list'

  return (
    <section className={sectionClass} aria-label="Local events">
      <ul className={listClass}>
        {events.map((ev) => (
          <li key={ev.id} className="events__item">
            <p className="events__item-title">{ev.title}</p>
            <p className="events__place muted">{ev.place}</p>
            <p className="events__when">{ev.when}</p>
            <p className="events__blurb muted">{ev.blurb}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
