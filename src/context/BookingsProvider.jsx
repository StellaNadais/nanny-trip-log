import { useCallback, useEffect, useState } from 'react'
import { loadBookings, saveBookings } from '../utils/bookingsStorage'
import { BookingsContext } from './bookingsContext'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(() => loadBookings())

  useEffect(() => {
    saveBookings(bookings)
  }, [bookings])

  const addBooking = useCallback((payload) => {
    setBookings((prev) => [
      {
        id: newId(),
        createdAt: new Date().toISOString(),
        ...payload,
      },
      ...prev,
    ])
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
