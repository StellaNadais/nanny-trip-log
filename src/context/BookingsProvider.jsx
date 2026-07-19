import { useCallback, useEffect, useState } from 'react'
import { BOOKINGS_STORAGE_KEY, loadBookings, saveBookings } from '../utils/bookingsStorage'
import { BookingsContext } from './bookingsContext'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(() => loadBookings())

  useEffect(() => {
    saveBookings(bookings)
  }, [bookings])

  useEffect(() => {
    function syncBookings(event) {
      if (event.key !== BOOKINGS_STORAGE_KEY) return
      setBookings(loadBookings())
    }

    window.addEventListener('storage', syncBookings)
    return () => window.removeEventListener('storage', syncBookings)
  }, [])

  const addBooking = useCallback((payload) => {
    const booking = {
      id: newId(),
      createdAt: new Date().toISOString(),
      responseStatus: 'pending',
      ...payload,
    }
    setBookings((prev) => [booking, ...prev])
    return booking
  }, [])

  const removeBooking = useCallback((id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const patchBooking = useCallback((id, updates) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const next = { ...b, ...updates }
        if (Object.prototype.hasOwnProperty.call(updates, 'responseStatus') && updates.responseStatus === undefined) {
          delete next.responseStatus
        }
        return next
      })
    )
  }, [])

  const value = { bookings, addBooking, removeBooking, patchBooking }

  return (
    <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
  )
}
