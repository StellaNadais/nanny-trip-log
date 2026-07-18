import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  loadReceiptSettings,
  saveReceiptSettings,
  notifyReceiptMileageUpdated,
  RECEIPT_MILEAGE_EVENT,
} from '../utils/receiptStorage'
import {
  loadOutingsPlaces,
  saveOutingsPlaces,
  notifyOutingsUpdated,
  OUTINGS_UPDATED_EVENT,
} from '../utils/outingsStorage'
import { refreshAllTripMileageCache } from '../utils/refreshTripMileageCache'

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function emptyExtras() {
  return { photos: [], manualLines: [] }
}

export function useOutingsWeekData(weekKey) {
  const [extras, setExtras] = useState(emptyExtras)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualCat, setManualCat] = useState('parking_ticket')
  const [manualAmt, setManualAmt] = useState('')
  const [manualNote, setManualNote] = useState('')
  const [mileageRev, setMileageRev] = useState(0)
  const [customPlaces, setCustomPlaces] = useState(() => loadOutingsPlaces())
  const [placeNickname, setPlaceNickname] = useState('')
  const [placeMiles, setPlaceMiles] = useState('')
  const [placeTripKind, setPlaceTripKind] = useState('roundTrip')
  const [placeFormErr, setPlaceFormErr] = useState('')

  useEffect(() => {
    setManualOpen(false)
  }, [weekKey])

  useEffect(() => {
    const bump = () => setMileageRev((r) => r + 1)
    window.addEventListener(RECEIPT_MILEAGE_EVENT, bump)
    return () => window.removeEventListener(RECEIPT_MILEAGE_EVENT, bump)
  }, [])

  useEffect(() => {
    const sync = () => setCustomPlaces(loadOutingsPlaces())
    window.addEventListener(OUTINGS_UPDATED_EVENT, sync)
    return () => window.removeEventListener(OUTINGS_UPDATED_EVENT, sync)
  }, [])

  const commitCustomPlaces = useCallback((next) => {
    saveOutingsPlaces(next)
    setCustomPlaces(next)
    notifyOutingsUpdated()
    refreshAllTripMileageCache()
  }, [])

  useEffect(() => {
    const s = loadReceiptSettings()
    const row = s.extrasByWeek?.[weekKey]
    setExtras(
      row && Array.isArray(row.photos) && Array.isArray(row.manualLines)
        ? { photos: row.photos, manualLines: row.manualLines }
        : emptyExtras()
    )
  }, [weekKey, mileageRev])

  const commitExtras = useCallback(
    (updater) => {
      setExtras((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        const cur = loadReceiptSettings()
        saveReceiptSettings({
          extrasByWeek: { ...cur.extrasByWeek, [weekKey]: next },
        })
        notifyReceiptMileageUpdated()
        return next
      })
    },
    [weekKey]
  )

  const manualTotal = useMemo(
    () =>
      extras.manualLines.reduce((s, row) => s + (Number.isFinite(row.amount) ? row.amount : 0), 0),
    [extras.manualLines]
  )

  const expensesPreview = useMemo(() => {
    if (!extras.manualLines.length) return ''
    if (extras.manualLines.length === 1) {
      const line = extras.manualLines[0]
      return `$${Number(line.amount).toFixed(2)} this week`
    }
    return `$${manualTotal.toFixed(2)} · ${extras.manualLines.length} items`
  }, [extras.manualLines, manualTotal])

  const locationsPreview = useMemo(() => {
    if (!customPlaces.length) return ''
    return customPlaces
      .slice(0, 3)
      .map((p) => p.label)
      .join(', ')
  }, [customPlaces])

  const outingsPreview = useMemo(() => {
    if (expensesPreview) return expensesPreview
    if (locationsPreview) return locationsPreview
    return ''
  }, [expensesPreview, locationsPreview])

  const outingsCount = extras.manualLines.length

  function addManualLine(e) {
    e.preventDefault()
    const amt = parseFloat(manualAmt)
    if (!Number.isFinite(amt) || amt < 0) return
    commitExtras((prev) => ({
      ...prev,
      manualLines: [
        ...prev.manualLines,
        {
          id: uid(),
          category: manualCat,
          note: manualNote.trim(),
          amount: Math.round(amt * 100) / 100,
        },
      ],
    }))
    setManualAmt('')
    setManualNote('')
    setManualOpen(false)
  }

  function removeManualLine(id) {
    commitExtras((prev) => ({
      ...prev,
      manualLines: prev.manualLines.filter((m) => m.id !== id),
    }))
  }

  function addCustomPlace(e) {
    e.preventDefault()
    const nick = placeNickname.trim()
    const miles = parseFloat(String(placeMiles).replace(',', '.'))
    if (!nick) {
      setPlaceFormErr('Enter a nickname only — no street addresses.')
      return
    }
    if (!Number.isFinite(miles) || miles < 0) {
      setPlaceFormErr('Enter miles (0 or more).')
      return
    }
    const rounded = Math.round(miles * 100) / 100
    setPlaceFormErr('')
    commitCustomPlaces([
      ...customPlaces,
      {
        id: uid(),
        label: nick,
        nickname: '',
        ...(placeTripKind === 'oneWay'
          ? { milesOneWay: rounded }
          : { milesRoundTrip: rounded }),
      },
    ])
    setPlaceNickname('')
    setPlaceMiles('')
  }

  function removeCustomPlace(id) {
    commitCustomPlaces(customPlaces.filter((p) => p.id !== id))
  }

  const resetOutingsForm = useCallback(() => {
    setManualOpen(false)
  }, [])

  return {
    extras,
    manualOpen,
    setManualOpen,
    manualCat,
    setManualCat,
    manualAmt,
    setManualAmt,
    manualNote,
    setManualNote,
    manualTotal,
    customPlaces,
    placeNickname,
    setPlaceNickname,
    placeMiles,
    setPlaceMiles,
    placeTripKind,
    setPlaceTripKind,
    placeFormErr,
    expensesPreview,
    locationsPreview,
    outingsPreview,
    outingsCount,
    addManualLine,
    removeManualLine,
    addCustomPlace,
    removeCustomPlace,
    resetOutingsForm,
  }
}
