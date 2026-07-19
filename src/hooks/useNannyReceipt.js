import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  loadReceiptSettings,
  saveReceiptSettings,
  RECEIPT_MILEAGE_EVENT,
} from '../utils/receiptStorage'
import { formatWeekRange, startOfWeekMonday, toISODateLocal } from '../utils/dates'
import { MILE_RATE } from '../data/tripPlaces'
import {
  buildWeekSummaryText,
  downloadTextFile,
  weekSummaryFilename,
} from '../utils/buildWeekSummaryText'
import { categoryLabel } from '../data/receiptManualCategories'
import { useBookings } from './useBookings'
import {
  bookingOvernightNightCount,
  expandBookingCalendarDates,
} from '../utils/bookingRange'
import { EXTRA_CHILD_PER_HOUR, HOURLY_RATE, OVERNIGHT_RATE } from '../data/bookingRates'
import { isWeeklyReceiptBusinessHours } from '../utils/receiptWindowMode'

const BASE_RATE = HOURLY_RATE

function normalizeVenmo(s) {
  return String(s || '')
    .trim()
    .replace(/^@/, '')
}

function ratePerHour(numChildren) {
  const n = Math.max(1, Math.floor(Number(numChildren)) || 1)
  return BASE_RATE + EXTRA_CHILD_PER_HOUR * Math.max(0, n - 1)
}

function buildVenmoUrl(handle, amount, note) {
  const user = normalizeVenmo(handle)
  if (!user) return ''
  const amt = Number(amount)
  if (!Number.isFinite(amt) || amt <= 0) return ''
  const params = new URLSearchParams({
    txn: 'pay',
    amount: amt.toFixed(2),
    note: note.slice(0, 200),
  })
  return `https://venmo.com/${encodeURIComponent(user)}?${params.toString()}`
}

const SMS_BODY_MAX = 2800

function buildForwardReceiptSmsHref(receiptText, venmoUrl, venmoHandle) {
  const receipt = String(receiptText || '').trim()
  const handle = venmoUrl ? normalizeVenmo(venmoHandle) : ''
  const footer = venmoUrl
    ? `\n\n────────\nTap to pay on Venmo:\n${venmoUrl}${handle ? `\n@${handle}` : ''}`
    : ''
  const reserve = footer.length + 40
  const maxReceipt = Math.max(200, SMS_BODY_MAX - reserve)
  let main = receipt
  if (main.length > maxReceipt) {
    main = `${main.slice(0, maxReceipt).trimEnd()}\n…(trimmed for text — open app for full receipt)`
  }
  const body = main + footer
  return `sms:?body=${encodeURIComponent(body)}`
}

function emptyExtras() {
  return { photos: [], manualLines: [] }
}

