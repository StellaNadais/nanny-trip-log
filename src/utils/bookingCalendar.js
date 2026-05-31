/** Bookings that still occupy calendar dates (pending + accepted). Declined frees those dates. */
export function bookingOccupiesCalendarSlot(b) {
  return b.responseStatus !== 'declined'
}
