import { expandBookingCalendarDates, formatCareBookingWindow } from './bookingRange'
import { formatBookingChildrenLabel } from './bookingChildren'

/** Non-declined bookings that cover a calendar day. */
export function bookingsForCareDate(bookings, dateISO) {
  if (!dateISO) return []
  return bookings.filter(
    (b) =>
      b.responseStatus !== 'declined' &&
      b.dateISO &&
      expandBookingCalendarDates(b).includes(dateISO)
  )
}

function careKidsLabel(booking) {
  return formatBookingChildrenLabel(booking) || 'Children'
}

function bookingStatusLabel(booking) {
  if (booking.responseStatus === 'accepted') return 'Confirmed'
  if (booking.responseStatus === 'declined') return 'Declined'
  return 'Pending'
}

/**
 * Reminders and booking notes grouped by family for one journal day.
 * @returns {{ booking: object, kidsLabel: string, statusLabel: string, careWindow: string|null, notes: string, reminders: object[] }[]}
 */
export function careDayReminderGroups(reminders, bookings, dateISO) {
  const careBookings = bookingsForCareDate(bookings, dateISO)
  const bookingIds = new Set(careBookings.map((b) => b.id))
  const dayReminders = reminders.filter((r) => r.dateISO === dateISO)

  const groups = careBookings
    .map((booking) => {
      const groupReminders = dayReminders
        .filter((r) => r.bookingId === booking.id)
        .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
      const notes = String(booking.notes || '').trim()
      return {
        booking,
        kidsLabel: careKidsLabel(booking),
        statusLabel: bookingStatusLabel(booking),
        careWindow: formatCareBookingWindow(booking),
        notes,
        reminders: groupReminders,
      }
    })
    .filter((g) => g.reminders.length > 0 || g.notes)

  const unmatched = dayReminders
    .filter((r) => !r.bookingId || !bookingIds.has(r.bookingId))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))

  if (unmatched.length) {
    groups.push({
      booking: { id: '__parent-notes__', familyName: 'Family notes', responseStatus: '' },
      kidsLabel: '',
      statusLabel: '',
      careWindow: null,
      notes: '',
      reminders: unmatched,
    })
  }

  return groups
}

export function countRemindersForCareDate(reminders, _bookings, dateISO) {
  if (!dateISO) return 0
  return reminders.filter((r) => r.dateISO === dateISO).length
}
