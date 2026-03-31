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

  const value = { entries, addEntry }

  return (
    <ShiftPunctualityContext.Provider value={value}>
      {children}
    </ShiftPunctualityContext.Provider>
  )
}
