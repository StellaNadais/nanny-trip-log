import { formatCareBookingWindow } from '../utils/bookingRange'
import { formatBookingChildrenLabel } from '../utils/bookingChildren'

function gigResponseStatus(booking) {
  if (booking.responseStatus === 'accepted' || booking.responseStatus === 'declined') {
    return booking.responseStatus
  }
  return 'pending'
}

function formatGigDate(dateISO) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function gigMetaLine(gig) {
  return [formatCareBookingWindow(gig), formatBookingChildrenLabel(gig)].filter(Boolean).join(' · ')
}

function statusLabel(status) {
  if (status === 'accepted') return 'Confirmed'
  if (status === 'declined') return 'Declined'
  return 'Pending'
}

export default function ScheduleOverviewRequestList({
  upcoming,
  onAccept,
  onDecline,
  onUndoDecline,
  onDelete,
  compact = false,
  board = false,
}) {
  if (!upcoming.length) {
    return (
      <p className={board ? 'schedule-board-tile__empty muted' : 'soft-panel__empty muted'}>
        No requested dates yet. Share your parent booking link when you’re ready.
      </p>
    )
  }

  const listClass = board
    ? 'workspace-board-list workspace-board-list--flush schedule-overview-request-list'
    : 'thanks__list thanks__list--flush schedule-overview-request-list'
  const itemClass = board ? 'workspace-board-list__item schedule-overview-request' : 'thanks__item schedule-overview-request'
  const headClass = board
    ? 'workspace-board-list__head schedule-overview-request__head'
    : 'thanks__item-head schedule-overview-request__head'
  const titleClass = board ? 'workspace-board-list__title' : 'thanks__item-title'
  const noteClass = board ? 'workspace-board-list__note muted' : 'thanks__item-note muted'

  return (
    <ul className={listClass}>
      {upcoming.map((gig) => {
        const status = gigResponseStatus(gig)
        const meta = gigMetaLine(gig)

        return (
          <li key={gig.id} className={itemClass}>
            <div className={headClass}>
              <strong className={titleClass}>{gig.familyName || 'Family'}</strong>
              <time className="schedule-overview-request__date muted" dateTime={gig.dateISO}>
                {formatGigDate(gig.dateISO)}
              </time>
              {!compact ? (
                <span
                  className={`schedule-overview-request__status schedule-overview-request__status--${status}`}
                >
                  {statusLabel(status)}
                </span>
              ) : null}
            </div>

            {gig.contact ? <p className={noteClass}>{gig.contact}</p> : null}
            {meta ? <p className={noteClass}>{meta}</p> : null}
            {gig.notes && !compact ? (
              <p className="schedule-overview-request__notes">{gig.notes}</p>
            ) : null}

            {!compact ? (
              <div className="schedule-overview-request__actions">
                {status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn--primary schedule-overview-request__btn"
                      onClick={() => onAccept?.(gig.id)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost schedule-overview-request__btn"
                      onClick={() => onDecline?.(gig.id)}
                    >
                      Decline
                    </button>
                  </>
                ) : status === 'accepted' ? (
                  <p className="schedule-overview-request__status-note muted">Accepted</p>
                ) : (
                  <>
                    <p className="schedule-overview-request__status-note muted">Declined</p>
                    <button
                      type="button"
                      className="btn btn--ghost schedule-overview-request__btn"
                      onClick={() => onUndoDecline?.(gig.id)}
                    >
                      Undo decline
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn--ghost schedule-overview-request__delete"
                  onClick={() => onDelete?.(gig)}
                  aria-label={`Delete ${gig.familyName || 'gig'} request`}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
