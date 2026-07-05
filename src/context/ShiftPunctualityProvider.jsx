import { useCallback, useEffect, useState } from 'react'
import { loadShiftEntries, saveShiftEntries } from '../utils/shiftStorage'
import { ShiftPunctualityContext } from './shiftPunctualityContext'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ShiftPunctualityProvider({ children }) {
  const [entries, setEntries] = useState(() => loadShiftEntries())

  useEffect(() => {
    saveShiftEntries(entries)
  }, [entries])

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

  /** Merge arrival/end for the same calendar day (clock-in and clock-out at real time). */
  const upsertShiftDay = useCallback((partial) => {
    const { dateISO, arrival, end } = partial
    if (!dateISO) return
    setEntries((prev) => {
      const i = prev.findIndex((e) => e.dateISO === dateISO)
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
