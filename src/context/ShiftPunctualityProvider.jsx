import { useCallback, useEffect, useState } from 'react'
import { loadShiftEntries, saveShiftEntries } from '../utils/shiftStorage'
import { CLOUD_DATA_APPLIED_EVENT } from '../utils/cloudSync'
import { ShiftPunctualityContext } from './shiftPunctualityContext'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ShiftPunctualityProvider({ children }) {
  const [entries, setEntries] = useState(() => loadShiftEntries())

  useEffect(() => {
    saveShiftEntries(entries)
  }, [entries])

  useEffect(() => {
    const refreshEntries = () => setEntries(loadShiftEntries())
    window.addEventListener(CLOUD_DATA_APPLIED_EVENT, refreshEntries)
    return () => window.removeEventListener(CLOUD_DATA_APPLIED_EVENT, refreshEntries)
  }, [])

  const addEntry = useCallback((payload) => {
    setEntries((prev) => [
      {
        id: newId(),
        savedAt: new Date().toISOString(),
        ...payload,
      },
      ...prev,
    ])
  }, [])

  /** Merge arrival/end for the same calendar day (optionally per booking). */
  const upsertShiftDay = useCallback((partial) => {
    const { dateISO, bookingId, arrival, end } = partial
    if (!dateISO) return
    const bid = bookingId ?? ''
    setEntries((prev) => {
      const i = prev.findIndex((e) => e.dateISO === dateISO && (e.bookingId ?? '') === bid)
      const savedAt = new Date().toISOString()
      if (i >= 0) {
        const row = { ...prev[i], savedAt }
        if (arrival !== undefined) row.arrival = arrival
        if (end !== undefined) row.end = end
        const next = [...prev]
        next[i] = row
        return next
      }
      return [
        {
          id: newId(),
          savedAt,
          dateISO,
          ...(bookingId ? { bookingId } : {}),
          arrival: arrival ?? '',
          end: end ?? '',
        },
        ...prev,
      ]
    })
  }, [])

  const value = { entries, addEntry, upsertShiftDay }

  return (
    <ShiftPunctualityContext.Provider value={value}>
      {children}
    </ShiftPunctualityContext.Provider>
  )
}
