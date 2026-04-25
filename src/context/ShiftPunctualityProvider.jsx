import { useCallback, useEffect, useState } from 'react'
import { loadShiftEntries, saveShiftEntries } from '../utils/shiftStorage'
import {
  countByKindYear,
  loadTimeOffEntries,
  MAX_SICK_DAYS_PER_YEAR,
  MAX_VACATION_DAYS_PER_YEAR,
  saveTimeOffEntries,
  yearFromIso,
} from '../utils/timeOffStorage'
import { ShiftPunctualityContext } from './shiftPunctualityContext'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ShiftPunctualityProvider({ children }) {
  const [entries, setEntries] = useState(() => loadShiftEntries())
  const [timeOffEntries, setTimeOffEntries] = useState(() => loadTimeOffEntries())

  useEffect(() => {
    saveShiftEntries(entries)
  }, [entries])

  useEffect(() => {
    saveTimeOffEntries(timeOffEntries)
  }, [timeOffEntries])

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

  /**
   * @returns {string | null} error message, or null on success
   */
  const addTimeOffEntry = useCallback((payload) => {
    let err = null
    setTimeOffEntries((prev) => {
      const year = yearFromIso(payload.dateISO)
      if (prev.some((e) => e.dateISO === payload.dateISO && e.kind === payload.kind)) {
        err = 'That date is already logged for this type.'
        return prev
      }
      const vac = countByKindYear(prev, year, 'vacation')
      const sick = countByKindYear(prev, year, 'sick')
      if (payload.kind === 'vacation' && vac >= MAX_VACATION_DAYS_PER_YEAR) {
        err = `Paid vacation limit reached (${MAX_VACATION_DAYS_PER_YEAR} days per year) for ${year}.`
        return prev
      }
      if (payload.kind === 'sick' && sick >= MAX_SICK_DAYS_PER_YEAR) {
        err = `Paid sick days limit reached (${MAX_SICK_DAYS_PER_YEAR} days per year) for ${year}.`
        return prev
      }
      return [
        {
          id: newId(),
          savedAt: new Date().toISOString(),
          dateISO: payload.dateISO,
          kind: payload.kind,
        },
        ...prev,
      ]
    })
    return err
  }, [])

  const removeTimeOffEntry = useCallback((id) => {
    setTimeOffEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const value = { entries, addEntry, timeOffEntries, addTimeOffEntry, removeTimeOffEntry }

  return (
    <ShiftPunctualityContext.Provider value={value}>
      {children}
    </ShiftPunctualityContext.Provider>
  )
}
