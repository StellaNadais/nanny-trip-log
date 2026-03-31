import { useContext } from 'react'
import { ShiftPunctualityContext } from '../context/shiftPunctualityContext'

export function useShiftPunctuality() {
  const ctx = useContext(ShiftPunctualityContext)
  if (!ctx) {
    throw new Error('useShiftPunctuality must be used within ShiftPunctualityProvider')
  }
  return ctx
}
