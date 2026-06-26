import { useCallback, useEffect, useState } from 'react'
import {
  createParentReminder,
  loadParentReminders,
  saveParentReminders,
} from '../utils/parentRemindersStorage'
import { ParentRemindersContext } from './parentRemindersContext'

export function ParentRemindersProvider({ children }) {
  const [reminders, setReminders] = useState(() => loadParentReminders())

  useEffect(() => {
    saveParentReminders(reminders)
  }, [reminders])

  const addReminder = useCallback((payload) => {
    const row = createParentReminder(payload)
    if (!row) return null
    setReminders((prev) => [row, ...prev])
    return row
  }, [])

  const addRemindersForBooking = useCallback((bookingId, rows) => {
    const created = []
    for (const row of rows) {
      const next = createParentReminder({ ...row, bookingId })
      if (next) created.push(next)
    }
    if (!created.length) return []
    setReminders((prev) => [...created, ...prev])
    return created
  }, [])

  const removeReminder = useCallback((id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const value = { reminders, addReminder, addRemindersForBooking, removeReminder }

  return (
    <ParentRemindersContext.Provider value={value}>{children}</ParentRemindersContext.Provider>
  )
}
