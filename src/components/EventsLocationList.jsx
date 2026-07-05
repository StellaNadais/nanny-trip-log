/** Event ideas for one East Bay area — used inside Events popup. */
export default function EventsLocationList({ events }) {
  if (!events?.length) {
    return <p className="muted events__empty">No ideas listed for this area yet.</p>
  }

  return (
    <section className="events__section events__section--modal" aria-label="Local events">
      <ul className="events__list">
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
