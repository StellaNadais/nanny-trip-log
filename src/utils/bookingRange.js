import { addDays, toISODateLocal } from './dates'

/** End calendar day for a booking (same as start when omitted — legacy rows). */
export function getCareEndDateISO(b) {
  const end = b?.careEndDateISO
  if (end && typeof end === 'string') return end
  return b?.dateISO ?? ''
}

/** True when end datetime is after start datetime (local). */
export function careIntervalValid(startISO, startHM, endISO, endHM) {
  if (!startISO || !endISO || !startHM || !endHM) return false
  const t0 = new Date(`${startISO}T${startHM}:00`).getTime()
  const t1 = new Date(`${endISO}T${endHM}:00`).getTime()
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return false
  return t1 > t0
}

/** ISO dates (inclusive) from start day through end day for calendar dots. */
export function expandBookingCalendarDates(b) {
  const start = b?.dateISO
  const end = getCareEndDateISO(b)
  if (!start || !end) return []
  const out = []
  let d = new Date(`${start}T12:00:00`)
  const endD = new Date(`${end}T12:00:00`)
  if (d > endD) return [start]
  while (d <= endD) {
    out.push(toISODateLocal(d))
    d = addDays(d, 1)
  }
  return out
}

export function bookingEndMs(b) {
  const d = getCareEndDateISO(b)
  const t = b?.careEnd || '23:59'
  return new Date(`${d}T${t}:00`).getTime()
}

function fmtTime(hm) {
  if (!hm || typeof hm !== 'string') return ''
  const [h, m] = hm.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hm
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtShortDate(iso) {
  if (!iso) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** One line for schedule / lists: includes dates when care spans multiple calendar days. */
export function formatCareBookingWindow(b) {
  if (!b?.careStart || !b?.careEnd) return null
  const endISO = getCareEndDateISO(b)
  const t0 = fmtTime(b.careStart)
  const t1 = fmtTime(b.careEnd)
  if (!t0 || !t1) return null
  if (b.dateISO === endISO) {
    return `${t0} – ${t1}`
  }
  return `${fmtShortDate(b.dateISO)}, ${t0} – ${fmtShortDate(endISO)}, ${t1}`
}
