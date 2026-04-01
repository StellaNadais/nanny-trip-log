import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { loadState, saveState } from '../utils/storage'

function emptyDay() {
  return {
    tripLog: '',
    notes: '',
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const defaultWeekMeta = { scheduleLine: '', childrenNames: 'Harper, Poppy' }

function readInitial() {
  const saved = loadState()
  const weekStart = saved?.lastWeekKey
    ? startOfWeekMonday(new Date(saved.lastWeekKey + 'T12:00:00'))
    : startOfWeekMonday(new Date())
  return {
    weekStart,
    weekMeta: saved?.weekMeta
      ? { ...defaultWeekMeta, ...saved.weekMeta }
      : defaultWeekMeta,
    daysByIso:
      saved?.daysByIso && typeof saved.daysByIso === 'object'
        ? saved.daysByIso
        : {},
    expenses: Array.isArray(saved?.expenses) ? saved.expenses : [],
  }
}

export function useTripLog() {
  const initial = useMemo(() => readInitial(), [])

  const [weekStart, setWeekStart] = useState(initial.weekStart)
  const [weekMeta, setWeekMeta] = useState(initial.weekMeta)
  const [daysByIso, setDaysByIso] = useState(initial.daysByIso)
  const [expenses, setExpenses] = useState(initial.expenses)

  const weekKey = useMemo(() => toISODateLocal(weekStart), [weekStart])

  useEffect(() => {
    saveState({
      weekMeta,
      daysByIso,
      expenses,
      lastWeekKey: weekKey,
    })
  }, [weekMeta, daysByIso, expenses, weekKey])

  const ensureDay = useCallback((iso) => {
    setDaysByIso((prev) => {
      if (prev[iso]) return prev
      return { ...prev, [iso]: emptyDay() }
    })
  }, [])

  const updateDay = useCallback((iso, patch) => {
    setDaysByIso((prev) => ({
      ...prev,
      [iso]: { ...emptyDay(), ...prev[iso], ...patch },
    }))
  }, [])

  const shiftWeek = useCallback((delta) => {
    setWeekStart((w) => addDays(w, delta * 7))
  }, [])

  const setWeekFromPicker = useCallback((isoDateString) => {
    if (!isoDateString) return
    const d = new Date(isoDateString + 'T12:00:00')
    setWeekStart(startOfWeekMonday(d))
  }, [])

  const addExpense = useCallback((label, amountStr) => {
    const labelTrim = label.trim()
    const n = parseFloat(amountStr)
    if (!labelTrim || Number.isNaN(n)) return
    setExpenses((prev) => [
      ...prev,
      { id: uid(), label: labelTrim, amount: n },
    ])
  }, [])

  const removeExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return {
    weekStart,
    weekKey,
    weekMeta,
    setWeekMeta,
    daysByIso,
    ensureDay,
    updateDay,
    shiftWeek,
    setWeekFromPicker,
    expenses,
    addExpense,
    removeExpense,
  }
}
