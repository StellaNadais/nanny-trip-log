import { useCallback, useEffect, useState } from 'react'
import { loadKidJournalEntries, saveKidJournalEntries } from '../utils/kidJournalStorage'
import { KidJournalContext } from './kidJournalContext'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function KidJournalProvider({ children }) {
  const [entries, setEntries] = useState(() => loadKidJournalEntries())

  useEffect(() => {
    saveKidJournalEntries(entries)
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
    <KidJournalContext.Provider value={value}>{children}</KidJournalContext.Provider>
  )
}
