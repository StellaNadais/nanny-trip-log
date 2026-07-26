function formatVisitDate(dateISO) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function BookingToys({ booking }) {
  return (
    <ul className="schedule-bring-along__toys">
      {booking.bringAlong.map((toy, index) => (
        <li key={`${booking.id}-${toy}-${index}`}>{toy}</li>
      ))}
    </ul>
  )
}

export default function ScheduleBringAlongTile({ bookings }) {
  const [nextBooking, ...laterBookings] = bookings

  if (!nextBooking) {
    return (
      <section className="schedule-bring-along schedule-bring-along--empty" aria-label="Bring with me">
        <p className="schedule-bring-along__eyebrow">Family rentals</p>
        <p className="schedule-bring-along__empty">
          No rented toys to bring to an upcoming visit yet.
        </p>
      </section>
    )
  }

  return (
    <section className="schedule-bring-along" aria-label="Bring with me">
      <p className="schedule-bring-along__eyebrow">Next visit · {formatVisitDate(nextBooking.dateISO)}</p>
      <div className="schedule-bring-along__visit">
        <p className="schedule-bring-along__family">
          {nextBooking.familyName || 'Family'}
          {nextBooking.responseStatus === 'accepted' ? (
            <span className="schedule-bring-along__status">Confirmed</span>
          ) : null}
        </p>
        <BookingToys booking={nextBooking} />
      </div>

      {laterBookings.length ? (
        <div className="schedule-bring-along__later">
          <p>Also rented for later visits</p>
          {laterBookings.slice(0, 2).map((booking) => (
            <div className="schedule-bring-along__later-visit" key={booking.id}>
              <span>
                {formatVisitDate(booking.dateISO)} · {booking.familyName || 'Family'}
              </span>
              <BookingToys booking={booking} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