export function useNannyReceipt() {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramGig = searchParams.get('gigDate')
  const gigReceiptMode = !isWeeklyReceiptBusinessHours(new Date())
  const { bookings } = useBookings()

  const initialSettings = useMemo(() => loadReceiptSettings(), [])
  const [venmoHandle, setVenmoHandle] = useState(initialSettings.venmoHandle)
  const [hours, setHours] = useState(initialSettings.hours ?? '45')
  const [numChildren, setNumChildren] = useState(initialSettings.numChildren ?? '1')
  const [weekOf, setWeekOf] = useState(
    () =>
      initialSettings.weekOf ||
      toISODateLocal(startOfWeekMonday(new Date()))
  )
  const [gigDateISO, setGigDateISO] = useState(() => {
    if (paramGig && /^\d{4}-\d{2}-\d{2}$/.test(paramGig)) return paramGig
    return toISODateLocal(new Date())
  })
  const [overnightNights, setOvernightNights] = useState('0')
  const [mileageRev, setMileageRev] = useState(0)
  const [extras, setExtras] = useState(emptyExtras)
  const [printedAt, setPrintedAt] = useState(() => new Date().toLocaleString())

  const receiptWeekKey = useMemo(
    () => toISODateLocal(startOfWeekMonday(new Date(weekOf + 'T12:00:00'))),
    [weekOf]
  )

  useEffect(() => {
    if (!gigReceiptMode) return
    const mon = toISODateLocal(startOfWeekMonday(new Date(gigDateISO + 'T12:00:00')))
    setWeekOf(mon)
  }, [gigReceiptMode, gigDateISO])

  const matchedGig = useMemo(() => {
    if (!gigReceiptMode || !gigDateISO) return null
    return (
      bookings.find(
        (b) =>
          b.responseStatus === 'accepted' &&
          b.dateISO &&
          expandBookingCalendarDates(b).includes(gigDateISO)
      ) ?? null
    )
  }, [bookings, gigReceiptMode, gigDateISO])

  useEffect(() => {
    if (!gigReceiptMode) return
    setOvernightNights(
      matchedGig ? String(bookingOvernightNightCount(matchedGig)) : '0'
    )
  }, [gigReceiptMode, gigDateISO, matchedGig?.id])

  useEffect(() => {
    const bump = () => setMileageRev((r) => r + 1)
    window.addEventListener(RECEIPT_MILEAGE_EVENT, bump)
    return () => window.removeEventListener(RECEIPT_MILEAGE_EVENT, bump)
  }, [])

  useEffect(() => {
    const s = loadReceiptSettings()
    const row = s.extrasByWeek?.[receiptWeekKey]
    setExtras(
      row && Array.isArray(row.photos) && Array.isArray(row.manualLines)
        ? { photos: row.photos, manualLines: row.manualLines }
        : emptyExtras()
    )
  }, [receiptWeekKey, mileageRev])

  const mileageEntry = useMemo(() => {
    return loadReceiptSettings().mileageByWeek?.[receiptWeekKey] ?? null
  }, [receiptWeekKey, mileageRev])

  const h = parseFloat(hours)
  const hoursValid = Number.isFinite(h) && h > 0
  const n = Math.max(1, Math.floor(parseInt(numChildren, 10) || 1))
  const rate = ratePerHour(n)
  const extraKids = Math.max(0, n - 1)

  const lineBase = hoursValid ? BASE_RATE * h : 0
  const lineExtra = hoursValid ? EXTRA_CHILD_PER_HOUR * extraKids * h : 0
  const laborTotal = hoursValid ? rate * h : 0
  const mileReimb = mileageEntry?.reimbursement ?? 0
  const manualTotal = useMemo(
    () =>
      extras.manualLines.reduce((s, row) => s + (Number.isFinite(row.amount) ? row.amount : 0), 0),
    [extras.manualLines]
  )
  const overnightNum = Math.max(0, parseInt(overnightNights, 10) || 0)
  const overnightTotal = gigReceiptMode ? overnightNum * OVERNIGHT_RATE : 0
  const combinedTotal = laborTotal + mileReimb + manualTotal + overnightTotal

  const weekLabel = useMemo(() => {
    try {
      return formatWeekRange(startOfWeekMonday(new Date(weekOf + 'T12:00:00')))
    } catch {
      return weekOf
    }
  }, [weekOf])

  const thermalMetaLine = useMemo(() => {
    if (!gigReceiptMode) return weekLabel
    try {
      const gd = new Date(gigDateISO + 'T12:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return `Gig date: ${gd}`
    } catch {
      return `Gig date: ${gigDateISO}`
    }
  }, [gigReceiptMode, weekLabel, gigDateISO])

  const tapeSubtitle = gigReceiptMode
    ? 'Nanny care · register tape'
    : 'Weekly nanny care · register tape'

  const noteText = useMemo(() => {
    if (!gigReceiptMode) return `Nanny gigs — week of ${weekLabel}`
    try {
      const gd = new Date(gigDateISO + 'T12:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return `Nanny gig — ${gd}`
    } catch {
      return `Nanny gig — ${gigDateISO}`
    }
  }, [gigReceiptMode, weekLabel, gigDateISO])

  const venmoUrl = useMemo(
    () => buildVenmoUrl(venmoHandle, combinedTotal, noteText),
    [venmoHandle, combinedTotal, noteText]
  )

  const receiptText = useMemo(() => {
    const head = gigReceiptMode
      ? [`Gig date: ${gigDateISO}`, `Mileage & extras week: ${weekLabel}`]
      : [`Week: ${weekLabel}`]
    const lines = [...head, ``, `Children: ${n}`, ``]
    if (hoursValid) {
      lines.push(`$${BASE_RATE}/hr × ${h} hr (base) = $${lineBase.toFixed(2)}`)
      if (extraKids > 0) {
        lines.push(
          `+$${EXTRA_CHILD_PER_HOUR}/hr × ${extraKids} extra child${extraKids === 1 ? '' : 'ren'} × ${h} hr = $${lineExtra.toFixed(2)}`
        )
      }
    }
    lines.push(``, `Gig wages subtotal: $${laborTotal.toFixed(2)}`)
    if (gigReceiptMode && overnightTotal > 0) {
      lines.push(
        `Overnight at family’s house: ${overnightNum} night${overnightNum === 1 ? '' : 's'} × $${OVERNIGHT_RATE} = $${overnightTotal.toFixed(2)}`
      )
    }
    if (mileageEntry && mileReimb > 0) {
      lines.push(
        `Mileage (trip log): ${mileageEntry.totalMiles.toFixed(1)} mi × $${MILE_RATE}/mi = $${mileReimb.toFixed(2)}`
      )
    }
    if (extras.manualLines.length > 0) {
      lines.push(``)
      for (const m of extras.manualLines) {
        const tail = m.note ? ` — ${m.note}` : ''
        lines.push(`${categoryLabel(m.category)}${tail}: $${Number(m.amount).toFixed(2)}`)
      }
      lines.push(`Reimbursements subtotal: $${manualTotal.toFixed(2)}`)
    }
    if (extras.photos.length > 0) {
      lines.push(`Receipt photos on file: ${extras.photos.length}`)
    }
    lines.push(``, `Total due: $${combinedTotal.toFixed(2)}`)
    if (hoursValid) {
      lines.push(``, `Effective rate (wage only): $${rate.toFixed(2)}/hr`)
    }
    if (normalizeVenmo(venmoHandle)) {
      lines.push(``, `Pay: Venmo @${normalizeVenmo(venmoHandle)}`)
    }
    return lines.join('\n')
  }, [
    gigReceiptMode,
    gigDateISO,
    weekLabel,
    overnightNum,
    overnightTotal,
    n,
    hoursValid,
    h,
    lineBase,
    lineExtra,
    extraKids,
    laborTotal,
    rate,
    mileageEntry,
    mileReimb,
    combinedTotal,
    venmoHandle,
    extras.manualLines,
    extras.photos.length,
    manualTotal,
  ])

  const forwardReceiptSmsHref = useMemo(
    () => buildForwardReceiptSmsHref(receiptText, venmoUrl, venmoHandle),
    [receiptText, venmoUrl, venmoHandle]
  )

  const thermalRows = useMemo(() => {
    const rows = []
    if (hoursValid) {
      rows.push({ desc: `Gigs @ $${BASE_RATE}/hr × ${h}h`, amt: `$${lineBase.toFixed(2)}` })
      if (extraKids > 0) {
        rows.push({
          desc: `Extra kids +$${EXTRA_CHILD_PER_HOUR}/hr × ${extraKids} × ${h}h`,
          amt: `$${lineExtra.toFixed(2)}`,
        })
      }
    } else {
      rows.push({ desc: 'Gig wages (add hours)', amt: '—' })
    }
    if (mileReimb > 0) {
      rows.push({
        desc: `Mileage ${mileageEntry?.totalMiles?.toFixed(1) ?? '?'} mi @ $${MILE_RATE}`,
        amt: `$${mileReimb.toFixed(2)}`,
      })
    }
    for (const m of extras.manualLines) {
      const note = m.note ? ` ${m.note}` : ''
      rows.push({
        desc: `${categoryLabel(m.category)}${note}`.trim(),
        amt: `$${Number(m.amount).toFixed(2)}`,
      })
    }
    if (gigReceiptMode && overnightTotal > 0) {
      rows.push({
        desc: `Overnight @ family’s (${overnightNum} nt × $${OVERNIGHT_RATE})`,
        amt: `$${overnightTotal.toFixed(2)}`,
      })
    }
    return rows
  }, [
    gigReceiptMode,
    overnightNum,
    overnightTotal,
    hoursValid,
    h,
    lineBase,
    extraKids,
    lineExtra,
    mileReimb,
    mileageEntry,
    extras.manualLines,
  ])

  const receiptFingerprint = useMemo(
    () =>
      [
        receiptWeekKey,
        gigDateISO,
        gigReceiptMode ? String(overnightNum) : '0',
        combinedTotal.toFixed(2),
        thermalRows.map((r) => `${r.desc}|${r.amt}`).join('\u00A6'),
        extras.photos.length,
        mileageRev,
      ].join('::'),
    [
      receiptWeekKey,
      gigDateISO,
      gigReceiptMode,
      overnightNum,
      combinedTotal,
      thermalRows,
      extras.photos.length,
      mileageRev,
    ]
  )

  useEffect(() => {
    setPrintedAt(new Date().toLocaleString())
  }, [receiptFingerprint])

  useEffect(() => {
    saveReceiptSettings({ hours, numChildren, weekOf })
  }, [hours, numChildren, weekOf])

  function persistVenmo(v) {
    setVenmoHandle(v)
    saveReceiptSettings({ venmoHandle: v })
  }

  function downloadWeekSummaryFile() {
    const body = buildWeekSummaryText({
      weekMondayIso: receiptWeekKey,
      weekLabel,
      receiptText,
    })
    downloadTextFile(weekSummaryFilename(receiptWeekKey), body)
  }

  const showVenmoActions = combinedTotal > 0

  return {
    gigReceiptMode,
    weekLabel,
    matchedGig,
    venmoHandle,
    persistVenmo,
    hours,
    setHours,
    numChildren,
    setNumChildren,
    weekOf,
    setWeekOf,
    gigDateISO,
    setGigDateISO: (v) => {
      setGigDateISO(v)
      if (v) setSearchParams({ gigDate: v }, { replace: true })
    },
    overnightNights,
    setOvernightNights,
    mileageEntry,
    thermalMetaLine,
    tapeSubtitle,
    printedAt,
    thermalRows,
    extras,
    combinedTotal,
    venmoUrl,
    forwardReceiptSmsHref,
    downloadWeekSummaryFile,
    showVenmoActions,
  }
}
