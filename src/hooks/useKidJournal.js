import { useContext } from 'react'
import { KidJournalContext } from '../context/kidJournalContext'

export function useKidJournal() {
  const ctx = useContext(KidJournalContext)
  if (!ctx) {
    throw new Error('useKidJournal must be used within KidJournalProvider')
  }
  return ctx
}
