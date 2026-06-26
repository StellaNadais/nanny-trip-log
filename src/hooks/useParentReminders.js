import { useContext } from 'react'
import { ParentRemindersContext } from '../context/parentRemindersContext'

export function useParentReminders() {
  const ctx = useContext(ParentRemindersContext)
  if (!ctx) {
    throw new Error('useParentReminders must be used within ParentRemindersProvider')
  }
  return ctx
}
