const KEY = 'nanny-bookings-v1'

export function loadBookings() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveBookings(bookings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bookings))
  } catch {
    /* ignore */
  }
}
